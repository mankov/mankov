const tgClient  = require('node-telegram-bot-api');
const _         = require('lodash');
const log       = require('../logger')(__filename);

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

  parseMessage(raw) {
    let event = { type: 'telegram' };
    event.eventId = raw.update_id;
    event.meta = {};

    if (raw.message || raw.edited_message) {
      let msg = (raw.message) ? raw.message : raw.edited_message;
      event.text = msg.text;
      event.userId = msg.from.id;

      // Parse metadata
      event.meta.replyToMessage = raw.reply_to_message;
      event.meta.userName = raw.from.username;
      event.meta.userFirstName = raw.from.first_name;
      event.meta.userLastName = raw.from.last_name;
      event.meta.userCallName = _.isUndefined(event.userName) ?
          event.meta.userFirstName :
          `@${event.userName}`;

      event.meta.isFromGroup = !_.isUndefined(raw.chat.title);
      event.meta.chatGroupId = event.isFromGroup ? raw.chat.id : null;
      event.meta.chatGroupTitle = event.isFromGroup ? raw.chat.title : null;

      event.meta.editDate = (raw.edit_date) ? raw.edit_date : null;
      event.meta.entities = (raw.entities) ? raw.entities : null;

      event.meta.targetId = (event.isFromGroup) ? event.chatGroupId : event.userId;

    } else if (raw.inline_query) {
      // TODO: Parse inline query

    } else if (raw.chosen_inline_query) {
      // TODO: Parse ...

    } else if (raw.callback_query) {
      // TODO: Parse ...

    } else {
      log.error('Invalid Telegram message', raw);
    }

    return event;
  }

  setWebhook(options) {
    this._client.setWebHook(options.url, options.cert);
  }


};
