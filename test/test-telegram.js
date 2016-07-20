const expect = require('./common').expect;

const apiLib  = require('../src/telegram-api');
const tgMock = require('./telegram-mock');

const options = {
  apiKey: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
  chatId: -12345678,
  webhookUrl: '',
  forwardMsg: 1212121,
  fromChat: -87654321
};

const api = new apiLib(options.apiKey);
tgMock(options);

it('getMe()', () =>
  expect(api.getMe()).eventually.be.fulfilled
);

it('sendMessage()', () =>
  expect(api.sendMessage({ chat_id: options.chatId, text: 'Test' }))
  .eventually.be.fulfilled
);

it('forwardMessage()', () =>
  expect(api.forwardMessage({ chat_id: options.chatId, from_chat_id: options.fromChat, message_id: options.forwardMsg }))
  .eventually.be.fulfilled
);

it('sendAction()', () =>
  expect(api.sendAction({ chat_id: options.chatId, action: 'typing' }))
  .eventually.be.fulfilled
);
