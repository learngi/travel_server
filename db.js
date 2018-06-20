const config = require("./src/config");

let mysql = require("mysql");

let connection = mysql.createPool({
  host: config.database.host,
  user: config.database.username,
  password: config.database.password,
  database: config.database.db
});
module.exports = connection;
