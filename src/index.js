const Promise     = require('bluebird');
const _           = require('lodash');

const telegramPlatform  = require('./platforms/telegram');
const ircPlatform       = require('./platforms/irc');

const log = require('./logger')(__filename);

class Core {
  constructor() {

    // The handlers
    this._monitors = [];
    this._commanders = [];
    this._responders = [];

    // The platforms
    this._platforms = [];
    this._availablePlatforms = [
      { type: 'telegram', platform: telegramPlatform },
      { type: 'irc', platform: ircPlatform }
    ];

  }

  // Use this if you don't want to use "new" keyword
  static create() {
    return new Core();
  }

  createPlatform(type, options) {
    // TODO: validate options

    let chosenPlatform = _.find(this._availablePlatforms, ['type', type]);

    // Platform not found
    if (!chosenPlatform) {
      return Promise.reject(`Platform ${type} not available`);
    }

    // Allow only unique names
    if (this.findPlatformByName(options.name)) {
      return Promise.reject(`Platform with name ${options.name} has already been created.`);
    }

    // All ok, create platform
    let newPlatform = new chosenPlatform.platform(options);

    this._platforms.push(newPlatform);

    // Subscribe to pipeline
    newPlatform.onMessage(event => this.processEvent(event));

    log.debug(`Platform ${type} created with name ${options.name}`);
    return Promise.resolve(newPlatform);

  }

  // TODO: rename "getPlatformByName"?
  findPlatformByName(name) {
    return _.find(this._platforms, platform => platform.name === name);
  }

  getAvailablePlatforms() {
    return this._availablePlatforms.map(platform => platform.type);
  }

  addCommander(commanderInstance) {
    if (!_.isFunction(commanderInstance.getBidForEvent)) {
      log.error('No getBidForEvent defined for', commanderInstance, 'ignoring!');
    } else if (!_.isFunction(commanderInstance.handleEvent)) {
      log.error('No handleEvent defined for', commanderInstance, 'ignoring!');
    } else {
      this._commanders.push(commanderInstance);
    }
  }

  // "The start of the Pipeline"
  processEvent(event) {
    // TODO: call queue

    // TODO: send event to all monitors

    return Promise.resolve()
      .then(this.getIntentsFromCommanders(event))
      .then(function checkAreRespondersNeeded(commanderIntents) {
        if (commanderIntents.length === 0) {
          // No intents from Commanders - check from Responders
          return this.getIntentsFromResponders(event);
        } else {
          log.debug('Intents from Commanders!', commanderIntents);
          return commanderIntents;
        }
      })
      .then(function handleIntents(intents) {
        // In here we should have an array of "intents".
        // These intents may have come from Commanders or Responders,
        // it shouldn't matter at this point.
        //
        // (The intents of Responders will have that "priority" thing since all Responders
        //  will handle all the events, but let's figure out that later)
        //
        // In here the Intents should be "cleared" by using whatever bot platform we
        // currently are using.
        log.debug('Got intents', intents);
      });
  }

  getIntentsFromCommanders(event) {
    // # Command & Respond -loop
    const commandHandlerCandidates = _.map(this._commanders, cmdr =>
      cmdr.getBidForEvent(event)
    );


    // Hack to get only solved promises
    // (http://stackoverflow.com/questions/30309273/keep-the-values-only-from-the-promises-that-resolve-and-ignore-the-rejected)
    return Promise.all(commandHandlerCandidates.map(promise => promise.reflect()))
    .filter(promise => promise.isFulfilled())
    .then(function solveHandlerCommander(handlerBids) {
      let winningBid = null;

      if (handlerBids.length > 1) {
        // More than one commander was interested in the event,
        // tell user about this conflict

        // TODO: Make user to decide which commander will take the control
        //  (this will require the Core to have some internal state which
        //   will listen for the user's response, and block those messages
        //   from going on. How to do that platform agnostically?)

        winningBid = handlerBids[0]; // TODO temp hack

      } else if (handlerBids.length === 0) {
        // Take the only bid we got
        winningBid = handlerBids[0];
      }

      if (!_.isNull(winningBid)) {
        // Get intents from the "winning Commander"
        return winningBid.commander.handleEvent(event);
      } else {
        // There was no interested from commanders, send empty array to
        // state that there are no intents from commanders
        return [];
      }
    });
  }

  getIntentsFromResponders(event) {
    // TODO!
    return [];
  }
}


module.exports = Core;
