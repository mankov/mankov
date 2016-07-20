// # telegram-parser
//
//  Parses events coming from Telegram webhook into more useful "Mankov Event"-object

const _ = require('lodash');

const log = require('./logger')(__filename);

module.exports = function parseTelegramEvent(msg) {
  log.debug('Webhook event from id %s, message: %s', msg.from.id, msg.text);

  // # Parse the message into "event"-object which is passed forward
  let event = {};


  // Map data from Telegram message
  event.rawInput = msg.text;
  event.eventId = msg.message_id;

  event.userId = msg.from.id;
  event.userName = msg.from.username;
  event.userFirstName = msg.from.first_name;
  event.userLastName = msg.from.last_name;
  event.userCallName = _.isUndefined(event.userName)
    ? event.userFirstName
    : `@${event.userName}`; // this can be used on messages

  event.replyToMessage = msg.reply_to_message;

  event.isFromGroup = !_.isUndefined(msg.chat.title);
  event.chatGroupId = event.isFromGroup ? msg.chat.id : null;
  event.chatGroupTitle = event.isFromGroup ? msg.chat.title : null;

  event.editDate = (msg.edit_date) ? msg.edit_date : null;
  event.entities = (msg.entities) ? msg.entities : null;


  // Parse command & possible parameters
  let userInputArray = msg.text.split(' ');
  event.userCommand = userInputArray.shift().toLowerCase().split('@')[0];
  event.userCommandParams = userInputArray.join(' ');

  event.targetId = (event.isFromGroup) ? event.chatGroupId : event.userId;


  return event;
};
