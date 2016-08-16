const _       = require('lodash');
const Promise = require('bluebird');

module.exports = class eventHandlerBase {
  constructor() {
    this._handlers = [];
  }

  get handlers() {
    return this._handlers;
  }

  set handlers(newHandlers) {
    if (_.isArray(newHandlers)) {
      this._handlers = newHandlers;

    } else if (_.isObject(newHandlers)) {
      this._handlers = [newHandlers];
    }
  }

  // # getBidForEvent
  // returns "bids" for event, intenting is this commander
  // willing to handle this event or not.
  getBidForEvent(event) {

    return _.map(this._handlers, (handler) => {

      if (_.isFunction(handler.intrested)) {
        return handler.intrested(event)
        .then(() => {
          if (_.isFunction(handler.handleEvent) && _.isString(handler.description)) {
            return Promise.resolve({
              description: handler.description,
              handleEvent: handler.handleEvent
            });
          } else {
            return Promise.reject();
          }
        })
        .catch(() => Promise.reject());
      } else {
        return Promise.reject();
      }
    });
  }

};
