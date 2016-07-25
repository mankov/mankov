// # action-creators
//
//  Pure functions for creating action-objects which the platform bots then
//  translates to actual operations on that platform.

const types = require('./action-types');

const creator = {};

creator.sendMessage = (target, text) => ({
  type: types.SEND_MESSAGE,
  payload: { text }
});

module.exports = creator;
