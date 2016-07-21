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


module.exports = data;
