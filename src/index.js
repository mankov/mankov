const express     = require('express');
const bodyParser  = require('body-parser');

const telegramApi = require('./telegram-api');

const log      = require('./logger')(__filename);

const DEFAULT_HOSTNAME = 'localhost';
const DEFAULT_PORT = 3000;


module.exports = class Core {
  constructor(port = DEFAULT_PORT, hostname = DEFAULT_HOSTNAME) {

    this._tgApi = null;
    this._webhookUrl = null;
    this._port = port;
    this._hostname = hostname;

    this._server = startHttpServer(port, hostname);

  }

  // NOTE: Should API key be mandatory parameter in constructor?
  setTelegramApiKey(apiKey) {
    this._tgApi = new telegramApi(apiKey);
  }

  subscribeWebhook(url, certificate, callback) {

    // TODO: remove existing webhook when creating a new one
    if (!this._webhookUrl) {
      this._webhookUrl = url;

      this._server.post(url, req => {
        callback(req);
      });

      // If Telegram API is initialized, send webhook also to Telegram
      if (this._tgApi) {
        this._tgApi.setWebhook({ url, certificate });
      }
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
    log.info(`HTTP-server started at ${hostname}:${port}`);
  });

  return server;
}
