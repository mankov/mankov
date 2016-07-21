const irc = require('irc');

const BasePlatform = require('./base');

module.exports = class IrcPlatform extends BasePlatform {
  constructor(options) {
    super(options);
    this._client = new irc.Client(
      options.client.server,
      options.client.nick,
      options.client.optional
    );
  }
};
