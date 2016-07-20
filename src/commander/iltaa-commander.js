// # IltaaCmdr - example commander
//
const Promise = require('bluebird');


class IltaaCmdr {

  // # getBidForEvent
  // returns "bid" for event, intenting is this commander
  // willing to handle this event or not.
  //
  // Must always return a Promise.
  getBidForEvent(event) {
    if (event.rawInput.indexOf('/iltaa') > 0) {
      return Promise.resolve({
        interested: true
      });
    } else {
      return Promise.resolve({});
    }
  }
}

module.exports = IltaaCmdr;
