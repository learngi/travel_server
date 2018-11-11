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
        .raw(`select * from categories `)
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
      const { status, type, place_name } = request.payload;

      const image = request.payload.image.hapi.filename;
      console.log("imaga", image);
      if (image) {
        console.log("ff", image);
        const fileName = request.payload.image.hapi.filename;
        const path = config.upload_folder + fileName;
        const file = fs.createWriteStream(path);
        // console.log('file', file);
        file.on("error", async err => {
          console.log("errr", err);
        });
        data.image.pipe(file);
        console.log("2");
        await knex("carousel")
          .insert({
            status,
            type,
            place_name,
            image
          })
          .then(data => {
            console.log("3");
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
        console.log("4");
        return res;
      }
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
      console.log(path);
      // if(request.pa)
      await knex
        .raw(`select id, image,place_name,type, status from carousel`)
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
                    place_name: item.place_name,
                    type: item.type,
                    image: "http://" + path + "/image/" + item.image,
                    status: item.status,
                    image_name: item.image
                  });
                }
              });
            } else {
              data.forEach(item => {
                input.push({
                  id: item.id,
                  place_name: item.place_name,
                  type: item.type,
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
        })
        .catch(err => {
          console.log("ee", err);
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
        })
        .catch(err => {
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
        mode: "optional"
      }
    },
    handler: async request => {
      let reply = null;
    
      const coverPageData = [];
      const collegeData = [];
      await knex
        .raw(
          `SELECT *, c.c_name FROM tour_description td
          inner join categories c on td.category_id = c.c_id `
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
    path: "/tourPlaces",
    method: "GET",
    config: {
      auth: {
        mode: "optional"
      }
    },
    handler: async request => {
      let reply = null;
    
      const coverPageData = [];
      const collegeData = [];
      await knex
        .raw(
          `SELECT id, type, place_name  FROM carousel where status = '1' `
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
