const express     = require('express');
const bodyParser  = require('body-parser');

const log      = require('./logger')(__filename);

const DEFAULT_ADDRESS = 'localhost';
const DEFAULT_PORT = 3000;


module.exports = class Core {
  constructor(port = DEFAULT_PORT, address = DEFAULT_ADDRESS) {
    this._tgApiKey = null;
    this._webhookUrl = null;
    this._port = port;
    this._address = address;

    this._server = express();
    this._server.use(bodyParser.urlencoded({ extended: false }));
    this._server.use(bodyParser.json());

    // # Start the server
    this._server.listen(this._port, this._address, () => {
      log.info(`Mankov started at ${this._address}:${this._port}`);
    });
  }

  subscribeWebhook(url, callback) {
    if (!this._webhookUrl) {
      this._webhookUrl = url;
      this._server.post(url, (req, res) => {
        callback(req);
      });
    }
  }
};
