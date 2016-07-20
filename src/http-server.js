// # http-server
//    Factory for creating express-instances

const express = require('express');
const bodyParser = require('body-parser');

const log = require('./logger')(__filename);


function createHttpServer(port, hostname) {
  const server = express();

  // Add required middlewares
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());

  // Start!
  server.listen(port, hostname, () => {
    log.info(`HTTP-server started at ${hostname}:${port}`);
  });

  return server;
}

module.exports = createHttpServer;
