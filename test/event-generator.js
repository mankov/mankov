// # event-generator
//
//  made for generating "mankov events" for testing purposes
const _ = require('lodash');

let idCounter = 1337;

const generator = {};

generator.textEvent = (text, opts) => {
  idCounter += 1;
  const eventId = idCounter;

  let template = {
    origin: 'telegram',
    fromBot: 'TestBot',
    userId: 1337,
    meta: {
      replyToMessage: undefined,
      userName: 'testuser',
      userFirstName: 'Foo',
      userLastName: 'Bar',
      userCallName: 'Foo',
      isFromGroup: false,
      chatGroupId: null,
      chatGroupTitle: null,
      editDate: null,
      targetId: 1337
    }
  };

  let event = _.merge(template, opts, { eventId, text });

  return event;
};


module.exports = generator;
