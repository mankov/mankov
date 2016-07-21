const tgClient = require('node-telegram-bot-api');

const BasePlatform = require('./base');

module.exports = class TelegramPlatform extends BasePlatform {

  constructor(options) {
    super(options);
    this._client = new tgClient(options.client.token, options.client.optional);
  }

  onMessage(callback) {
    this._client.on('message', (msg) => {
      callback(this._parseMessage(msg));
    });
  }

  parseMessage(msg) {
    let event = { type: 'telegram' };
    // TODO!
    return event;
  }

  setWebhook(options) {
    this._client.setWebHook(options.url, options.cert);
  }


};
