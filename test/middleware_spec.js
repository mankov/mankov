const assert = require('chai').assert;
const sinon = require('sinon');

const eventGenerator = require('./event-generator');

const Mankov = require('../src/index');
const userMiddleware = require('./middlewares/user-middleware');


describe('Middleware', () => {
  let mankov = null;

  before(() => {
    mankov = new Mankov();
    mankov.addMiddleware(userMiddleware);

    mankov.sendEventToMonitors = sinon.spy();
  });

  it('Attached middleware transforms event object', () => {
    const testEvent = eventGenerator.textEvent('test event');

    return mankov.processEvent(testEvent).then(() => {
      assert(mankov.sendEventToMonitors.calledWith(Object.assign({},
        testEvent,
        { user: { authenticated: false } }
      )));
    });
  });

});
