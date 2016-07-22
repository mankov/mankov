const expect = require('chai').expect;

const testData = require('./data/telegram-messages');

const Platform = require('../src/platforms/telegram');


describe('Telegram Platform', () => {
  let bot = null;

  before(() => {
    bot = new Platform('test', {
      token: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'
    });
  });

  it('Parses raw Telegram message correctly', () => {
    const parsedEvent = bot._parseMessage(testData.rawIltaaMessage.message);
    expect(parsedEvent).to.containSubset(testData.parsedIltaaMessage);
  });
});
