const tgClient  = require('node-telegram-bot-api');
const _         = require('lodash');
const log       = require('../logger')(__filename);

const BasePlatform = require('./base');

const ACTION_TYPES = require('../action-types');

const TYPE = 'telegram';

module.exports = class TelegramPlatform extends BasePlatform {

  // Options is parsed by node-telegram-bot-api, read more from
  // https://github.com/yagop/node-telegram-bot-api#new_TelegramBot_new
  constructor(name, options) {
    // TODO: token should be mandatory(?)

    super(name);
    this._type = TYPE;
    this._client = new tgClient(options.token, options.optional);

    // Receives normal message
    this._client.on('message', (msg) => {
      this.emit('event', this._parseMessage(msg));
    });

    // Receives Inline Query
    this._client.on('inline_query', (msg) => {
      this.emit('event', this._parseInlineQuery(msg));
    });

    // Receives Chosen Inline Result
    this._client.on('chosen_inline_result', (msg) => {
      this.emit('event', this._parseChosenInlineResult(msg));
    });
  }

  static get type() {
    return TYPE;
  }

  handleActions(actions) {

    let clientPromises = [];

    _.forEach(actions, action => {
      let clientPromise = null;

      switch (action.type) {

        case ACTION_TYPES.SEND_MESSAGE:
        case ACTION_TYPES.REPLY_TO_MESSAGE:
          clientPromise = this._client.sendMessage(
            action.target,
            action.payload.text,
            action.payload.options
          );
          break;

        case ACTION_TYPES.FORWARD_MESSAGE:
          clientPromise = this._client.forwardMessage(
            action.target,
            action.payload.fromChatId,
            action.payload.messageId
          );
          break;

        case ACTION_TYPES.SEND_FILE:
          if (_.isFunction(this._client[`send${_.capitalize(action.payload.fileType)}`])) {
            clientPromise = this._client[`send${_.capitalize(action.payload.fileType)}`](
              action.target,
              action.payload.url,
              action.payload.options
            );
          } else {
            clientPromise = Promise.reject();
          }
          break;

        case ACTION_TYPES.SEND_CHAT_ACTION:
          clientPromise = this._client.sendChatAction(
            action.target,
            action.payload.action
          );
          break;

        // TODO: Rest of the API

        default:
          // Unknown command
          clientPromise = Promise.reject('Unknown command');
      }

      clientPromises.push(clientPromise);
    });

    // TODO: Some kind of error handling?
    return clientPromises;
  }

  _parseMessage(msg) {
    let event = {};

    // Mandatory properties
    event.origin = this._type;
    event.fromBot = this._name;
    event.eventId = msg.message_id;
    event.text = msg.text;
    event.userId = msg.from.id;

    // Parse metadata
    event.meta = { type: 'message' };
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

  _parseInlineQuery(msg) {
    let event = {};

    // Mandatory properties
    event.origin = this._type;
    event.fromBot = this._name;
    event.eventId = msg.id;
    event.text = msg.query;
    event.userId = msg.from.id;

    // Parse metadata
    event.meta = { type: 'inline_query' };
    event.meta.offset = msg.offset;

    event.meta.location = (msg.location) ?
      {
        longitude: msg.location.longitude,
        latitude: msg.location.latitude
      } : null;

    return event;
  }

  _parseChosenInlineResult(msg) {
    let event = {};

    // Mandatory properties
    event.origin = this._type;
    event.fromBot = this._name;
    event.eventId = msg.result_id;
    event.text = msg.query;
    event.userId = msg.from.id;

    // Parse metadata
    event.meta = { type: 'chosen_inline_result' };

    event.meta.location = (msg.location) ?
      {
        longitude: msg.location.longitude,
        latitude: msg.location.latitude
      } : null;

    event.meta.inlineMessageId = (msg.inline_message_id) ?
      msg.inline_message_id : null;

    return event;

  }

};
