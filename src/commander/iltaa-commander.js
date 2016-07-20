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
    if (event.rawInput
        .toLowerCase()
        .indexOf('/iltaa') > 0
    ) {
      return Promise.resolve({
        interested: true,
        description: 'Iltuilee käyttäjälle'
      });
    } else {
      return Promise.reject();
    }
  }

  handleEvent(event) {

  }

}

module.exports = IltaaCmdr;
