// # MoroResponder
//  example Responder
const Promise = require('bluebird');
const _       = require('lodash');

const actions = require('../../src/action-creators');
const handlerBase = require('../../src/eventhandler-base');


const TRIGGER_KEYWORD = 'moro';

module.exports = class MoroResponder extends handlerBase {
  // Constructor is not mandatory for responder. In this example
  // it is used to determine the probability for morotteling and
  // postfix to be appended to each response
  constructor(probabilityPercent, messagePostfix) {
    super();

    probabilityPercent = _.isNumber(probabilityPercent)
      ? probabilityPercent
      : 100;

    probabilityPercent = (probabilityPercent > 100 || probabilityPercent < 0)
      ? probabilityPercent
      : 100;

    this._probabilityPercent = probabilityPercent;
    this._messagePostfix = messagePostfix || null;

    this.handlers = [
      {
        intrested: (event) => ((event.text.toLowerCase().indexOf(TRIGGER_KEYWORD) >= 0) ?
          Promise.resolve() : Promise.reject()),

        description: 'Lisää "moro" tekstin loppuun',

        probability: this._probabilityPercent,

        handleEvent: (event) => {
          const message = `${event.text} ${this._messagePostfix}`;

          // "roll the dice" will we respond or not
          const dice = _.random(0, 100);
          if (dice <= this._probabilityPercent) {
            const action = actions.sendMessage(message);
            return Promise.resolve([action]);
          } else {
            return Promise.resolve();
          }
        }
      }
    ];
  }

  // handleEvent is the only mandatory function for responder.
  // It takes event as an input and returns intent(s) as a result,
  // if it wants to.
};
