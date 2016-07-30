// This module keeps track of already handled messages. Since Telegram APi might
// re-send on startup the message several times, some commands might create
// duplicates to DB etc
const _ = require('lodash');


module.exports = class EventQueue {

  constructor() {
    this._historySize = 15; // how many message id's will be stored
    this._history = {}; // array of previous messages
    this._inProgress = {}; // events currently in "progress"
    this._processedCount = 0; // events succesfully handler
  }

  // returns true if event is currently in processing / has been processed
  hasEvent(eventId, botName) {
    if (_.has(this._history, botName) && this._history[botName].indexOf(eventId) >= 0) {
      // this event has already been processed
      return true;
    }
    else if (_.has(this._inProgress, [botName, eventId])) {
      // event is currently in progress
      return true;
    }
    else {
      return false;
    }
  }

  onProcessingStart(eventId, botName) {
    if (!botName) {
      throw new Error('No botName specified');
    }

    _.set(this._inProgress, [botName, eventId], true);
  }

  onProcessingFail(eventId, botName) {
    _.unset(this._inProgress, [botName, eventId]);
  }

  onProcessingFinish(eventId, botName) {
    // Init bot specific history array if it doesn't exist
    if (!_.has(this._history, botName)) {
      this._history[botName] = [];
    }

    // Push event to history
    this._history[botName].push(eventId);

    // Remove event from progress
    _.unset(this._inProgress, [botName, eventId]);

    // Pop stuff from history if max length is received
    if (this._history[botName].length > this._historySize) {
      this._history[botName].shift();
    }

    this._processedCount++;
  }

  get processedCount() {
    return this._processedCount;
  }

};
