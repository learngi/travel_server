// import knex from "../src/config/knex";
// import config from "../config";

const knex = require("../knex");
const config = require("../src/config");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const bcrypt = require("bcrypt");
const md5 = require("md5");

const moment = require("moment");

const routes = [
  // example code
  {
    path: "/test",
    method: "POST",
    config: {
      auth: {
        mode: "optional"
      }
    },
    handler: async request => {
      let reply = null;
      console.log("HELLO WORLD");
      reply = {
        success: true,
        message: "hello world"
      };
      return reply;
    }
  },

  // Authentication api
  {
    path: "/auth",
    method: "POST",
    config: {
      auth: {
        mode: "optional"
      }
    },
    handler: async request => {
      let reply = null;
      let userData;
      let token;
      console.log("request payload", request.payload);
      let { username, password } = request.payload;
      console.log(username, password, md5(password));
      password = md5(password);
      await knex
        .raw(
          `select count(*) as count from raghuerp_db.users where reg_no = '${username}' and password = '${password}'`
        )
        .then(async ([data]) => {
          if (data[0].count) {
            await knex
              .raw(
                `select u.reg_no, u.utype, s.firstname, s.role, s.dispname as name, s.designation, s.email, s.mobile, d.full_name as department, d.id as dept_id, c.college, c.id as college_id from raghuerp_db.users u inner join raghuerp_db.staff s on s.reg_no = u.reg_no inner join raghuerp_db.departments d on d.id = s.department inner join raghuerp_db.colleges c on c.id = s.college where u.reg_no = '${username}' `
              )
              .then(async ([usercount]) => {
                userData = usercount;
                console.log(usercount, password, usercount[0].password);
                // if (usercount.length > 0) {
                // }
                token = await jwt.sign(
                  {
                    id: usercount[0].id,
                    reg_no: usercount[0].reg_no,
                    success: "true",
                    token,
                    name: usercount[0].name,
                    email: usercount[0].email,
                    mobile: usercount[0].mobile,
                    role: usercount[0].role,
                    dept_id: usercount[0].dept_id
                  },
                  "vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy",
                  { algorithm: "HS256" }
                );
                console.log("1");
                console.log("token", token);
              });
            console.log("2");
            reply = {
              success: true,
              message: "Lpogin suceccsjk",
              data: userData,
              token
            };
          } else {
            reply = {
              success: false
            };
          }
        })
        .catch(err => {
          console.log("err", err);
        });
      console.log("3", reply);
      return reply;
    }
  },

  // get all colleges
  {
    path: "/getAllColleges",
    method: "GET",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      let collegeData;
      await knex.raw(`select * from raghuerp_db.colleges`).then(([data]) => {
        if (!data) {
          reply = {
            success: false,
            message: "No data is available"
          };
        } else {
          reply = {
            success: true,
            data
          };
        }
      });
      return reply;
    }
  },

  // get All Courses
  {
    path: "/getAllCourses/{college_id}",
    method: "GET",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      const { college_id } = request.params;
      await knex
        .raw(
          `select cour.id, cour.course, cour.college as college_id, c.college, cour.fullname from courses cour inner join colleges c on c.id = cour.college and c.status = 1 where cour.status = 1 and c.id = ${college_id}`
        )
        .then(async ([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No courses data is available"
            };
          } else {
            reply = {
              success: true,
              data
            };
          }
        });
      return reply;
    }
  },

  // get All Branches
  {
    path: "/getAllBranches/{course_id}",
    method: "GET",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      const { course_id } = request.params;
      await knex
        .raw(
          `select b.id, b.branch, b.course as course_id, cour.fullname as course, b.fullname,b.department as dept_id, d.full_name as department from branches b inner join courses cour on cour.id = b.course and cour.status = 1 inner join departments d on d.id = b.department and d.status = 1 where b.status = 1 and cour.id = ${course_id}`
        )
        .then(async ([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No department data is available"
            };
          } else {
            reply = {
              success: true,
              data
            };
          }
        });
      return reply;
    }
  },

  // get All years
  {
    path: "/getAllYears/{branch_id}",
    method: "GET",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      const { branch_id } = request.params;
      await knex
        .raw(
          `select y.id as year_id,y.year,y.branch as branch_id,b.fullname as branch from year y inner join branches b on b.id = y.branch and b.status = 1  where b.id = ${branch_id}`
        )
        .then(([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No years data is available"
            };
          } else {
            reply = {
              success: true,
              data
            };
          }
        });
      return reply;
    }
  },

  // get All Sections
  {
    path: "/getAllSections/{year_id}",
    method: "GET",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      const { year_id } = request.params;
      await knex
        .raw(
          `select s.id as section_id, s.section, s.year as year_id from sections s inner join year y on y.id = s.year where y.id = ${year_id}`
        )
        .then(([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No section data is available"
            };
          } else {
            reply = {
              success: true,
              data
            };
          }
        });
      return reply;
    }
  },

  // get ALL semesters
  {
    path: "/getAllSemesters/{year_id}",
    method: "GET",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      const { year_id } = request.params;
      await knex
        .raw(
          `select t.year_id, y.year, t.semister from raghuerp_timetable.year_subject t inner join raghuerp_db.year y on y.id = t.year_id where y.id= ${year_id}
            `
        )
        .then(([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No semester data is available"
            };
          } else {
            reply = {
              success: true,
              data
            };
          }
        });
      return reply;
    }
  },

  // get All Subjects
  {
    path: "/getAllSubjects/{sem_id}",
    method: "GET",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      const { sem_id } = request.params;
      await knex
        .raw(
          `select sub.id, sub.subject_name, sub.subject_code from raghuerp_timetable.subjects sub inner join raghuerp_timetable.subj_sems ss on ss.subject_id = sub.id where ss.semister_id = ${sem_id}`
        )
        .then(([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No subject data is available"
            };
          } else {
            reply = {
              success: true,
              data
            };
          }
        })
        .catch(err => {
          console.log("err", err);
        });
      return reply;
    }
  },

  // image upload

  {
    method: "POST",
    path: "/upload",
    config: {
      auth: {
        mode: "optional"
      },

      payload: {
        output: "stream",
        maxBytes: 10048576,
        parse: true,
        allow: "multipart/form-data",
        timeout: 110000
      }
    },

    handler: async request => {
      let res = null;
      const data = request.payload;
      const { image } = request.payload;

      // console.log('image', image, filename);

      const input = { image };
      // if file is present
      if (request.payload.file.hapi.filename) {
        const fileName = image;
        const extension = fileName.match(/\.(jpg|jpeg|png|gif)$/);
        // const rand = generator.generate({
        //   length: 5,
        //   numbers: false
        // });

        if (!extension) {
          res = {
            success: false,
            error: "Image"
          };
        }
        input.image = fileName;

        const path = config.upload_folder + fileName;
        const file = fs.createWriteStream(path);

        file.on("error", err => {
          console.log(err);
        });

        data.file.pipe(file);

        data.file.on("end", err => {
          if (err) {
            res = {
              success: false,
              message: "File upload failed, please try again"
            };
          }
        });
      }

      return res;
    }
  },

  // get Images
  {
    path: "/image/{image}",
    method: "GET",
    config: {
      auth: {
        mode: "optional"
      }
    },
    handler: async (request, h) =>
      h.file(config.upload_folder + request.params.image)
  }
];

export default routes;
