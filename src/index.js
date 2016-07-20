const Promise     = require('bluebird');
const _           = require('lodash');
const express     = require('express');
const bodyParser  = require('body-parser');

const telegramApi = require('./telegram-api');
const telegramParser = require('./telegram-parser');

const log      = require('./logger')(__filename);

const DEFAULT_HOSTNAME = 'localhost';
const DEFAULT_PORT = 3000;


class Core {
  constructor(port = DEFAULT_PORT, hostname = DEFAULT_HOSTNAME) {

    this._tgApi = null;
    this._webhookUrl = null;
    this._port = port;
    this._hostname = hostname;

    this._monitors = [];
    this._commanders = [];
    this._responders = [];

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

  addCommander(commanderInstance) {
    this._monitors.push(commanderInstance);
  }

  // "The Pipeline"
  processMessage(message) {
    // TODO: call queue

    const event = telegramParser(message);

    // TODO: send to all monitors


    // # Command & Respond -loop
    const commandHandlerCandidates = _.map(this_.commanders, cmdr =>
      cmdr.getBidForEvent(event)
    );

    // (http://stackoverflow.com/questions/30309273/keep-the-values-only-from-the-promises-that-resolve-and-ignore-the-rejected)
    Promise.all(
      commandHandlerCandidates
        .map(promise => promise.reflect())
        .filter(promise => promise.isFulfilled())
    ).then(handlerBids => {
      // only fulfilled promises in here.
      console.log(handlerBids);

      // TODO: decide about the bids which will be sent
      // for actual handling

      // TODO: if there was no interested commanders, send
      // the event to responders
    });

  }
}


// TODO: move this to own file?
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


module.exports = Core;
