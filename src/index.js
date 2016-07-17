const express     = require('express');
const bodyParser  = require('body-parser');

const log      = require('./logger')(__filename);

const DEFAULT_HOSTNAME = 'localhost';
const DEFAULT_PORT = 3000;


module.exports = class Core {
  constructor(port = DEFAULT_PORT, hostname = DEFAULT_HOSTNAME) {
    this._tgApiKey = null;
    this._webhookUrl = null;
    this._port = port;
    this._hostname = hostname;


    this._server = startHttpServer(port, hostname);
  }

  subscribeWebhook(url, callback) {
    if (!this._webhookUrl) {
      this._webhookUrl = url;
      this._server.post(url, (req, res) => {
        callback(req);
      });
    }
  }
};


function startHttpServer(port, hostname) {
  const server = express();

  // Add required middlewares
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());

  // Start!
  server.listen(port, hostname, () => {
    log.info(`HTTP-server started at ${this._hostname}:${this._port}`);
  });

  return server;
}
