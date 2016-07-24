// # LogMonitor
//  Example monitor which simply saves the last event to variable

const log = require('../../src/logger')(__filename);

module.exports = class LogMonitor {

  constructor() {
    this._lastEvent = null;
  }

  get lastEvent() {
    return this._lastEvent;
  }

  // NOTE: Should we return Promises from monitors also?
  handleEvent(event) {
    this._lastEvent = event;
    log.debug(`Logging event, id: ${event.eventId}`);
    return;
  }

};
