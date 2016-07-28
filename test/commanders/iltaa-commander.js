// # IltaaCommander - example commander
//
const Promise = require('bluebird');

const actions = require('../../src/action-creators');


class IltaaCommander {

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
    this._iltaaCount += 1;

    // Return an "Intent"-object. It can be a single Promise or an array of them
    // (TODO: we need to think about this format)
    return Promise.resolve(actions.sendMessage(event.meta.targetId, 'Game of Iltuz'));
  }

}

module.exports = IltaaCommander;
