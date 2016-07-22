const irc = require('irc');

const BasePlatform = require('./base');

const TYPE = 'irc';

module.exports = class IrcPlatform extends BasePlatform {

  constructor(name, options) {
    super(name);
    this._type = TYPE;
    this._client = new irc.Client(
      options.server,
      options.nick,
      options.optional
    );
  }

  // Get type of the platform without creating an instance
  static get type() {
    return TYPE;
  }

  onMessage(callback) {
    this._client.addListener('message', (from, to, message) => {
      callback(this.parseMessage(from, to, message));
    });
  }

  parseMessage(from, to, msg) {
    let event = { origin: this._type };
    event.eventId = 1234; // TODO: Make unique hash because IRC doesn't give event IDs
    event.text = msg;
    event.userId = from; // NOTE: Can there be users with same username?

    // Parse metadata
    event.meta.from = from;

    return event;
  }

};
