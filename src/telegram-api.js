// # telegram-api
//
//  Functions for interacting with the Telegram's bot API
//
//
// TODO:
//  - that errorMsg defining which is done n time should be a function
//
//  - implement rest of the Telegram API
//

const Promise = require('bluebird');
const _       = require('lodash');
const request = require('superagent');

const log     = require('./logger')(__filename);

module.exports = class BotApi {

  constructor(apiKey) {

    if (!apiKey) {
      throw new Error('Invalid parameters: Telegram API token is missing');
    }

    this._tgApiUrl = `https://api.telegram.org/bot${apiKey}`;
  }

  getMe() {
    return (
      request
      .get(`${this._tgApiUrl}/getMe`)
      .then((res, err) => {
        if (!err && res.body.ok) {
          return Promise.resolve(res.body.result);
        } else {
          return this._generateErrorMsg(err, res);
        }
      })
    );
  }

  // chat_id [int] REQUIRED
  // text [string] REQUIRED
  // parse_mode ["Markdown" or "HTML"] OPTIONAL
  // disable_web_page_preview [boolean] OPTIONAL
  // disable_notification [boolean] OPTIONAL
  // reply_to_message_id [int] OPTIONAL
  // reply_markup [ReplyKeyboardMarkup, ReplyKeyboardHide or ForeReply] OPTIONAL
  sendMessage(options) {

    options.hide_keyboard = (_.isUndefined(options.reply_markup));

    return (request
      .post(`${this._tgApiUrl}/sendMessage`)
      .send(options)
      .then((res, err) => {
        if (!err && res.body.ok) {
          log.debug(
            `botApi: sending message to
            ${options.chat_id}: "${_.truncate(options.text)}..."`
          );
          return Promise.resolve(res.body);

        } else {
          return this._generateErrorMsg(err, res);
        }
      })
    );
  }

  // chat_id [int or string] REQUIRED
  // from_chat_id [int or string] REQUIRED
  // disable_notification [boolean] OPTIONAL
  // message_id [int] REQUIRED
  forwardMessage(options) {

    return (
      request
      .post(`${this._tgApiUrl}/forwardMessage`)
      .send(options)
      .then((res, err) => {
        if (!err && res.body.ok) {
          log.debug(`botApi: forwarded message to ${options.chat_id}`);
          return Promise.resolve(res.body);

        } else {
          return this._generateErrorMsg(err, res);
        }
      })
    );
  }

  // chat_id [int or string] REQUIRED
  // action ['typing' or 'upload_photo' or 'record_video' or
  //        'upload_video' or 'record_video' or 'upload_audio' or
  //        'upload_document' or 'find_location'] REQUIRED
  sendAction(options) {
    return (
      request
      .post(`${this._tgApiUrl}/sendChatAction`)
      .send(options)
      .then((res, err) => {
        if (!err && res.body.ok) {
          log.debug(`botApi: sent action to ${options.chat_id}`);
          return Promise.resolve(res.body);

        } else {
          return this._generateErrorMsg(err, res);
        }
      })
    );
  }

  // chat_id [int or string] REQUIRED
  // file [file_location or file_id] REQUIRED
  // disable_notification [boolean] OPTIONAL
  // reply_to_message_id [int] OPTIONAL
  // reply_markup [ReplyKeyboardMarkup or ReplyKeyboardHide or ForceReply] OPTIONAL
  sendSticker(options) {
    this._sendFile('sticker', options);
  }

  // chat_id [int or string] REQUIRED
  // file [file_location or file_id] REQUIRED
  // duration [int] OPTIONAL
  // width [int] OPTIONAL
  // height [int] OPTIONAL
  // caption [string] OPTIONAL
  // disable_notification [boolean] OPTIONAL
  // reply_to_message_id [int] OPTIONAL
  // reply_markup [ReplyKeyboardMarkup or ReplyKeyboardHide or ForceReply] OPTIONAL
  sendVideo(options) {
    this._sendFile('video', options);
  }


  // chat_id [int or string] REQUIRED
  // file [file_location or file_id] REQUIRED
  // caption [string] OPTIONAL
  // disable_notification [boolean] OPTIONAL
  // reply_to_message_id [int] OPTIONAL
  // reply_markup [ReplyKeyboardMarkup or ReplyKeyboardHide or ForceReply] OPTIONAL
  sendPhoto(options) {
    this._sendFile('photo', options);
  }

  // url [string] REQUIRED
  // certificate [file_location] OPTIONAL
  setWebhook(options) {
    return new Promise((resolve, reject) => {
      // TODO/NOTE: is deleting the old webhook required? I guess it is since it
      // is done in here, but is it really?

      request
      .post(`${this._tgApiUrl}/setWebhook`)
      .send({ url: '' })
      .then((res, err) => {
        if (err) {
          log.error(`Telegram API unreachable: ${err}`);
          return Promise.resolve();
        } else {
          log.debug(`Previous webhook deleted, response: ${res.body}`);
          return Promise.reject();
        }
      })
      .then(
        request
        .post(`${this._tgApiUrl}/setWebhook`)
        .set('Content-Type', 'multipart/form-data')
        .send(options)
        .attach('certificate', options.certificate)
        .then((res, err) => {

          if (!err && JSON.parse(res.body).ok) {
            log.debug('Webhook updated successfully!');
            log.debug(`Webhook response: ${res.body}`);
            return Promise.resolve();
          }
          else {
            return this._generateErrorMsg(err, res);
          }
        })
      )
      .then(resolve);
    });
  }


  // file_id [string] REQUIRED
  getFile(options) {
    return new Promise((resolve, reject) => {
      request
      .post(`${this._tgApiUrl}/getFile`)
      .send(options)
      .then((res, err) => {
        if (!err && JSON.parse(res.body).ok) {
          return resolve(JSON.parse(res.body).result);
        } else {
          return this._generateErrorMsg(err, res);
        }
      })
      .then(resolve);
    });
  }

  _sendFile(type, options) {
    return new Promise((resolve, reject) => {

      request
      .post(`${this._tgApiUrl}/send${_.camelCase(type)}`)
      .set('Content-Type', 'multipart/form-data')
      .send(options)
      .attach(type, options.file)
      .then((res, err) => {
        if (!err && JSON.parse(res.body).ok) {
          log.debug(`botApi: sent ${type} to ${options.chat_id}`);
          return resolve();
        } else {
          return this._generateErrorMsg(err, res);
        }
      })
      .then(resolve);
    });
  }

  _generateErrorMsg(apiErr, res) {
    let errmsg = (apiErr)
      ? `Telegram API unreachable: ${apiErr}`
      : `Error from Telegram API: ${JSON.parse(res.body).description}`;
    log.error(errmsg);
    return Promise.reject(errmsg);
  }

};
