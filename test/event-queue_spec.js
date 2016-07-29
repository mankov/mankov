
const assert = require('chai').assert;

const EventQueue = require('../src/event-queue');

describe('EventQueue', () => {
  let queue = null;
  const EVENT_ID = '123-abcö';

  before(() => {
    queue = new EventQueue();
  });


  it('Sets event to queue', () => {
    queue.onProcessingStart(EVENT_ID);
    assert(queue.hasEvent(EVENT_ID), 'Event should exist in queue');
  });

  it('Removes event from queue on failure callback', () => {
    queue.onProcessingFail(EVENT_ID);
    assert(!queue.hasEvent(EVENT_ID), 'Event should not exist in queue after onProcessingFail');
  });

  it('Failed event does not increase processed count', () => {
    assert(queue.getProcessedCount() === 0);
  });

  it('Processed event is added to history', () => {
    queue.onProcessingStart(EVENT_ID);
    queue.onProcessingFinish(EVENT_ID);

    assert(queue.hasEvent(EVENT_ID), 'Event should exist in queue after finish');
  });
});
