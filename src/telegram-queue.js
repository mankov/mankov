// # telegram-queue
//
//  This module keeps track of already handled messages. Since Telegram API might
//  re-send on startup the message several times, we need to make sure that all messages
//  are handled only once.
//
// TODO:
//  - this should also be converted to ES6-class if that's what we are going to use?
//    Current implementation does not work if this module is used in paraller simultaneously
//

module.exports = {

  queueSize: 15, // how many message id's will be stored
  queue: [], // array of previous messages
  inProgress: {}, // messages currently in "progress"
  messageCounter: 0, // messages succesfully handled


  // marks the message to be "in progress", returns false if this message
  // is already in progress or has already been parsed
  startProcessingMsg(updateId) {
    if (this.queue.indexOf(updateId) >= 0) {
      // this message has already been parsed
      return false;
    } else if (this.inProgress[updateId]) {
      // message is already in progress, abort
      return false;
    } else {
      this.inProgress[updateId] = true;
      return true;
    }
  },

  messageProcessingFailed(updateId) {
    delete this.inProgress[updateId];
  },

  messageProcessed(updateId) {
    delete this.inProgress[updateId];

    this.queue.push(updateId);
    if (this.queue.length > this.queueSize) {
      this.queue.shift();
    }

    this.messageCounter++;
  },

  getEventCount() {
    return this.messageCounter;
  }
};
