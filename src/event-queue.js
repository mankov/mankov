// This module keeps track of already handled messages. Since Telegram APi might
// re-send on startup the message several times, some commands might create
// duplicates to DB etc

class EventQueue {

  constructor() {
    this._historySize = 15; // how many message id's will be stored
    this._history = []; // array of previous messages
    this._inProgress = {}; // events currently in "progress"
    this._processedCount = 0; // events succesfully handler
  }

  // returns true if event is currently in processing / has been processed
  hasEvent(eventId) {
    if (this._history.indexOf(eventId) >= 0) {
      // this event has already been processed
      return true;
    }
    else if (this._inProgress[eventId]) {
      // event is currently in progress
      return true;
    }
    else {
      return false;
    }
  }

  onProcessingStart(eventId) {
    this._inProgress[eventId] = true;
  }

  onProcessingFail(eventId) {
    delete this._inProgress[eventId];
  }

  onProcessingFinish(eventId) {
    delete this._inProgress[eventId];

    this._history.push(eventId);

    if (this._history.length > this._historySize) {
      this._history.shift();
    }

    this._processedCount++;
  }

  getProcessedCount() {
    return this._processedCount;
  }
}


module.exports = EventQueue;
