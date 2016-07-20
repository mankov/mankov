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

    this._apis = [];
    this._webhookUrl = null;
    this._port = port;
    this._hostname = hostname;

    this._monitors = [];
    this._commanders = [];
    this._responders = [];

    this._server = startHttpServer(port, hostname);

  }

  setTelegramApiKey(apiKey) {
    this._apis.push({ name: 'telegram', api: new telegramApi(apiKey) });
  }

  subscribeWebhook(options, callback) {
    // TODO: remove existing webhook when creating a new one
    if (!this._webhookUrl) {
      this._webhookUrl = url;

      this._server.post(url, req => {
        callback(req);
      });

      // Set webhook also to API if it is supported
      this._apis.forEach(api => {
        if (_.isFunction(api.setWebhook)) {
          api.setWebhook(options);
        }
      });
    }
  }

  addCommander(commanderInstance) {
    this._commanders.push(commanderInstance);
  }

  // "The Pipeline"
  processMessage(message) {
    // TODO: call queue

    // TODO: Support multiple chat platforms
    //       (Check from which API message came from)
    const event = telegramParser(message);

    // TODO: send event to all monitors


    // # Command & Respond -loop
    const commandHandlerCandidates = _.map(this._commanders, cmdr =>
      cmdr.getBidForEvent(event)
    );

    // (http://stackoverflow.com/questions/30309273/keep-the-values-only-from-the-promises-that-resolve-and-ignore-the-rejected)
    Promise.all(
      commandHandlerCandidates
        .map(promise => promise.reflect())
        .filter(promise => promise.isFulfilled())
    ).then(handlerBids => {
      // only fulfilled promises in here.
      log.debug(handlerBids);

      // One commander was interested in the event,
      // allow that commander to decide the response
      if (handlerBids.length === 1) {
          // TODO: Run commander's `process` function
      }

      // More than one commander was interested in the event,
      // tell user about this conflict
      else if (handlerBids.length > 1) {
          // TODO: Make user to decide which commander will take the control
      }

      // There was no interested commanders, send event to responders
      else {
          // TODO: Create responder logic
      }

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
