const Promise = require('bluebird');

module.exports = class UserMiddleware {
  static transformEvent(event) {

    // < in here we could fetch user info from DB based on the event >


    event.user = {
      authenticated: false
    };

    return Promise.resolve(event);
  }
};
