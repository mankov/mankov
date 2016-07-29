const expect = require('chai').expect;
const assert = require('chai').assert;

const tgMock = require('./telegram_mock');

const testData = require('./data/telegram-messages');
const eventGenerator = require('./event-generator');

const Mankov = require('../src/index');

const IltaaCommander  = require('./commanders/iltaa-commander');
const MoroResponder   = require('./responders/moro-responder');
const logMonitor      = require('./monitors/log-monitor');

const TG_TOKEN = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

describe('Mankov Core', () => {
  let mankov = null;
  let mock = null;

  before(() => {
    mankov = new Mankov();
    mock = new tgMock(TG_TOKEN);
    mankov.createBot('telegram', 'TestBot', { token: TG_TOKEN });
    // NOTE: all the tests after this attaches commanders/responders/monitors
    // to this mankov instance. Their event handling MIGHT collide at some point
    // so it is something to take care of. Or we could implement clearCommanders()
    // etc functions to core?
  });

  describe('Commanders', () => {
    before(() => {
      mankov.addCommander(new IltaaCommander());
    });


    it('Handles basic /iltaa-command', () => mankov
      .getActions(testData.parsedIltaaMessage)
      .then(actions => {
        expect(actions[0]).to.containSubset({
          type: 'SEND_MESSAGE',
          payload: {
            text: 'Game of Iltuz',
            target: testData.parsedIltaaMessage.userId
          }
        });
      })
    );
  });


  describe('Responders', () => {
    before(() => {
      mankov.addResponder(new MoroResponder(100, 'testimoroprefix'));
    });

    it('Responds to message with a keyword', () => mankov
      .getActions(eventGenerator.textEvent('juuh moro nääs'))
      .then(actions => {
        expect(actions).to.be.an.array;
        expect(actions).to.have.length(1);

        assert(
          actions[0].payload.text.indexOf('testimoroprefix') >= 0,
          'prefix should´ve been added to end of response action text'
        );
      })
    );
  });


  describe('Comamnders and Responders', () => {
    before(() => {
      // this relies that the IltaaCommander and MoroResponder
      // are attached to mankov previously
    });

    it('Ignores events with no keywords in them', () => mankov
      .getActions(eventGenerator.textEvent('no keywords in it'))
      .then(actions => {
        expect(actions).to.be.an.array;
        expect(actions.length).to.equal(0);
      })
    );
  });

  describe('Monitors', () => {
    let monitor = null;

    before(() => {
      monitor = new logMonitor();
      mankov.addMonitor(monitor);
    });

    it('can add a monitor to the core', () => {
      mankov.sendEventToMonitors(testData.parsedIltaaMessage);
      expect(monitor.lastEvent).to.equal(testData.parsedIltaaMessage);
    });

    it.skip('should not crash the core even if there was an error', () => {
      // TODO
    });

  });

  describe('Platforms', () => {

    // Clear platforms before each test
    beforeEach(() => {
      mankov._bots = [];
    });

    it('should give available platforms', () => {
      expect(mankov.getAvailablePlatforms()).to.deep.equal(['telegram', 'irc']);
    });

    it('should be able to create a Telegram bot', (done) => {
      // TODO: these could be in a dedicated test file?
      const name = 'TestTGBot';
      const options = { token: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11' };

      mankov.createBot('telegram', name, options)
      .then((bot) => {

        expect(bot.name).to.equal(name);
        expect(bot.onMessage).to.be.a.function;

        // Platform specific asserts
        expect(bot.client.token).to.equal(options.token);

        done();
      });
    });

    it('should be able to create an IRC bot', (done) => {
      // TODO: these could be in a dedicated test file?
      const name = 'TestIRCBot';
      const options = {
        server: 'http://example.com',
        nick: 'Mankov'
      };

      mankov.createBot('irc', name, options)
      .then((bot) => {

        expect(bot.name).to.equal(name);
        expect(bot.onMessage).to.be.a.function;

        // Platform specific asserts
        // ...

        done();
      });
    });

    it('should not allow to create a bot with same name', () => {
      const name = 'TestIRCBot';
      const options = {
        server: 'http://example.com',
        nick: 'Mankov'
      };

      // First time should be ok
      expect(mankov.createBot('irc', name, options)).eventually.resolved;

      expect(mankov.createBot('irc', name, options)).eventually.rejectedWith(
        `Bot with name "${name}" has already been created.`
      );
    });

    it('should reject if platform type was not found', () =>
      expect(mankov.createBot('unknownPlatform', {})).eventually.rejected
    );

  });

});
