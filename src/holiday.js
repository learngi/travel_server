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
        .raw(`SELECT holdate, holname FROM raghuerp_leavesys_cls.holidays`)
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
  }
];

export default holidays;
