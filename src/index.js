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
    this._availablePlatforms = [
      telegramPlatform,
      ircPlatform
    ];

    // The bots (instances of platforms)
    this._bots = [];

  }

  // Use this if you don't want to use "new" keyword
  static create() {
    return new Core();
  }

  createBot(type, name, options) {

    let chosenPlatform = _.find(this._availablePlatforms, platform => platform.type === type);

    // Platform not found
    if (!chosenPlatform) {
      return Promise.reject(`Platform ${type} not available`);
    }

    // Invalid name
    if (!name) {
      return Promise.reject('Missing parameter "name"');
    }

    // Allow only unique names
    if (this.getBotByName(name)) {
      return Promise.reject(`Bot with name "${name}" has already been created.`);
    }

    // All ok, create bot
    let newBot = new chosenPlatform(name, options);

    this._bots.push(newBot);

    // Subscribe to pipeline
    newBot.onMessage(event => this.processEvent(event));

    log.debug(`Bot "${name}" created from ${type} platform succesfully`);
    return Promise.resolve(newBot);

  }

  getBotByName(name) {
    return _.find(this._bots, bot => bot.name === name);
  }

  getAvailablePlatforms() {
    return this._availablePlatforms.map(platform => platform.type);
  }

  addCommander(commanderInstance) {
    if (!_.isFunction(commanderInstance.getBidForEvent)) {
      log.error(`No getBidForEvent defined for ${commanderInstance.constructor.name}!`);
    } else if (!_.isFunction(commanderInstance.handleEvent)) {
      log.error(`No handleEvent defined for ${commanderInstance.constructor.name} ignoring!`);
    } else {
      this._commanders.push(commanderInstance);
    }
  }

  addMonitor(monitorInstance) {
    if (!_.isFunction(monitorInstance.handleEvent)) {
      log.error(`No handleEvent defined for ${monitorInstance.constructor.name} ignoring!`);
    } else {
      this._monitors.push(monitorInstance);
    }
  }

  // "The start of the Pipeline"
  processEvent(event) {
    // TODO: call queue

    // Send event to all monitors
    this._monitors.forEach(monitor => monitor.handleEvent(event));

    return this.getIntentsFromCommanders(event)
      .then(commanderIntents => {
        log.debug('commanderIntents', commanderIntents);
        if (commanderIntents.length === 0) {
          // No intents from Commanders - check from Responders
          return this.getIntentsFromResponders(event);
        } else {
          log.debug('Intents from Commanders!', commanderIntents);
          return commanderIntents;
        }
      })
      .then(intents => {
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
        // TODO: actually "solve" the intents instead of just returning them
        return Promise.resolve(intents);
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
      // NOTE: reflect() is used, handlerBids are NOT direct values of the promises
      // (http://bluebirdjs.com/docs/api/reflect.html)
      let winningBid = null;

      if (handlerBids.length > 1) {
        // More than one commander was interested in the event,
        // tell user about this conflict

        // TODO: Make user to decide which commander will take the control
        //  (this will require the Core to have some internal state which
        //   will listen for the user's response, and block those messages
        //   from going on. How to do that platform agnostically?)

        winningBid = handlerBids[0].value(); // TODO temp hack

      } else if (handlerBids.length === 1) {
        // Take the only bid we got
        winningBid = handlerBids[0].value();
      }

      // Do we have a winner or not?
      // TODO: does the "bid conflict case" need some attention/branch in here?
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
