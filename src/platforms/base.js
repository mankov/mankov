// This class is responsible of common functions between platforms

module.exports = class BasePlatform {
  constructor(name) {
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
  //    onMessage(callback) ->  Core will call this function to connect incoming
  //                            messages to the pipeline. Callback has to be called
  //                            with parsed event as parameter
  //

};
