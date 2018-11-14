const knex = require('../knex');
const config = require('../src/config');
const generator = require('generate-password');
const fs = require('fs');
const _ = require('underscore');

const academics = [

  {
    method: 'POST',
    path: '/uploadDocuments',
    config: {
      auth: {
        mode: 'optional'
      },
      payload: {
        output: 'stream',
        maxBytes: 10048576,
        parse: true,
        allow: 'multipart/form-data',
        timeout: 110000
      }
    },

    handler: async request => {
      let res = null;
      // let data  = request.payload.data;
      // let  documentFiles  = request.payload.academicForm;
      // let temp = JSON.parse(data);
      // let documentFiles = request.payload);
      // console.log('date input', JSON.parse(documentFiles))
      // data = JSON.parse(data);
      // const c_id = documentFiles[0].c_id;    

      let dataFeilds = {
        name: request.payload.name,
        availability: request.payload.availability,
        amount: Number(request.payload.amount),
        date: request.payload.date,
        depature: request.payload.depature,
        depature_time: request.payload.depature_time,
        return_time: request.payload.return_time,
        no_of_days: request.payload.no_of_days,
      };
      console.log('sdsdsds', dataFeilds);

      let data = JSON.parse(request.payload.uploadFiles);

      console.log('123', data, dataFeilds, request.payload);

      await knex('acadamics')
        .insert(dataFeilds)
        .then(async ([datas]) => {
          var VALUES = [];
          try {

            console.log('INSERT1', datas);

            let insertId = datas;
           
            var i = 0;
            for (const row of data) {

              // if (
              //   row.documents 
                // &&
                // request.payload[`fileUpload${i}`].hapi.filename
              // ) {
                console.log('in for', request.payload[`fileUpload${i}`].hapi);
                
                // let image = row['documents'].hapi.filename;
                // let description = row.des;
                VALUES.push([insertId, row.day, row.description, row.image]);
                const path =
                  config.upload_Documents + request.payload[`fileUpload${i}`].hapi.filename;
                  // row['documents'].hapi.filename;
                  request.payload[`fileUpload${i}`].pipe(
                  fs.createWriteStream(path)
                );
              // }
              i++;
            }

          } catch (err) {
            console.log(err, "ERROR");

          }

          console.log("Values", VALUES);
          

          await knex.raw(`INSERT INTO acadamics_images(aid, day, description, image) VALUES ?`, [VALUES]).then(async ([insert]) => {
            console.log('insert', insert);

            res = {
              success: true,
              message: 'Success'
            };
          }).catch(err => {
            console.log(err, "ERROR");
            res = {
              success: false,
              message: 'fail'
            };
          });

        }).catch(err => {
          console.log(err, "ERror");
          res = {
            success: false,
            message: 'fail'
          };
        });
      // console.log('d', subjectArray);
      return res;
    }
  },


  {
    method: 'POST',
    path: '/uploadDocuments2',
    config: {
      auth: {
        mode: 'optional'
      },
      payload: {
        output: 'stream',
        maxBytes: 10048576,
        parse: true,
        allow: 'multipart/form-data',
        timeout: 110000
      }
    },

    handler: async request => {
      let res = null;
      let data = request.payload.uploadDocuments;
      console.log('123', data)
      let documentFiles = request.payload.academicForm;
      let temp = JSON.parse(documentFiles)
      // let documentFiles = request.payload);
      console.log('date input', JSON.parse(documentFiles))
      // data = JSON.parse(data);
      // const c_id = documentFiles[0].c_id;



      let dataFeilds = {
        name: temp.c_id,
        availability: temp.availability,
        amount: temp.amount,
        date: temp.date,
        depature: temp.depature,
        depature_time: temp.depature_time,
        return_time: temp.return_time,
        no_of_days: temp.no_of_days,
      };
      console.log('sdsdsds', dataFeilds)

      await knex('acadamics')
        .insert(dataFeilds)
        .then(async ([datas]) => {
          let insertId = datas.insertId;
          let VALUES = [];

          for (const row of data.uploadFiles) {


            if (
              row.documents &&
              request.payload[`fileUpload${i}`].hapi.filename
            ) {
              VALUES.push([insertId, row.day, row.des, request.payload[`fileUpload${i}`].hapi.filename]);
              const path =
                config.upload_Documents +
                request.payload[`fileUpload${i}`].hapi.filename;
              row.documents.pipe(
                fs.createWriteStream(path)
              );
            }
          }

          await knex.raw(`INSERT INTO acadamics_images(aid, day, description, image) VALUES ?`, [VALUES]).then(async ([insert]) => {
            res = {
              success: true,
              message: 'Success'
            };
          })

        })
      console.log('d', subjectArray);
      return res;
    }
  },
  {
    method: 'POST',
    path: '/uploadDocuments/old',
    config: {
      auth: {
        mode: 'optional'
      },
      payload: {
        output: 'stream',
        maxBytes: 10048576,
        parse: true,
        allow: 'multipart/form-data',
        timeout: 110000
      }
    },

    handler: async request => {
      let res = null;
      let { documentFiles } = request.payload;
      documentFiles = JSON.parse(documentFiles);
      const c_id = documentFiles[0].c_id;

      // let id = documentFiles
      console.log('ff');
      for (let i = 0; i < documentFiles.length; i++) {
        const item = documentFiles[i];
        const id = item.id;
        const insertData = {
          c_id,
          title: item.title,
          day: item.day,
          id: item.id
        };
        if (
          request.payload[`fileUpload${i}`] &&
          request.payload[`fileUpload${i}`].hapi &&
          request.payload[`fileUpload${i}`].hapi.filename
        ) {
          insertData.filename = request.payload[`fileUpload${i}`].hapi.filename;
        }

        console.log('f', item.id);

        if (id) {
          await knex('academics')
            .where({ id })
            .update(insertData)
            .then(data => {
              if (data) {
                // upload image
                if (
                  request.payload[`fileUpload${i}`] &&
                  request.payload[`fileUpload${i}`].hapi &&
                  request.payload[`fileUpload${i}`].hapi.filename
                ) {
                  const path =
                    config.upload_Documents +
                    request.payload[`fileUpload${i}`].hapi.filename;
                  request.payload[`fileUpload${i}`].pipe(
                    fs.createWriteStream(path)
                  );
                }
                res = {
                  success: true,
                  message: 'Success'
                };
              }
            })
            .catch(err => {
              if (err) {
                console.log('err', err);
              }
            });
        } else {
          await knex('academics')
            .insert(insertData)
            .then(data => {
              if (data) {
                // upload image
                if (
                  request.payload[`fileUpload${i}`] &&
                  request.payload[`fileUpload${i}`].hapi &&
                  request.payload[`fileUpload${i}`].hapi.filename
                ) {
                  const path =
                    config.upload_Documents +
                    request.payload[`fileUpload${i}`].hapi.filename;
                  request.payload[`fileUpload${i}`].pipe(
                    fs.createWriteStream(path)
                  );
                }
                res = {
                  success: true,
                  message: 'Success'
                };
              }
            })
            .catch(err => {
              if (err) {
                console.log('err', err);
              }
            });
        }
      }

      // console.log('d', subjectArray);
      return res;
    }
  },

  // multiple image upload
  {
    method: 'POST',
    path: '/uploadMultiple',
    config: {
      auth: {
        mode: 'optional'
      },
      payload: {
        output: 'stream',
        maxBytes: 10048576,
        parse: true,
        allow: 'multipart/form-data',
        timeout: 110000
      }
    },

    handler: async request => {
      let res = null;
      const data = request.payload;
      const sub_id = JSON.parse(request.payload.sub_id);

      const documents = [];
      const subjectArray = [];
      // const documents = request.payload.fileUpload0.hapi;
      // console.log('payload', documents);

      if (data) {
        for (let i = 0; i < data.ct; i++) {
          const fileName = request.payload[`fileUpload${i}`].hapi.filename;
          documents.push({ filename: fileName });
          const path = config.upload_Documents + fileName;
          const file = fs.createWriteStream(path);
          file.on('error', err => {
            console.log('ff', err);
          });
          request.payload[`fileUpload${i}`].pipe(file);
        }
      }
      documents.forEach(item => {
        subjectArray.push({
          filename: item.filename,
          sub_id
        });
      });
      console.log('d', subjectArray);
      await knex('academics')
        .insert(subjectArray)
        .then(([data]) => {
          if (data) {
            res = {
              success: true,
              message: 'Success'
            };
          }
        });
      return res;
    }
  },



  // {
  //   path: '/attachment/{filename}',
  //   method: 'GET',
  //   config: {
  //     auth: {
  //       mode: 'optional'
  //     }
  //   },
  //   handler: async (request, h) => {
  //     const { filename } = request.params;
  //     console.log(request.params);
  //     const path = config.audit_upload_folder + `${filename}`;
  //     console.log(path);
  //     h.file(path);
  //   }
  //   //  config.upload_folder + request.params.image

  //   // handler: async (request, reply) => {
  //   //   const { image } = request.params;
  //   //   // console.log('image_path', config.upload_folder + image);
  //   //   // return reply.file(config.upload_folder + image);
  //   // }
  // }
  {
    path: '/documents/{filename}',
    method: 'GET',
    config: {
      auth: {
        mode: 'optional'
      }
    },
    handler: async (request, h) =>
      h.file(config.upload_Documents + request.params.filename)
  }
];

function insertOrUpdate(Knex, tableName, data) {
  const firstData = data[0] ? data[0] : data;
  return knex.raw(
    `${knex(tableName)
      .insert(data)
      .toQuery()} ON DUPLICATE KEY UPDATE ${Object.getOwnPropertyNames(
        firstData
      )
        .map(field => `${field}=VALUES(${field})`)
        .join(',')}`
  );
}
export default academics;
