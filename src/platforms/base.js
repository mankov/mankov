// This class is responsible of common functions between platforms

const EventEmitter = require('eventemitter3');

module.exports = class BasePlatform extends EventEmitter {
  constructor(name) {
    super();
    this._name = name;
    this._type = null;
    this._client = null;
  }

  get name() {
    return this._name;
  }

  get type() {
    return this._type;
  }

  get client() {
    return this._client;
  }

  // Inherited classes has to implement following functions:
  //
  //    static get type()   ->  Returns the type of the platform
  //
  //    TODO: Add rest of the functions

};
