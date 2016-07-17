// # telegram-queue
//
//  This module keeps track of already handled messages. Since Telegram API might
//  re-send on startup the message several times, we need to make sure that all messages
//  are handled only once.
//
// TODO:
//    Current implementation does not work if this module is used in paraller simultaneously
//

module.exports = class Queue {

  constructor() {
    this._queueSize = 15; // how many message id's will be stored
    this._queue = []; // array of previous messages
    this._inProgress = {}; // messages currently in "progress"
    this._messageCounter = 0; // messages succesfully handled
  }

  // marks the message to be "in progress", returns false if this message
  // is already in progress or has already been parsed
  startProcessingMsg(updateId) {
    if (this._queue.indexOf(updateId) >= 0) {
      // this message has already been parsed
      return false;
    } else if (this._inProgress[updateId]) {
      // message is already in progress, abort
      return false;
    } else {
      this._inProgress[updateId] = true;
      return true;
    }
  }

  messageProcessingFailed(updateId) {
    delete this._inProgress[updateId];
  }

  messageProcessed(updateId) {
    delete this._inProgress[updateId];

    this._queue.push(updateId);
    if (this._queue.length > this._queueSize) {
      this._queue.shift();
    }

    this._messageCounter++;
  }

  getEventCount() {
    return this._messageCounter;
  }

};
