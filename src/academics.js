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
      const yearData = {};
      const semesterData = {};
      const subjectsData = [];
      const sectionsData = [];
      await knex
        .raw(
          `select c.id, c.college, c.full_name as fullname from  raghuerp_db.colleges c where c.status = 1`
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
            yearData["years"] = [];
            semesterData["semester"] = [];
            await knex
              .raw(
                `select c.id as course_id, c.course, c.college, c.fullname from raghuerp_db.courses c where c.status = 1`
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
                      `select b.id, b.branch, b.course, b.fullname from raghuerp_db.branches b where b.status = 1`
                    )
                    .then(async ([res1]) => {
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
                            collegeData[i].courses[j]["branches"] =
                              branchesData["branches"];
                            branchesData["branches"] = [];
                          }
                        }
                        await knex
                          .raw(
                            `select y.id as year_id, y.year, y.branch as branch_id from raghuerp_db.year y`
                          )
                          .then(async ([yearRes]) => {
                            if (!yearRes) {
                              reply = {
                                success: false,
                                message: "No year data is available"
                              };
                            } else {
                              // console.log("yeardata", yearRes);
                              for (let i = 0; i < collegeData.length; i++) {
                                for (
                                  let j = 0;
                                  j < collegeData[i].courses.length;
                                  j++
                                ) {
                                  for (
                                    let k = 0;
                                    k <
                                    collegeData[i].courses[j].branches.length;
                                    k++
                                  ) {
                                    for (let m = 0; m < yearRes.length; m++) {
                                      if (
                                        yearRes[m].branch_id ===
                                        collegeData[i].courses[j].branches[k]
                                          .branch_id
                                      ) {
                                        // console.log('test', yearRes[m].id);
                                        yearData["years"].push({
                                          year_id: yearRes[m].year_id,
                                          year: yearRes[m].year,
                                          branch_id: yearRes[m].branch_id
                                        });
                                      }
                                    }
                                    // console.log("yearData", yearData["years"]);
                                    collegeData[i].courses[j].branches[k][
                                      "years"
                                    ] =
                                      yearData["years"];
                                    yearData["years"] = [];
                                  }
                                }
                              }
                              // console.log("collegeData", collegeData);
                            }
                            await knex
                              .raw(
                                `select sem.id as sem_id, sem.year_id, sem.semister from raghuerp_timetable.year_subject sem`
                              )
                              .then(async ([semRes]) => {
                                if (!semRes) {
                                  reply = {
                                    success: false,
                                    message: "No semester data is available"
                                  };
                                } else {
                                  // console.log("semres", semRes);
                                  for (let i = 0; i < collegeData.length; i++) {
                                    for (
                                      let j = 0;
                                      j < collegeData[i].courses.length;
                                      j++
                                    ) {
                                      for (
                                        let k = 0;
                                        k <
                                        collegeData[i].courses[j].branches
                                          .length;
                                        k++
                                      ) {
                                        for (
                                          let m = 0;
                                          m <
                                          collegeData[i].courses[j].branches[k]
                                            .years.length;
                                          m++
                                        ) {
                                          for (
                                            let n = 0;
                                            n < semRes.length;
                                            n++
                                          ) {
                                            if (
                                              semRes[n].year_id ===
                                              collegeData[i].courses[j]
                                                .branches[k].years[m].year_id
                                            ) {
                                              semesterData["semester"].push({
                                                semester: semRes[n].semister,
                                                sem_id: semRes[n].sem_id,
                                                year_id: semRes[n].year_id
                                              });
                                            }
                                          }
                                          collegeData[i].courses[j].branches[
                                            k
                                          ].years[m]["semester"] =
                                            semesterData["semester"];
                                          semesterData["semester"] = [];
                                        }
                                      }
                                    }
                                  }
                                }
                                // await knex.raw(`select `)
                              });
                          });
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
