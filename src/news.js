const knex = require("../knex");
const config = require("../src/config");
const generator = require("generate-password");
const fs = require("fs");

const news = [
  // get All Categories
  {
    path: "/getCategory",
    method: "GET",
    config: {
      auth: {
        mode: "optional"
      }
    },
    handler: async request => {
      let reply = null;
      await knex
        .raw(`select * from news_category where status = 1`)
        .then(([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No category data is available"
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

  // get All Tags
  {
    path: "/getTags",
    method: "GET",
    config: {
      auth: {
        // strategy: "token",
        mode: "optional"
      }
    },
    handler: async request => {
      let reply = null;
      await knex.raw(`select * from tags where status = 1`).then(([data]) => {
        if (!data) {
          reply = {
            success: false,
            message: "No tags data is available"
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

  // insert news
  {
    path: "/insertNews",
    method: "POST",
    config: {
      auth: {
        // strategy: "token"
        mode: "optional"
      },
      payload: {
        output: "stream",
        maxBytes: 1000048576,
        parse: true,
        allow: "multipart/form-data",
        timeout: 110000
      }
    },
    handler: async request => {
      let reply = null;
      let newsdata = [];
      let image;
      let news_id;
      const categoryData = [];
      const tagData = [];
      const { dt } = request.payload;
      console.log(request.payload.date);
      const translateData = JSON.parse(request.payload.date.data);
      const { id, title, description, status } = translateData;
      console.log("date", request.payload);
      //   console.log("data", request.payload.data);
      console.log("image", request.payload.image);
      if (request.payload.image.hapi !== undefined) {
        image = request.payload.image.hapi.filename;
      } else {
        image = request.payload.image;
      }
      console.log("image", image);

      if (request.payload.image.hapi !== undefined) {
        const path = config.upload_folder + request.payload.image.hapi.filename;
        const ret = request.payload.image.pipe(fs.createWriteStream(path));
      }
      newsdata = {
        id,
        title,
        description,
        dt,
        status,
        image_path: image
      };
      await knex.transaction(async t => {
        try {
          console.log("newsdata", newsdata);
          await insertOrUpdate(t, "news", newsdata)
            .then(([data]) => {
              if (data) {
                if (data.insertId === 0) {
                  news_id = id;
                } else {
                  news_id = data.insertId;
                }
              }
            })
            .catch(err => {
              console.log("err", err);
            });

          translateData.category_id.forEach(item => {
            categoryData.push({
              cid: item.id,
              news_id
            });
          });
          console.log("categoryData", categoryData);
          await insertOrUpdate(t, "news_categories", categoryData);

          translateData.tag_id.forEach(item => {
            tagData.push({
              tag_id: item.id,
              news_id
            });
          });
          console.log("tagsdata", tagData);
          await insertOrUpdate(t, "news_tags", tagData);

          await t.commit();
          reply = {
            success: true
          };
        } catch (err) {
          await t.rollback();
          error = true;
          message = "ERROR";
          reply = {
            success: false
          };
        }
      });
      return reply;
    }
  },

  // carousel upload
  {
    method: "POST",
    path: "/carouselUpload",
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
      console.log("carousel Upload");
      let res = null;
      const data = request.payload;
      const { status } = request.payload;
      const image = request.payload.image.hapi.filename;

      if (request.payload.image.hapi.filename) {
        const fileName = request.payload.image.hapi.filename;
        const path = config.upload_folder + fileName;
        const file = fs.createWriteStream(path);

        // console.log('file', file);

        file.on("error", async err => {
          console.log("errr", err);
        });

        await knex("carousel")
          .insert({
            status,
            image
          })
          .then(([data]) => {
            console.log("her");
            if (data) {
              res = {
                success: true,
                message: "upload successfully"
              };
            }
          })
          .catch(err => {
            console.log("err", err);
          });

        // insert data into database
        await data.image.pipe(file);

        data.image.on("end", err => {
          if (err) {
            res = {
              success: false,
              message: `"File upload failed, please try again"`
            };
          }
        });
      }
      console.log("res121", res);
      return res;
    }
  },

  // get Images list (carousel)
  {
    path: "/carousel/{id}",
    method: "GET",
    config: {
      auth: {
        mode: "optional"
      }
    },
    handler: async request => {
      let reply = null;
      const input = [];
      const { id } = request.params;
      const path = config.database.host + ":" + config.server.port;
      console.log(id, path);
      // if(request.pa)
      await knex
        .raw(`select id, image, status from carousel`)
        .then(([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No carousel images are found"
            };
          } else {
            if (id == 1) {
              data.forEach(item => {
                if (item.status !== 0) {
                  input.push({
                    id: item.id,
                    image: path + item.image,
                    status: item.status,
                    image_name: item.image
                  });
                }
              });
            } else {
              data.forEach(item => {
                input.push({
                  id: item.id,
                  image: "http://" + path + "/image/" + item.image,
                  status: item.status,
                  image_name: item.image
                });
              });
            }
            reply = {
              success: true,
              data: input
            };
          }
        }).catch(err => {
          console.log('ee', err);
        });
      return reply;
    }
  },

  // EDIT IMAGES (CAROUSEL)
  {
    path: "/editCarousel",
    method: "POST",
    config: {
      auth: {
        mode: "optional"
      }
    },
    handler: async request => {
      let reply = null;
      console.log(request.payload);
      const { id, status } = JSON.parse(request.payload);
      console.log(id, status);
      await knex
        .raw(`update carousel set status = ${status} where id = ${id}`)
        .then(([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "failed to update'"
            };
          } else {
            reply = {
              success: true,
              data
            };
          }
        }).catch(err => {
          console.log(err);
        });
      return reply;
    }
  },

  // get Original news list
  {
    path: "/news",
    method: "GET",
    config: {
      auth: {
        // strategy: 'token'
        mode: "optional"
      }
    },
    handler: async request => {
      let reply = null;
      const path =
        "http://www.raghueducational.org/cms/server/images/news_events/";
      console.log("path", path);
      const coverPageData = [];
      const collegeData = [];
      await knex
        .raw(
          `select ne.id, ne.title, ne.message as description,CONCAT('${path}', ne.cover_image) as cover_image,ne.event_date,
      (select GROUP_CONCAT(rg.college SEPARATOR '~') from raghuerp_db.colleges rg where find_in_set(rg.id,ne.college_id)) as category
      from news_events.news_events ne order by ne.event_date desc limit 5 `
        )
        .then(async ([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No news or event data is available"
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

  // get news by id
  {
    path: "/news/{id}",
    method: "GET",
    config: {
      auth: {
        // strategy: 'token'
        mode: "optional"
      }
    },
    handler: async request => {
      let reply = null;
      const { id } = request.params;
      const path =
        "http://www.raghueducational.org/cms/server/images/news_events/";
      console.log("path", path);
      const coverPageData = [];
      const collegeData = [];
      await knex
        .raw(
          `select ne.id, ne.title, ne.message as description,CONCAT('${path}', ne.cover_image) as cover_image,ne.event_date,
      (select GROUP_CONCAT(rg.college SEPARATOR '~') from raghuerp_db.colleges rg where find_in_set(rg.id,ne.college_id)) as category
      from news_events.news_events ne where ne.id = ${id}`
        )
        .then(async ([data]) => {
          if (!data) {
            reply = {
              success: false,
              message: "No news or event data is available"
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

export default news;
