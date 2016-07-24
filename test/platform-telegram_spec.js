const expect = require('chai').expect;

const testData = require('./data/telegram-messages');

const Platform = require('../src/platforms/telegram');


describe('Telegram Platform', () => {
  let bot = null;

  before(() => {
    bot = new Platform('TestBot', {
      token: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'
    });
  });

  describe('Parses correctly', () => {

    it('normal message', () => {
      const parsedEvent = bot._parseMessage(testData.rawIltaaMessage.message);
      expect(parsedEvent).to.containSubset(testData.parsedIltaaMessage);
    });

    it.skip('inline query', () => {
      // TODO
    });

    it.skip('chosen inline result', () => {
      // TODO
    });

  });
});
