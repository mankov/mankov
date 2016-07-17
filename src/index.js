/* eslint-disable no-unused-vars */
// ^ this is disabled since express error handlers must announce
//   all the required parameters in order to work, and it mismatches
//   with that rule

const express     = require('express');
const bodyParser  = require('body-parser');
const _           = require('lodash');
const logger      = require('./logger')('../log.out');

module.exports = class Core {
  constructor(port = 3000, address = 'localhost') {
    this._tgApiKey = null;
    this._webhookUrl = null;
    this._port = port;
    this._address = address;

    this._server = express();
    this._server.use(bodyParser.urlencoded({ extended: false }));
    this._server.use(bodyParser.json());

    // # Start the server
    this._server.listen(this._port, this._address, () => {
      logger.log('info', 'Mankov-core started at ' + this._address + ':' + this._port);
    });
  }

  subscribeWebhook(url, cb) {
    if (!this._webhookUrl) {
      this._webhookUrl = url;
      this._server.post(url, (req,res) => {
        cb(req);
      });
    }
  }
}
