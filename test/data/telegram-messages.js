const data = {};

// Raw Telegram-message containing "/iltaa"
data.rawIltaaMessage = {
  update_id: 512704821,
  message: {
    message_id: 9527,
    from: {
      id: 1337,
      first_name: 'Foo',
      last_name: 'Bar',
      username: 'ncmpl'
    },
    chat: {
      id: 1337,
      first_name: 'Foo',
      last_name: 'Bar',
      username: 'foobar',
      type: 'private'
    },
    date: 1469138289,
    text: '/iltaa',
    entities: [
      { type: 'bot_command', offset: 0, length: 6 }
    ]
  }
};

data.parsedIltaaMessage = {
  origin: 'telegram',
  fromBot: 'TestBot',
  eventId: 9527,
  text: '/iltaa',
  userId: 1337,
  meta: {
    replyToMessage: undefined,
    userName: 'ncmpl',
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


module.exports = data;
