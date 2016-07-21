const nock = require('nock');

// TODO: Give authentic response

module.exports = (options) =>
  nock(`https://api.telegram.org/bot${options.apiKey}`)

    .get('/getMe')
    .reply(200, { ok: true, result: {} })

    .post('/sendMessage', { chat_id: options.chatId, text: 'Test' })
    .reply(200, { ok: true, result: {} })

    .post('/forwardMessage', { chat_id: options.chatId, from_chat_id: options.fromChat, message_id: options.forwardMsg })
    .reply(200, { ok: true, result: {} })

    .post('/sendChatAction', { chat_id: options.chatId, action: 'typing' })
    .reply(200, { ok: true, result: {} })

    .post('/sendSticker', { chat_id: options.chatId, file: options.fileID })
    .reply(200, { ok: true, result: {} })

    .post('/sendVideo', { chat_id: options.chatId, file: options.fileID })
    .reply(200, { ok: true, result: {} })

    .post('/sendPhoto', { chat_id: options.chatId, file: options.fileID })
    .reply(200, { ok: true, result: {} })

    .post('/setWebhook', { url: '' })
    .reply(200, { ok: true, result: {} })

    .post('/setWebhook', { url: options.webhookUrl, certificate: options.certificate })
    .reply(200, { ok: true, result: {} })

    .post('/getFile', { file_id: '' })
    .reply(200, { ok: true, result: {} });

