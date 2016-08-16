// # IltaaCommander - example commander
//
const Promise = require('bluebird');

const handlerBase = require('../../src/eventhandler-base');
const actions = require('../../src/action-creators');


module.exports = class IltaaCommander extends handlerBase {

  constructor() {
    super();
    this._iltaaCount = 0;

    this.handlers = [
      {
        intrested: this.hasIltaa,

        description: 'Iltuilee käyttäjälle',

        handleEvent: (event) => {
          this._iltaaCount += 1;

          // Return an "Intent"-object. It can be a single Promise or an array of them
          // (TODO: we need to think about this format)
          return Promise.resolve(
            actions.sendMessage('Game of Iltuz')
          );
        }
      }
    ];
  }

  hasIltaa(event) {
    return (event.text.toLowerCase().indexOf('/iltaa') >= 0) ?
      Promise.resolve() : Promise.reject();
  }

};
