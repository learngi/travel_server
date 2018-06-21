// import routes from "./src/routes"

import routes from "./src/routes";
import news from "./src/news";
import academics from "./src/academics";
import jwt from "jsonwebtoken";

// import routes from "src/routes";

const Inert = require("inert");

const Hapi = require("hapi");
const config = require("./src/config");
const AuthBearer = require("hapi-auth-bearer-token");

const server = Hapi.server({
  port: 5522,
  host: config.host,
  routes: { cors: { origin: ["*"] } }
});

process.on("unhandledRejection", err => {
  console.log("err", err);
  process.exit(1);
});

init();

async function init() {
  console.log("testing");
  await server.register([AuthBearer, Inert]);

  await server.auth.strategy("token", "bearer-access-token", {
    validate: async (request, token) => {
      let isValid;
      let credentials = {};
      await jwt.verify(token, config.server.token, (err, decoded) => {
        if (err) {
          isValid = false;
        } else {
          isValid = true;
          credentials = decoded;
        }
      });
      return { isValid, credentials };
    }
  });

  server.auth.default("token");

  const allRoutes = [...routes, ...news, ...academics];
  allRoutes.forEach(item => {
    server.route(item);
  });

  // server.route(routes);

  await start();
}

async function start() {
  try {
    await server.start();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log("Server running at:", server.info.uri);
}
