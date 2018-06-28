const knex = require("../knex");
const config = require("../src/config");

const feedback = [
  // insert Feedback Categories
  {
    path: "/feedbackCategory",
    method: "POST",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      console.log("/feedbackCategory", request.payload);
      const { id, category } = request.payload;
      const data = { id, category };
      await knex
        .raw(
          `select count(*) as count from feedback_category where category = '${category}'`
        )
        .then(async ([result]) => {
          if (result[0].count > 0) {
            reply = {
              success: false,
              message: " data is already exists"
            };
          } else {
            await insertOrUpdate(knex, "feedback_category", data)
              .then(([res]) => {
                if (!res) {
                  reply = {
                    success: false
                  };
                } else {
                  reply = {
                    success: true
                  };
                }
              })
              .catch(err => {
                if (err) {
                  reply = {
                    success: false,
                    message: "Duplicate entry"
                  };
                }
              });
          }
        })
        .catch(err => {
          if (err) {
            console.log(err);
          }
        });
      return reply;
    }
  },

  // get Feedback Categories
  {
    path: "/feedbackCategory",
    method: "GET",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      await knex
        .raw(`select id, category from feedback_category`)
        .then(async ([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No category data is found"
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

  // insert Feedbacks
  {
    path: "/feedback",
    method: "POST",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      console.log("/feedback, Method: POST", request.payload);
      const { id, category_id, ratings, remarks } = request.payload;
      const data = {
        id,
        category_id,
        ratings,
        remarks
      };
      console.log("data", data);
      await insertOrUpdate(knex, "feedback", data).then(([data]) => {
        if (!data) {
          reply = {
            success: false
          };
        } else {
          reply = {
            success: true
          };
        }
      });
      return reply;
    }
  },

  // get Feedbacks
  {
    path: "/feedback",
    method: "GET",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      console.log("/feedback, Method: GET");
      await knex
        .raw(`select id, category_id, ratings, remarks from feedback`)
        .then(([data]) => {
          if (!data) {
            reply = {
              success: false,
              method: "No Feedbacks are available"
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
  }
];

async function insertOrUpdate(knex, tableName, data) {
  const firstData = data[0] ? data[0] : data;
  console.log("data", data);
  return knex.raw(
    `${knex(tableName)
      .insert(data)
      .toQuery()} ON DUPLICATE KEY UPDATE ${Object.getOwnPropertyNames(
      firstData
    )
      .map(field => `${field}=VALUES(${field})`)
      .join(",  ")}`
  );
}

export default feedback;
