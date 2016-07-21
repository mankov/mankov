const tgClient = require('node-telegram-bot-api');

const BasePlatform = require('./base');

module.exports = class TelegramPlatform extends BasePlatform {
  constructor(options) {
    super(options);
    this._client = new tgClient(options.client.token);
  }
};
