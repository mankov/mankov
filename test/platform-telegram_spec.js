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


  it('Parses raw Telegram message', () => {
    const parsedEvent = platform.parseMessage(testData.rawIltaaMessage.message);

    console.log('parsed event', parsedEvent);
    // TODO actually check the result
  });
});
