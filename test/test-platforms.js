const common = require('./common');
const expect = common.expect;

const coreLib = require('../src/index');

const core = coreLib.create();

describe('platforms', () => {

  // Clear platforms after each test
  beforeEach(() => {
    core._platforms = [];
  });

  it('should be able to create a Telegram platform', (done) => {
    const options = {
      name: 'TestTGBot',
      client: {
        token: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'
      }
    };

    core.createPlatform('telegram', options)
    .then((platform) => {

      expect(platform.name).to.equal(options.name);
      expect(platform).to.have.property('onMessage');
      expect(platform).to.have.property('parseMessage');

      // Platform specific tests
      expect(platform.client.token).to.equal(options.client.token);

      done();
    });
  });

  it('should be able to create an IRC platform', (done) => {
    const options = {
      name: 'TestIRCBot',
      client: {
        server: 'http://example.com',
        nick: 'Mankov'
      }
    };

    core.createPlatform('irc', options)
    .then((platform) => {

      expect(platform.name).to.equal(options.name);
      expect(platform).to.have.property('onMessage');
      expect(platform).to.have.property('parseMessage');

      // Platform specific tests
      // ...

      done();
    });
  });

  it('should not allow to create platform with same name', () => {
    const options = {
      name: 'TestIRCBot',
      client: {
        server: 'http://other.server.com',
        nick: 'Mankov'
      }
    };

    // First time should be ok
    expect(core.createPlatform('irc', options)).eventually.resolved;

    expect(core.createPlatform('irc', options)).eventually.rejectedWith(
      `Platform with name ${options.name} has already been created.`
    );
  });

  it('should reject if platform type was not found', () => {
    expect(core.createPlatform('unknownPlatform', {})).eventually.rejected;
  });

});
