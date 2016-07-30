const assert = require('chai').assert;
const expect = require('chai').expect;

const EventQueue = require('../src/event-queue');

describe('EventQueue', () => {
  let queue = null;

  const EVENT_ID = '123-abcö';
  const TG_BOT = 'telegram';
  const IRC_BOT = 'irc';


  before(() => {
    queue = new EventQueue();
  });

  it('Throws error if no botName is given', () => {
    assert.throws(() => queue.onProcessingStart(EVENT_ID));
  });

  it('Sets event to queue', () => {
    queue.onProcessingStart(EVENT_ID, TG_BOT);
    assert(queue.hasEvent(EVENT_ID, TG_BOT), 'Event should exist in queue');
  });

  it('Removes event from queue on failure callback', () => {
    queue.onProcessingFail(EVENT_ID, TG_BOT);
    assert(
      !queue.hasEvent(EVENT_ID, TG_BOT),
      'Event should not exist in queue after onProcessingFail'
    );
  });

  it('Failed event does not increase processed count', () => {
    assert(queue.processedCount === 0);
  });

  it('Processed event is added to history', () => {
    queue.onProcessingStart(EVENT_ID, TG_BOT);
    queue.onProcessingFinish(EVENT_ID, TG_BOT);

    assert(
      queue.hasEvent(EVENT_ID, TG_BOT),
      'Event should exist in queue after finish'
    );
  });

  it('Does not confuse with similar event IDs from different bots', () => {
    assert(!queue.hasEvent(EVENT_ID, IRC_BOT));
  });
});
