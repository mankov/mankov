const expect = require('chai').expect;

const coreLib = require('../src/index');

const core = coreLib.create();

describe('platforms', () => {

  // Clear platforms before each test
  beforeEach(() => {
    core._bots = [];
  });

  it('should give available platforms', () => {
    expect(core.getAvailablePlatforms()).to.deep.equal(['telegram', 'irc']);
  });

  it('should be able to create a Telegram bot', (done) => {
    const name = 'TestTGBot';
    const options = { token: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11' };

    core.createBot('telegram', name, options)
    .then((bot) => {

      expect(bot.name).to.equal(name);
      expect(bot.onMessage).to.be.a.function;

      // Platform specific asserts
      expect(bot.client.token).to.equal(options.token);

      done();
    });
  });

  it('should be able to create an IRC bot', (done) => {
    const name = 'TestIRCBot';
    const options = {
      server: 'http://example.com',
      nick: 'Mankov'
    };

    core.createBot('irc', name, options)
    .then((bot) => {

      expect(bot.name).to.equal(name);
      expect(bot.onMessage).to.be.a.function;

      // Platform specific asserts
      // ...

      done();
    });
  });

  it('should not allow to create platform with same name', () => {
    const name = 'TestIRCBot';
    const options = {
      server: 'http://example.com',
      nick: 'Mankov'
    };

    // First time should be ok
    expect(core.createBot('irc', name, options)).eventually.resolved;

    expect(core.createBot('irc', name, options)).eventually.rejectedWith(
      `Bot with name "${name}" has already been created.`
    );
  });

  it('should reject if platform type was not found', () =>
    expect(core.createBot('unknownPlatform', {})).eventually.rejected
  );

});
