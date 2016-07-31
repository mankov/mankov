mankov-core [![Sponsored by Chilicorn.org](https://img.shields.io/badge/sponsored%20by-chilicorn.org-brightgreen.svg)](http://chilicorn.org)
=====================================================================

_Mankov_ is framework for building Chat Bots. Its purpose is to offer core architechture and do the mandatory bits required for communicating with chat platforms while you can focus only on implementating the actual logic & intelligence of your bot. 

To see example how to use Mankov, check [`example-mankov-bot`](https://github.com/mankov/example-mankov-bot)

_Mankov_ is slightly opinionated when it comes to how we think chat bots should be built. This code is forked from [BorisBot](https://github.com/miro/BorisBot), our first take on building a Telegram bot. Most of the opinions rise from there.

**Currently supported platforms:**
- [Telegram](https://core.telegram.org/bots/api) (via [`node-telegram-bot-api`](https://github.com/yagop/node-telegram-bot-api))
- [Internet Relay Chat](http://www.irchelp.org/) (via [`irc`](https://github.com/martynsmith/node-irc))


# Concepts & architechture

(**NOTE:** Naming of things in this section are subject to change, since you know, naming things is hard. Everything else will probably change also. Yau!)

Basic concept of a chat bot is quite simple. You get the messages from the platform API via some mechanism (including pictures, stickers, videos, & whatnot). Then you react on those messages somehow (or ignore them, up to you).

In _Mankov-powered bot_ there is a _Pipeline_ where all those platform-sent messages are processed. All the messages are parsed by a _platform specific parser_ which maps the information into platform agnostic _Event_.

![Mankov Pipeline](https://raw.githubusercontent.com/mankov/mankov/development/docs/pipeline.png)

In the Pipeline there are three different kind of Event handlers:


## Middlewares

After the platform-specific parser creates the Event, you can attach middleware code which alters that Event before it is sent further on on the Pipeline. This is great place for adding for eg user authentication code etc.


## Monitors

Each _Event_ gets sent to all the _Monitors_ which are attached to the Mankov instance. These handlers can process the Event in any way they like; they aren't expected to respond to the event in any way.

The usual usecase for _Monitor_ is logging the Events somehow.


## Commanders

...are handlers for Events in which the user directly interacts with the Bot. Each event will be sent to all attached _Commanders_ - there can be multiple of them. Each Commander decides is this Event something that it will start to process or not. If handler is not interested in this particular Event, it can ignore it.

If Commander is interested in the Event, it can send a _Bid_ for it. If there are only one Bid, that Commander handles the Event. If there are multiple Bids, the user will be prompted based on the meta info on the Bid that what was the actual command they were trying to resolve.

After the "handling Commander" is found out, it is allowed to process the Event. It can return as many _Actions_ as it wants as a result, and Mankov will then execute them.

When Commander has handled the Event, Mankov will consider it be resolved & **won't send it further on the Pipeline.**


## Responders

If no Commander does not send a Bid for the Event (or no Commander handlers are attached), the Event will be sent to all the _Responders_ attached.

_Responders_ are meant for implementing "human-like reactions" to messages. Each handler can decide on their own should they send some reaction to the Event they received or not.

(_**TODO**: not implemented/designed yet_) Each reaction must define a _priority_. If there are multiple reactions for single Event, the reaction with the highest priority will be sent to the origin of the Event.

(The method of defining these priorities hasn't been solved yet.)


## Pipeline results

Monitors do what they do or don't do nothing. Pipeline is not interested about them.

If there are some Commanders which are interested in the Event, only one will be allowed to act on the Event. In this case the Event is not sent to Responders.

If Event goes to Responders, and some of them decide to react on it, at maximum only one reaction will be sent to the creator of Event.



=======

## Acknowledgements
This project is a grateful recipient of the [Futurice Open Source sponsorship program](http://futurice.com/blog/sponsoring-free-time-open-source-activities). ♥
