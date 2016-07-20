const expect = require('./common').expect;

const apiLib  = require('../src/telegram-api');
const tgMock = require('./telegram-mock');

const token = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

tgMock(token);
const api = new apiLib(token);

const options = {
  chatId: -12345678
};

it('getMe()', () =>
  expect(api.getMe()).eventually.be.fulfilled
);

it('sendMessage()', () =>
  expect(api.sendMessage({ chat_id: options.chatId, text: 'Test' }))
  .eventually.be.fulfilled
);

it('forwardMessage()', () =>
  expect(api.forwardMessage({ chat_id: options.chatId, from_chat_id: 12345678, message_id: 12345 }))
  .eventually.be.fulfilled
);

it('sendAction()', () =>
  expect(api.sendAction({ chat_id: options.chatId, action: 'typing' }))
  .eventually.be.fulfilled
);
