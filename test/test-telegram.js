/* eslint-disable mocha/no-skipped-tests */

const expect = require('./common').expect;

const apiLib  = require('../src/telegram-api');
const tgMock = require('./telegram-mock');

const options = {
  apiKey: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
  chatId: -12345678,
  webhookUrl: 'http://localhost:3000/api/webhook',
  certificate: './test-cert.pem',
  forwardMsg: 1212121,
  fromChat: -87654321,
  fileID: 123564
};

const api = new apiLib(options.apiKey);
tgMock(options);

describe('Normal methods', () => {

  it('getMe()', () =>
    expect(api.getMe()).eventually.be.fulfilled
  );

  it('sendMessage()', () =>
    expect(api.sendMessage({ chat_id: options.chatId, text: 'Test' }))
    .eventually.be.fulfilled
  );

  it('forwardMessage()', () =>
    expect(api.forwardMessage({
      chat_id: options.chatId,
      from_chat_id: options.fromChat,
      message_id: options.forwardMsg
    }))
    .eventually.be.fulfilled
  );

  it('sendAction()', () =>
    expect(api.sendAction({ chat_id: options.chatId, action: 'typing' }))
    .eventually.be.fulfilled
  );

  it('setWebhook()', () =>
    expect(api.setWebhook({ url: options.webhookUrl, certificate: options.certificate }))
    .eventually.be.fulfilled
  );

  it('sendSticker()', () =>
    expect(api.sendSticker({ chat_id: options.chatId, file: options.fileID }))
    .eventually.be.fulfilled
  );

  it('sendVideo()', () =>
    expect(api.sendVideo({ chat_id: options.chatId, file: options.fileID }))
    .eventually.be.fulfilled
  );

  it('sendPhoto()', () =>
    expect(api.sendPhoto({ chat_id: options.chatId, file: options.fileID }))
    .eventually.be.fulfilled
  );

  it.skip('sendDocument()', () => {

  });

  it.skip('sendVoice()', () => {

  });

  it.skip('sendLocation()', () => {

  });

  it.skip('sendVenue()', () => {

  });

  it.skip('sendContact()', () => {

  });

  it.skip('sendChatAction()', () => {

  });

  it.skip('getUserProfilePhotos()', () => {

  });

  it.skip('kickChatMember()', () => {

  });

  it.skip('leaveChat()', () => {

  });

  it.skip('unbanChatMember()', () => {

  });

  it.skip('getChat()', () => {

  });

  it.skip('getChatAdministrators()', () => {

  });

  it.skip('getChatMemberCount()', () => {

  });

  it.skip('getChatMember()', () => {

  });

});

describe('Inline methods', () => {

  it.skip('answerCallBackQuery()', () => {

  });

  it.skip('InlineQuery()', () => {

  });

  it.skip('answerInlineQuery()', () => {

  });

  it.skip('InlineQueryResult()', () => {

  });

  it.skip('InlineQueryResultArticle()', () => {

  });

  it.skip('InlineQueryResultPhoto()', () => {

  });

  it.skip('InlineQueryResultGif()', () => {

  });

  it.skip('InlineQueryResultMpeg4Gif()', () => {

  });

  it.skip('InlineQueryResultVideo()', () => {

  });

  it.skip('InlineQueryResultAudio()', () => {

  });

  it.skip('InlineQueryResultVoice()', () => {

  });

  it.skip('InlineQueryResultDocument()', () => {

  });

  it.skip('InlineQueryResultLocation()', () => {

  });

  it.skip('InlineQueryResultVenue()', () => {

  });

  it.skip('InlineQueryResultContact()', () => {

  });

  it.skip('InlineQueryResultCachedSticker()', () => {

  });

  it.skip('InlineQueryResultCachedPhoto()', () => {

  });

  it.skip('InlineQueryResultCachedGif()', () => {

  });

  it.skip('InlineQueryResultCachedMpeg4Gif()', () => {

  });

  it.skip('InlineQueryResultCachedVideo()', () => {

  });

  it.skip('InlineQueryResultCachedAudio()', () => {

  });

  it.skip('InlineQueryResultCachedVoice()', () => {

  });

  it.skip('InlineQueryResultCachedDocument()', () => {

  });

  it.skip('InputTextMessageContent()', () => {

  });

  it.skip('InputLocationMessageContent()', () => {

  });

  it.skip('InputVenueMessageContent()', () => {

  });

  it.skip('InputContactMessageContent()', () => {

  });

  it.skip('ChosenInlineResult()', () => {

  });

});
