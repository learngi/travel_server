const knex = require("../knex");
const config = require("../src/config");
const generator = require("generate-password");
const fs = require("fs");

const academics = [
  // get All Colleges, Courses, Branches, Year, Subjects, Sections
  {
    path: "/getAllData",
    method: "GET",
    config: {
      auth: {
        // strategy: "token"
        mode: "optional"
      }
    },
    handler: async request => {
      let reply = null;
      let collegeData = {};
      let allCoursesdata = [];
      const coursesData = {};
      const branchesData = {};
      const yearData = [];
      const subjectsData = [];
      const sectionsData = [];
      await knex
        .raw(
          `select c.id, c.college, c.full_name as fullname from  raghuerp_db.colleges c`
        )
        .then(async ([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No data is available"
            };
          } else {
            collegeData = data;
            coursesData["courses"] = [];
            branchesData["branches"] = [];
            await knex
              .raw(
                `select c.id as course_id, c.course, c.college, c.fullname from raghuerp_db.courses c`
              )
              .then(async ([res]) => {
                if (!res) {
                  reply = {
                    success: false,
                    message: "No courses data is available"
                  };
                } else {
                  allCoursesdata = res;
                  console.log("allCoursesdata", collegeData.length, res.length);
                  for (let i = 0; i < collegeData.length; i++) {
                    for (let j = 0; j < res.length; j++) {
                      if (res[j].college === collegeData[i].id) {
                        coursesData["courses"].push({
                          course_id: res[j].course_id,
                          course_name: res[j].course,
                          college_id: res[j].college
                        });
                      }
                    }
                    collegeData[i]["courses"] = coursesData["courses"];
                    coursesData["courses"] = [];
                  }
                  console.log("courseData", collegeData);
                  await knex
                    .raw(
                      `select b.id, b.branch, b.course, b.fullname from raghuerp_db.branches b `
                    )
                    .then(([res1]) => {
                      if (!res1) {
                        reply = {
                          success: false,
                          message: "No branches data is available"
                        };
                      } else {
                        for (let i = 0; i < collegeData.length; i++) {
                          for (
                            let j = 0;
                            j < collegeData[i].courses.length;
                            j++
                          ) {
                            for (let k = 0; k < res1.length; k++) {
                              if (
                                collegeData[i].courses[j].course_id ===
                                res1[k].course
                              ) {
                                branchesData["branches"].push({
                                  branch_id: res1[k].id,
                                  branch_name: res1[k].branch,
                                  course_id: res1[k].course,
                                  branchFullName: res1[k].fullname
                                });
                              }
                            }
                            collegeData[i].courses[j]["branches"] = branchesData["branches"];
                          branchesData["branches"] = [];
                          }
                        }
                      }
                    });
                }
              })
              .catch(err => {
                if (err) {
                  console.log("err", err);
                }
              });
            reply = {
              success: true,
              collegeData
            };
          }
        })
        .catch(err => {
          if (err) {
            console.log("err", err);
          }
        });
      return reply;
    }
  }
];
export default academics;
