const knex = require("../knex");
const config = require("../src/config");
const _ = require("underscore");

const timetable = [
  // timetable for students
  {
    path: "/timetable/{section}",
    method: "GET",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      let input = {};
      let inputData = {};
      let days = [];
      const { section } = request.params;
      console.log("section", section);
      await knex
        .raw(
          `select t.day, t.period, t.year_id, t.section_id, t.sub_id,s.subject_name, GROUP_CONCAT(t.reg_no) as reg_no, GROUP_CONCAT(stf.firstname) as professor from raghuerp_timetable.timetable t inner join raghuerp_timetable.subj_sems ss on t.sub_id = ss.id inner join raghuerp_timetable.subjects s on s.id = ss.subject_id inner join raghuerp_db.staff stf on t.reg_no = stf.reg_no where t.section_id = ${section} and t.status = 0 group by t.day, t.period, t.year_id, t.section_id, t.sub_id order by case when  t.day = 'MON'  then 1 when t.day = 'TUE' then 2 when t.day = 'WED' then 3 when t.day = 'THU' then 4 when t.day = 'FRI' then 5 when t.day = 'SAT' then 6 when t.day = 'SUN' then 7 end ASC`
        )
        .then(([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No Timetable data is available"
            };
          } else {
            data.forEach(item => {
              inputData[item.day] = {
                period: item.period,
                subject: item.subject_name,
                professor: item.professor
              };
            });
            days = Object.keys(inputData);
            console.log(days)
            for (let i = 0; i < days.length; i++) {
              input[days[i]] = {};
              for (let j = 0; j < data.length; j++) {
                if (days[i] === data[j].day) {
                  input[days[i]][data[j].period] = {
                    subject: data[j].subject_name,
                    professor: data[j].professor
                  };
                }
              }
            }
            reply = {
              success: true,
              data: input
            };
          }
        });
      return reply;
    }
  }
];

export default timetable;
