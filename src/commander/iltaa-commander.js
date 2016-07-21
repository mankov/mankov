// # IltaaCmdr - example commander
//
const Promise = require('bluebird');


class IltaaCmdr {

  constructor() {
    this._iltaaCount = 0;
  }

  // # getBidForEvent
  // returns "bid" for event, intenting is this commander
  // willing to handle this event or not.
  //
  // Must always return a Promise.
  getBidForEvent(event) {
    if (event.text
        .toLowerCase()
        .indexOf('/iltaa') >= 0
    ) {
      return Promise.resolve({
        description: 'Iltuilee käyttäjälle',
        commander: this
      });
    } else {
      return Promise.reject();
    }
  }

  handleEvent(event) {
    console.log('Doing something');
    this._iltaaCount += 1;

    // Return an "Intent"-object
    // (TODO: we need to think about this format)
    // TODO: there can be multiple intents from one command. Should we always
    //       return them in array, even if there is just one?
    return Promise.resolve({
      action: 'sendMessage',
      targetId: event.replyTarget,
      text: 'Game of Iltuz'
    });
  }

}

module.exports = IltaaCmdr;
