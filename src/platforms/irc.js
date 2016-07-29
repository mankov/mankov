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

    this._client.addListener('message', (from, to, message) => {
      this.emit('event', this.parseMessage(from, to, message));
    });
  }

  // Get type of the platform without creating an instance
  static get type() {
    return TYPE;
  }

  parseMessage(from, to, msg) {
    let event = {};

    // Mandatory properties
    event.origin = this._type;
    event.fromBot = this._name;

    event.eventId = 1234; // TODO: Make unique hash because IRC doesn't give event IDs
    event.text = msg;

    // TODO: save also the irc network which this event is from.
    // Inside one network (such as QuakeNet or IRCNet) the usernames
    // are always unique. So by combining the network information we can
    // at some level identify users.
    //
    // (NOTE: if username is not used, anyone is free to change
    //  their name to that so this can't be trusted 100%)
    event.userId = from;

    // Parse metadata
    event.meta.from = from;

    return event;
  }

};
