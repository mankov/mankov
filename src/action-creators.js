// # action-creators
//
//  Pure functions for creating action-objects which the platform bots then
//  translates to actual operations on that platform.
const _ = require('lodash');

const types = require('./action-types');

const creator = {};

creator.sendMessage = (text, options = {}) => _.assign(
  _baseAction(types.SEND_MESSAGE, options.target, options.toBot),
  { payload: { text, options: options.optional } }
);

creator.sendFile = (url, options = {}) => _.assign(
  _baseAction(types.SEND_FILE, options.target, options.toBot),
  { payload: { fileType: options.fileType, url, options: options.optional } }
);

function _baseAction(type, target, toBot) {
  return {
    type,
    target: target || null,
    toBot: toBot || null
  };
}

module.exports = creator;
