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
    method: "post",
    config: {
      auth: {
        mode: "optional"
      }
    },
    handler: async request => {
      let { username, password } = request.payload;
      console.log("input", username, password);
      username = username.trim();
      let reply = null;
      //  check user exists or not
      if (
        !request.payload ||
        !request.payload.username ||
        !request.payload.password
      ) {
        reply = {
          success: false,
          message: "username and password are required"
        };
      } else {
        const q = `SELECT COUNT(*) as ct FROM users u
        WHERE u.username = '${username}'`;
        console.log("here", q);
        await knex
          .raw(q)
          .then(async ([data]) => {
            console.log("data", data[0].ct, data);
            if (data[0].ct === 0) {
              reply = {
                success: false,
                message: "Username doesn`t exists"
              };
            } else {
              const q = `select e.username,e.password, e.name, e.email, e.mobile, e.role,e.course_id from users e where e.username = '${username}' limit 1`;
              console.log("q", q);

              console.log("q", q);
              await knex.raw(q).then(async ([usercount]) => {
                if (usercount) {
                  await bcrypt
                    .compare(password, usercount[0].password)
                    .then(async res => {
                      if (!res) {
                        reply = {
                          success: false,
                          message: "Incorrect password"
                        };
                      }
                      if (res) {
                        const data = {
                          id: usercount[0].id,
                          username: usercount[0].username,
                          success: "true",
                          token,
                          name: usercount[0].name,
                          email: usercount[0].email,
                          mobile: usercount[0].mobile,
                          role: usercount[0].role,
                          course_id: usercount[0].course_id
                        };
                        const token = jwt.sign(
                          {
                            id: usercount[0].id,
                            username: usercount[0].username,
                            success: "true",
                            token,
                            name: usercount[0].name,
                            email: usercount[0].email,
                            mobile: usercount[0].mobile,
                            role: usercount[0].role,
                            course_id: usercount[0].course_id
                          },
                          "vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy",
                          { algorithm: "HS256" }
                        );
                        reply = {
                          success: true,
                          token,
                          data
                        };
                      }
                    });
                }
              });
            }
          })
          .catch(err => {
            if (err) {
              console.log("err", err);
              reply = {
                message: "Duplicate entry",
                success: false
              };
            }
          });
      }
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
