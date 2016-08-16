// # Multi-commander - example commander which has intrest in many events
//
const Promise = require('bluebird');

const handlerBase = require('../../src/eventhandler-base');
const actions = require('../../src/action-creators');


module.exports = class MultiCommander extends handlerBase {

  constructor() {
    super();
    this.initFirstIntrest();
    this.initSecondIntrest();
  }

  initFirstIntrest() {
    this.handlers.push({
      intrested: (event) => Promise.resolve(),
      description: 'Always is interested',
      handleEvent: (event) => Promise.resolve(
        actions.sendMessage(`You are interesting!`)
      )
    });
  }

  initSecondIntrest() {
    this.handlers.push({
      intrested: (event) => Promise.reject(),
      description: 'Always not interested',
      handleEvent: (event) => Promise.resolve(
        actions.sendMessage('I´m useless, because I´m not interesting!')
      )
    });
  }

};
