const tgClient  = require('node-telegram-bot-api');
const _         = require('lodash');
const log       = require('../logger')(__filename);

const BasePlatform = require('./base');

module.exports = class TelegramPlatform extends BasePlatform {

  // Options is parsed by node-telegram-bot-api, read more from
  // https://github.com/yagop/node-telegram-bot-api#new_TelegramBot_new
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
    let event = { origin: 'telegram' };
    event.eventId = msg.message_id;
    event.text = msg.text;
    event.userId = msg.from.id;

    // Parse metadata
    event.meta = {};
    event.meta.replyToMessage = msg.reply_to_message;
    event.meta.userName = msg.from.username;
    event.meta.userFirstName = msg.from.first_name;
    event.meta.userLastName = msg.from.last_name;
    event.meta.userCallName = _.isUndefined(event.userName) ?
        event.meta.userFirstName :
        `@${event.userName}`;

    event.meta.isFromGroup = !_.isUndefined(msg.chat.title);
    event.meta.chatGroupId = event.isFromGroup ? msg.chat.id : null;
    event.meta.chatGroupTitle = event.isFromGroup ? msg.chat.title : null;

    event.meta.editDate = (msg.edit_date) ? msg.edit_date : null;
    event.meta.entities = (msg.entities) ? msg.entities : null;

    event.meta.targetId = (event.isFromGroup) ? event.chatGroupId : event.userId;

    return event;

  }

  // TODO: Parse Inline Query events

  setWebhook(options) {
    this._client.setWebHook(options.url, options.cert);
  }


};
