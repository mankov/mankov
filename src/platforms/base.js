// This class is responsible of common functions between platforms

module.exports = class BasePlatform {
  constructor(name) {
    this._name = name;
    this._client = null;
  }

  get name() {
    return this._name;
  }

  get client() {
    return this._client;
  }

};
