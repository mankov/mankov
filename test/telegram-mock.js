const nock = require('nock');

module.exports = (apiKey) =>
  nock(`https://api.telegram.org/bot${apiKey}`)

    .get('/getMe')
    .reply(200, { ok: true, result: {} })

    .post('/sendMessage', { chat_id: -12345678, text: 'Test' })
    .reply(200, { ok: true, result: {} })

    .post('/forwardMessage', { chat_id: -12345678, from_chat_id: 12345678, message_id: 12345 })
    .reply(200, { ok: true, result: {} })

    .post('/sendChatAction', { chat_id: -12345678, action: 'typing' })
    .reply(200, { ok: true, result: {} });
