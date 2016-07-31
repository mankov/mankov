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
    type: 'message',
    chatId: 1337,
    chatType: 'private',
    replyToMessage: undefined,
    userName: 'ncmpl',
    userFirstName: 'Foo',
    userLastName: 'Bar',
    userCallName: 'ncmpl',
    chatGroupTitle: null,
    editDate: null,
    entities: [
      { type: 'bot_command', offset: 0, length: 6 }
    ]
  }
};


module.exports = data;
