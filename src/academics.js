const knex = require("../knex");
const config = require("../src/config");
const generator = require("generate-password");
const fs = require("fs");
const _ = require("underscore");

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
      const collegeData = {};
      let allCoursesdata = [];
      const coursesData = {};
      const branchesData = {};
      const yearData = {};
      const semesterData = {};
      const subjectsData = {};
      const sectionsData = {};
      const departmentData = {};
      // collegeData["colleges"] = {};
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
            allCoursesdata = _.pluck(data, "id");
            // reply= {l:data,b: allCoursesdata}
            // return reply;

            console.log(allCoursesdata);
            // collegeData = data;
            data.forEach(element => {
              collegeData[element.id] = {
                id: element.id,
                college: element.college,
                fullname: element.fullname,
                courses: new Object()
              };
            });
            // console.log("collegedata", collegeData);
            coursesData["courses"] = [];
            branchesData["branches"] = [];
            yearData["years"] = [];
            semesterData["semester"] = [];
            subjectsData["subjects"] = [];
            sectionsData["sections"] = [];
            departmentData["departments"] = [];
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
                  const clgData = Object.keys(collegeData);
                  for (let i = 0; i < clgData.length; i++) {
                    collegeData[clgData[i]]["courses"] = {};
                    for (let j = 0; j < res.length; j++) {
                      console.log(
                        "id",
                        collegeData[clgData[i]].id,
                        res[j].college
                      );
                      if (res[j].college === collegeData[clgData[i]].id) {
                        collegeData[clgData[i]]["courses"][res[j].course_id] = {
                          course_id: res[j].course_id,
                          course_name: res[j].course,
                          college_id: res[j].college
                        };
                      }
                    }
                  }
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
                        console.log("collegeDta", clgData);
                        for (let i = 0; i < clgData.length; i++) {
                          const couData = Object.keys(
                            collegeData[clgData[i]].courses
                          );
                          for (let j = 0; j < couData.length; j++) {
                            collegeData[clgData[i]].courses[couData[j]][
                              "branches"
                            ] = {};
                            for (let k = 0; k < res1.length; k++) {
                              if (
                                collegeData[clgData[i]].courses[couData[j]]
                                  .course_id === res1[k].course
                              ) {
                                collegeData[clgData[i]].courses[couData[j]][
                                  "branches"
                                ][res1[k].id] = {
                                  branch_id: res1[k].id,
                                  branch_name: res1[k].branch,
                                  course_id: res1[k].course,
                                  branchFullName: res1[k].fullname
                                };
                              }
                            }
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
                              for (let i = 0; i < clgData.length; i++) {
                                const couData = Object.keys(
                                  collegeData[clgData[i]].courses
                                );
                                for (let j = 0; j < couData.length; j++) {
                                  const branData = Object.keys(
                                    collegeData[clgData[i]].courses[couData[j]]
                                      .branches
                                  );
                                  for (let k = 0; k < branData.length; k++) {
                                    collegeData[clgData[i]].courses[
                                      couData[j]
                                    ].branches[branData[k]]["years"] = {};
                                    for (let m = 0; m < yearRes.length; m++) {
                                      if (
                                        yearRes[m].branch_id ===
                                        collegeData[clgData[i]].courses[
                                          couData[j]
                                        ].branches[branData[k]].branch_id
                                      ) {
                                        collegeData[clgData[i]].courses[
                                          couData[j]
                                        ].branches[branData[k]]["years"][
                                          yearRes[m].year_id
                                        ] = {
                                          year_id: yearRes[m].year_id,
                                          year: yearRes[m].year,
                                          branch_id: yearRes[m].branch_id
                                        };
                                      }
                                    }
                                  }
                                }
                              }
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
                                  for (let i = 0; i < clgData.length; i++) {
                                    const couData = Object.keys(
                                      collegeData[clgData[i]].courses
                                    );
                                    for (let j = 0; j < couData.length; j++) {
                                      const branData = Object.keys(
                                        collegeData[clgData[i]].courses[
                                          couData[j]
                                        ].branches
                                      );
                                      // console.log("brandata", branData)
                                      for (
                                        let k = 0;
                                        k < branData.length;
                                        k++
                                      ) {
                                        const yeData = Object.keys(
                                          collegeData[clgData[i]].courses[
                                            couData[j]
                                          ].branches[branData[k]].years
                                        );
                                        // console.log("yearData", yeData);
                                        for (
                                          let m = 0;
                                          m < yeData.length;
                                          m++
                                        ) {
                                          collegeData[clgData[i]].courses[
                                            couData[j]
                                          ].branches[branData[k]].years[
                                            yeData[m]
                                          ]["semester"] = {};
                                          for (
                                            let n = 0;
                                            n < semRes.length;
                                            n++
                                          ) {
                                            if (
                                              semRes[n].year_id ===
                                              collegeData[clgData[i]].courses[
                                                couData[j]
                                              ].branches[branData[k]].years[
                                                yeData[m]
                                              ].year_id
                                            ) {
                                              collegeData[clgData[i]].courses[
                                                couData[j]
                                              ].branches[branData[k]].years[
                                                yeData[m]
                                              ]["semester"][
                                                semRes[n].semister
                                              ] = {
                                                semester: semRes[n].semister,
                                                sem_id: semRes[n].sem_id,
                                                year_id: semRes[n].year_id
                                              };
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                                await knex
                                  .raw(
                                    `select sec.id as section_id, sec.section, sec.year as year_id from raghuerp_db.sections sec`
                                  )
                                  .then(async ([secRes]) => {
                                    if (!secRes) {
                                      reply = {
                                        success: false,
                                        message: "No sections data is available"
                                      };
                                    } else {
                                      for (let i = 0; i < clgData.length; i++) {
                                        const couData = Object.keys(
                                          collegeData[clgData[i]].courses
                                        );
                                        for (
                                          let j = 0;
                                          j < couData.length;
                                          j++
                                        ) {
                                          const branData = Object.keys(
                                            collegeData[clgData[i]].courses[
                                              couData[j]
                                            ].branches
                                          );
                                          for (
                                            let k = 0;
                                            k < branData.length;
                                            k++
                                          ) {
                                            const yeData = Object.keys(
                                              collegeData[clgData[i]].courses[
                                                couData[j]
                                              ].branches[branData[k]].years
                                            );
                                            for (
                                              let m = 0;
                                              m < yeData.length;
                                              m++
                                            ) {
                                              collegeData[clgData[i]].courses[
                                                couData[j]
                                              ].branches[branData[k]].years[
                                                yeData[m]
                                              ]["sections"] = {};
                                              for (
                                                let n = 0;
                                                n < secRes.length;
                                                n++
                                              ) {
                                                if (
                                                  collegeData[clgData[i]]
                                                    .courses[couData[j]]
                                                    .branches[branData[k]]
                                                    .years[yeData[m]]
                                                    .year_id ===
                                                  secRes[n].year_id
                                                ) {
                                                  collegeData[
                                                    clgData[i]
                                                  ].courses[
                                                    couData[j]
                                                  ].branches[branData[k]].years[
                                                    yeData[m]
                                                  ]["sections"] = {
                                                    section_id:
                                                      secRes[n].section_id,
                                                    section: secRes[n].section,
                                                    year_id: secRes[n].year_id
                                                  };
                                                }
                                              }
                                              // console.log(
                                              //   sectionsData["sections"]
                                              // );
                                              // collegeData[i].courses[
                                              //   j
                                              // ].branches[k].years[m][
                                              //   "sections"
                                              // ] =
                                              //   sectionsData["sections"];
                                              // sectionsData["sections"] = [];
                                            }
                                          }
                                        }
                                      }
                                    }
                                    await knex
                                      .raw(
                                        `select d.id as dept_id, d.department, d.full_name, d.college as college_id from raghuerp_db.departments d where d.status = 1`
                                      )
                                      .then(([deptRes]) => {
                                        if (!deptRes) {
                                          reply = {
                                            success: false,
                                            message:
                                              "No depatments data is available"
                                          };
                                        } else {
                                          for (
                                            let i = 0;
                                            i < collegeData.length;
                                            i++
                                          ) {
                                            for (
                                              let j = 0;
                                              j < deptRes.length;
                                              j++
                                            ) {
                                              if (
                                                collegeData[i].id ===
                                                deptRes[j].college_id
                                              ) {
                                                departmentData[
                                                  "departments"
                                                ].push({
                                                  dept_id: deptRes[j].dept_id,
                                                  department:
                                                    deptRes[j].department,
                                                  fullname:
                                                    deptRes[j].full_name,
                                                  college_id:
                                                    deptRes[j].college_id
                                                });
                                              }
                                            }
                                            collegeData[i]["departments"] =
                                              departmentData["departments"];
                                            departmentData["departments"] = [];
                                          }
                                        }
                                      });
                                    await knex
                                      .raw(
                                        `SELECT ss.*,s.subject_name,ys.semister,s.subject_code FROM raghuerp_timetable.subj_sems ss inner JOIN  raghuerp_timetable.subjects s ON s.id = ss.subject_id INNER JOIN  raghuerp_timetable.year_subject ys ON ys.id = ss.semister_id`
                                      )
                                      .then(async ([subRes]) => {
                                        if (!subRes) {
                                          reply = {
                                            success: false,
                                            message:
                                              "No subjects data is available"
                                          };
                                        } else {
                                          console.log("subRes", subRes);
                                          for (
                                            let i = 0;
                                            i < clgData.length;
                                            i++
                                          ) {
                                            const couData = Object.keys(
                                              collegeData[clgData[i]].courses
                                            );
                                            for (
                                              let j = 0;
                                              j < couData.length;
                                              j++
                                            ) {
                                              const branData = Object.keys(
                                                collegeData[clgData[i]].courses[
                                                  couData[j]
                                                ].branches
                                              );
                                              for (
                                                let k = 0;
                                                k < branData.length;
                                                k++
                                              ) {
                                                const yeData = Object.keys(
                                                  collegeData[clgData[i]]
                                                    .courses[couData[j]]
                                                    .branches[branData[k]].years
                                                );
                                                for (
                                                  let m = 0;
                                                  m < yeData.length;
                                                  m++
                                                ) {
                                                  const semData = Object.keys(
                                                    collegeData[clgData[i]]
                                                      .courses[couData[j]]
                                                      .branches[branData[k]]
                                                      .years[yeData[m]].semester
                                                  );
                                                  console.log(
                                                    "semData",
                                                    semData
                                                  );
                                                  for (
                                                    let n = 0;
                                                    n < semData.length;
                                                    n++
                                                  ) {
                                                    collegeData[
                                                      clgData[i]
                                                    ].courses[
                                                      couData[j]
                                                    ].branches[
                                                      branData[k]
                                                    ].years[yeData[m]].semester[
                                                      semData[n]
                                                    ]["subjects"] = {};
                                                    for (
                                                      let p = 0;
                                                      p < subRes.length;
                                                      p++
                                                    ) {
                                                      if (semData[n]) {
                                                        // // console.log('semData', subRes[n]
                                                        // .semister_id)

                                                        if (
                                                          subRes[p]
                                                            .semister_id ===
                                                          collegeData[
                                                            clgData[i]
                                                          ].courses[couData[j]]
                                                            .branches[
                                                            branData[k]
                                                          ].years[yeData[m]]
                                                            .semester[
                                                            semData[n]
                                                          ].sem_id
                                                        )
                                                          collegeData[
                                                            clgData[i]
                                                          ].courses[
                                                            couData[j]
                                                          ].branches[
                                                            branData[k]
                                                          ].years[
                                                            yeData[m]
                                                          ].semester[
                                                            semData[n]
                                                          ]["subjects"][
                                                            subRes[p].id
                                                          ] = {
                                                            subject_id:
                                                              subRes[p].id,
                                                            subject_name:
                                                              subRes[p]
                                                                .subject_name,
                                                            subject_code:
                                                              subRes[p]
                                                                .subject_code,
                                                            sem_id:
                                                              subRes[p]
                                                                .semister_id
                                                          };
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      });
                                  });
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
              colleges: _.indexBy(collegeData, "id")
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
