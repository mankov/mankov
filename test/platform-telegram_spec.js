const expect = require('chai').expect;

const testData = require('./data/telegram-messages');

const Platform = require('../src/platforms/telegram');


describe('Telegram Platform', () => {
  let platform = null;

  before(() => {
    platform = new Platform({
      name: 'test',
      client: {
        token: 'abc-1337'
      }
    });
  });


  it('Parses raw Telegram message correctly', () => {
    const parsedEvent = platform.parseMessage(testData.rawIltaaMessage.message);
    expect(parsedEvent).to.containSubset(testData.parsedIltaaMessage);
  });
});
