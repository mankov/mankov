const nock = require('nock');

module.exports = class TGMock {
  constructor(token) {
    this._mock = nock(`https://api.telegram.org/bot${token}`);
  }

  sendMessage(text, target, options) {
    let msg = { chat_id: target, text };
    this._mock.get('/sendMessage')
    .query(msg)
    .reply(200, { ok: true, result: msg });
  }

};
