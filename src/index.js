const Promise     = require('bluebird');
const _           = require('lodash');

const EventQueue = require('./event-queue');

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
    if (this._bots[name]) {
      return Promise.reject(`Bot with name "${name}" has already been created.`);
    }

    // All ok, create bot
    let newBot = new chosenPlatform(name, options);
    this._bots[name] = newBot;

    // Subscribe to pipeline
    newBot.onMessage(event => this.processEvent(event));

    log.info(`Bot "${name}" created from ${type} platform succesfully`);

    // Returns the underlying library so developer can interact
    // with it directly if necessary (setting webhooks etc.)
    return Promise.resolve(newBot);

  }

  getAvailablePlatforms() {
    return this._availablePlatforms.map(platform => platform.type);
  }

  addPlatfrom(platform) {
    if (!_.isFunction(platform.onMessage)) {
      return Promise.reject('Missing required function onMessage()');

    } else if (!_.isFunction(platform.handleActions)) {
      return Promise.reject('Missing required function handleActions()');

    } else if (_.isUndefined(platform.type)) {
      return Promise.reject('Platform type is undefined');

    } else if (_.find(this._availablePlatforms.map(oldPlat => oldPlat.type), platform.type)) {
      return Promise.reject(`Platform with type ${platform.type} already exists`);

    // TODO: Check rest of the error cases (if there is)

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
    this.sentEventToMonitors(event);

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

        log.debug('commanderActions', commanderActions);
        console.assert(_.isArray(commanderActions)); // Remove from production

        if (commanderActions.length > 0) {
          log.debug('Actions from Commanders!', commanderActions);
          return commanderActions;
        } else {
          // No actions from Commanders - ask from Responders
          return this.getActionsFromResponders(event);
        }
      });
  }

  executeActions(actions, event) {
    // TODO: IMPLEMENT!
    // -> send the actions to whereever they are going etc

    console.assert(_.isArray(actions)); // Remove from production

    log.debug('Got actions', actions);

    // Fill the missing attributes
    actions.forEach(action => {
      action.toBot = (action.toBot) ? action.toBot : event.fromBot;
      action.targetId = (action.targetId) ? action.targetId : event.userId;
    });

    // Group actions by their destination bot name
    let groupedActions = _.groupBy(actions, 'toBot');

    // In here we should have an array of "actions".
    // These actions may have come from Commanders or Responders,
    // it shouldn't matter at this point.
    //
    // (The actions of Responders will have that "priority" thing since all Responders
    //  will handle all the events, but let's figure out that later)
    //
    // In here the actions should be "cleared" by using whatever bot platform we
    // currently are using.

    // Send actions to bots so they can execute the required actions
    _.forEach(groupedActions, (botActions, bot) => this._bots[bot].handleActions(botActions));

    return actions;
  }

  getActionsFromCommanders(event) {
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
        return [];
      }
    });
  }

  getActionsFromResponders(event) {
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
}


module.exports = Core;
