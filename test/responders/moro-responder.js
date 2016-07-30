// # MoroResponder
//  example Responder
const Promise = require('bluebird');
const _ = require('lodash');
const actions = require('../../src/action-creators');

const TRIGGER_KEYWORD = 'moro';

class MoroResponder {
  // Constructor is not mandatory for responder. In this example
  // it is used to determine the probability for morotteling and
  // postfix to be appended to each response
  constructor(probabilityPercent, messagePostfix) {
    probabilityPercent = _.isNumber(probabilityPercent)
      ? probabilityPercent
      : 100;

    probabilityPercent = (probabilityPercent > 100 || probabilityPercent < 0)
      ? probabilityPercent
      : 100;

    this._probabilityPercent = probabilityPercent;
    this._messagePostfix = messagePostfix || null;
  }

  // handleEvent is the only mandatory function for responder.
  // It takes event as an input and returns intent(s) as a result,
  // if it wants to.
  handleEvent(event) {
    if (event.text.toLowerCase().indexOf(TRIGGER_KEYWORD) >= 0) {

      // keyword found. do some actual magic
      const message = `${event.text} ${this._messagePostfix}`;


      // "roll the dice" will we respond or not
      const dice = _.random(0, 100);
      if (dice <= this._probabilityPercent) {
        const action = actions.sendMessage(message);
        return Promise.resolve([action]);
      }
    }

    return Promise.reject();
  }
}


module.exports = MoroResponder;
