const knex = require('../knex');
const config = require('../src/config');
const generator = require('generate-password');
const fs = require('fs');

const holidays = [
  // get All Categories
  {
    path: '/getholidays',
    method: 'GET',
    config: {
      auth: {
        mode: 'optional'
      }
    },
    handler: async request => {
      let reply = null;
      await knex
        .raw(
          `SELECT holdate, holname FROM raghuerp_leavesys_cls.holidays WHERE holname <> 'Sunday'`
        )
        .then(([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: 'No category data is available'
            };
          } else {
            reply = {
              success: true,
              data
            };
          }
        })
        .catch(err => {
          console.log('err', err);
        });
      return reply;
    }
  },

  // announcement
  {
    path: '/announcement',
    method: 'POST',
    config: {
      auth: {
        mode: 'optional'
      }
    },
    handler: async request => {
      let res = null;
      const data = JSON.parse(request.payload);
      const announcement = [];
      let aid = null;
      // const collegeData = []
      const { title, message, read_msg } = data;
      console.log('ff', title);
      // data.college.forEach(item => {
      //   announcement.push({
      //     title: title,
      //     message: message,
      //     read_msg: 0
      //   });
      // });
      await knex.transaction(async t => {
        try {
          await insertOrUpdate(t, 'announcement', { title, message })
            .then(([data]) => {
              console.log('d', data);
              if (data) {
                aid = data.insertId;
              }
            })
            .catch(err => {
              console.log('err', err);
            });

          data.college.forEach(item => {
            announcement.push({
              cid: item.id,
              aid,
              read_msg: read_msg
            });
          });
          await insertOrUpdate(t, 'announcement_link', announcement);
          await t.commit();
          res = {
            success: true,
            message: 'Success'
          };
        } catch (err) {
          await t.rollback();
          res = {
            success: false,
            message: 'Error'
          };
        }
      });

      return res;
    }
  },

  {
    method: 'GET',
    path: '/announcement',
    config: {
      auth: {
        mode: 'optional'
      }
    },
    handler: async request => {
      console.log('abc');
      let res = null;
      let q = `SELECT al.aid, al.cid,a.title, a.message ,al.read_msg, a.created_at,rc.college FROM announcement a
      INNER JOIN announcement_link al on a.aid = al.aid
            INNER JOIN raghuerp_db.colleges rc on al.cid = rc.id ORDER BY read_msg ASC`;
      await knex.raw(q).then(([data]) => {
        if (data[0] != '') {
          res = {
            success: true,
            data: data
          };
        } else {
          res = {
            success: false,
            message: 'Error while getting announcements'
          };
        }
      });
      return res;
    }
  },

  {
    method: 'POST',
    path: '/readMessage',
    config: {
      auth: {
        mode: 'optional'
      }
    },
    handler: async request => {
      const { cid, aid } = JSON.parse(request.payload);
      console.log('ff', cid);
      let res = null;
      let q = `UPDATE announcement_link SET read_msg ='1' WHERE cid = '${cid}' and aid = '${aid}'`;
      console.log('d', q);
      await knex.raw(q).then(([data]) => {
        if (data[0] != '') {
          res = {
            success: true,
            message: 'Updated Successfully'
          };
        } else {
          res = {
            success: false,
            message: 'Error while getting announcements'
          };
        }
      });
      return res;
    }
  }
];
async function insertOrUpdate(knex, tableName, data) {
  const firstData = data[0] ? data[0] : data;
  console.log('data', data);
  return knex.raw(
    `${knex(tableName)
      .insert(data)
      .toQuery()} ON DUPLICATE KEY UPDATE ${Object.getOwnPropertyNames(
      firstData
    )
      .map(field => `${field}=VALUES(${field})`)
      .join(',  ')}`
  );
}

export default holidays;
