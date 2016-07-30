const Promise     = require('bluebird');
const _           = require('lodash');
const assert      = require('assert');

const EventQueue = require('./event-queue');

const telegramPlatform  = require('./platforms/telegram');
const ircPlatform       = require('./platforms/irc');

const log = require('./logger')(__filename);


module.exports = class Core {
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

    // Event queue
    this._queue = new EventQueue();

    // The bots (instances of platforms)
    this._bots = {};
  }

  // Use this if you don't want to use "new" keyword
  static create() {
    return new Core();
  }

  createBot(type, name, options) {

    let errMsg = null;
    let chosenPlatform = _.find(this._availablePlatforms, platform => platform.type === type);

    // Platform not found
    if (!chosenPlatform) {
      errMsg = `Platform ${type} not available`;
    }

    // Invalid name
    else if (!name) {
      errMsg = 'Missing parameter "name"';
    }

    // Allow only unique names
    else if (this._bots[name]) {
      errMsg = `Bot with name "${name}" has already been created.`;
    }

    // There was an error
    if (errMsg) {
      return Promise.reject(errMsg);

    // All ok, create a new bot
    } else {

      let newBot = new chosenPlatform(name, options);
      this._bots[name] = newBot;

      // Subscribe to pipeline
      newBot.on('event', event => this.processEvent(event));
      log.debug(`Bot "${name}" created from ${type} platform succesfully`);

      return Promise.resolve(newBot);

    }
  }

  get platforms() {
    return this._availablePlatforms.map(platform => platform.type);
  }

  addPlatform(platform) {
    let errMsg = null;

    // TODO: Test if platform has required functions
    //       (There is no way to validate the platform directly,
    //        because it is a constructor function. Maybe create
    //        an instance and examine it?)

    if (errMsg) {
      return Promise.reject(errMsg);

    } else {
      this._availablePlatforms.push(platform);
      return Promise.resolve(platform);
    }
  }


  addResponder(responderInstance) {
    if (!_.isFunction(responderInstance.handleEvent)) {
      log.error(`No handleEvent defined for ${responderInstance.constructor.name} ignoring!`);
    } else {
      this._responders.push(responderInstance);
    }
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
    if (this._queue.hasEvent(event.eventId, event.fromBot)) {
      // this event is already in progress -> do nothing
      return Promise.resolve();
    }

    // Check for possible existing conflict situattions
    // TODO: implement

    // Send event to all monitors
    this.sendEventToMonitors(event);

    // Send message to "Pipeline"
    return Promise.resolve()
      .then(() => this.getActions(event))
      .then(actions => this.executeActions(actions, event))
      .catch(e => {
        log.error('Error occurred on the pipeline: ', e);
        return Promise.resolve();
      });
  }

  sendEventToMonitors(event) {
    this._monitors.forEach(monitor => monitor.handleEvent(event));
  }

  getActions(event) {
    return Promise.resolve()
      .then(() => this.getActionsFromCommanders(event))
      .then(commanderActions => {
        // If only one action is returned, wrap it into array
        commanderActions = !_.isArray(commanderActions)
         ? [commanderActions] : commanderActions;

        assert(_.isArray(commanderActions)); // Remove from production

        if (commanderActions.length > 0) {
          return commanderActions;

        } else {
          // No actions from Commanders - ask from Responders
          return this.getActionsFromResponders(event);
        }
      });
  }

  executeActions(actions, event) {
    // In here we should have an array of "actions".
    // These actions may have come from Commanders or Responders,
    // it shouldn't matter at this point.
    //
    // (The actions of Responders will have that "priority" thing since all Responders
    //  will handle all the events, but let's figure out that later)
    //
    // In here the actions should be "cleared" by using whatever bot platform we
    // currently are using.

    assert(_.isArray(actions)); // Remove from production

    log.debug('Got actions', actions);

    actions = this._validateActions(actions, event);

    // Send actions to bots so they can execute the required actions
    _.forEach(
      _.groupBy(actions, 'toBot'),
      (botActions, bot) => this._bots[bot].handleActions(botActions)
    );

    return actions;
  }

  getActionsFromCommanders(event) {

    // No commanders set to core, skip
    if (_.isEmpty(this._commanders)) {
      return Promise.resolve([]);
    }

    // # Command & Respond -loop
    const commandHandlerCandidates = _.map(this._commanders, cmdr =>
      cmdr.getBidForEvent(event)
    );

    // Hack to get only solved promises
    // (http://stackoverflow.com/questions/30309273/keep-the-values-only-from-the-promises-that-resolve-and-ignore-the-rejected)
    return Promise.all(commandHandlerCandidates.map(promise => promise.reflect()))
    .filter(promise => promise.isFulfilled())
    .map(promise => promise.value())
    .then(function solveHandlerCommander(handlerBids) {
      let winningBid = null;

      if (handlerBids.length > 1) {
        // More than one commander was interested in the event,
        // tell user about this conflict

        // TODO: Make user to decide which commander will take the control
        //  (this will require the Core to have some internal state which
        //   will listen for the user's response, and block those messages
        //   from going on. How to do that platform agnostically?)
        log.error('Got more bids from commanders than one, fallbacking to the first one');

        winningBid = handlerBids[0]; // TODO temp hack

      } else if (handlerBids.length === 1) {
        // Take the only bid we got
        winningBid = handlerBids[0];
      }

      // Do we have a winner or not?
      // TODO: does the "bid conflict case" need some attention/branch in here?
      if (!_.isNull(winningBid)) {
        // Get actions from the "winning Commander"
        return winningBid.commander.handleEvent(event);

      } else {
        // There was no interested from commanders, send empty array to
        // state that there are no actions from commanders
        return Promise.resolve([]);
      }
    });
  }

  getActionsFromResponders(event) {

    // No responders set to core, skip
    if (_.isEmpty(this._responders)) {
      return Promise.resolve([]);
    }

    const responderActionPromises = _.map(this._responders, rspndr =>
      rspndr.handleEvent(event)
    );

    return Promise.all(responderActionPromises.map(promise => promise.reflect()))
      .filter(promise => promise.isFulfilled())
      .map(reflectedPromise => reflectedPromise.value())
      .then(responderActionCandidates => {

        // TODO: in here we have 0-n arrays of actions for each responder which resolved
        // our handleEvent call. Implement some fancy logic for selecting which responder
        // to use or combine them or whatever!
        //
        // For now we just select the first one.
        if (_.isArray(responderActionCandidates) && responderActionCandidates.length > 0) {
          return Promise.resolve(responderActionCandidates[0]);
        } else {
          return Promise.resolve([]);
        }
      });
  }

  // Fill the null attributes with default values
  _validateActions(actions, event) {
    let validatedActions = [];
    actions.forEach(action => {
      action.toBot = action.toBot || event.fromBot;
      action.target = action.target || event.userId;

      validatedActions.push(action);
    });

    return validatedActions;
  }

}
