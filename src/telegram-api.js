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

module.exports = class TelegramApi {

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
      .then((res, err) => this._validateResponse('getMe', res, err))
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
      .then((res, err) => this._validateResponse('sendMessage', res, err))
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
      .then((res, err) => this._validateResponse('forwardMessage', res, err))
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
      .then((res, err) => this._validateResponse('sendChatAction', res, err))
    );
  }

  // chat_id [int or string] REQUIRED
  // file [file_location or file_id] REQUIRED
  // disable_notification [boolean] OPTIONAL
  // reply_to_message_id [int] OPTIONAL
  // reply_markup [ReplyKeyboardMarkup or ReplyKeyboardHide or ForceReply] OPTIONAL
  sendSticker(options) {
    return this._sendFile('sticker', options);
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
    return this._sendFile('video', options);
  }


  // chat_id [int or string] REQUIRED
  // file [file_location or file_id] REQUIRED
  // caption [string] OPTIONAL
  // disable_notification [boolean] OPTIONAL
  // reply_to_message_id [int] OPTIONAL
  // reply_markup [ReplyKeyboardMarkup or ReplyKeyboardHide or ForceReply] OPTIONAL
  sendPhoto(options) {
    return this._sendFile('photo', options);
  }

  // url [string] REQUIRED
  // certificate [file_location] OPTIONAL
  setWebhook(options) {
      // TODO/NOTE: is deleting the old webhook required? I guess it is since it
      // is done in here, but is it really?
    return (
      // Delete old webhook
      request
      .post(`${this._tgApiUrl}/setWebhook`)
      .send({ url: '' })
      .then((res, err) => this._validateResponse('setWebhook', res, err))
      .then(
        // Subscribe new webhook
        request
        .post(`${this._tgApiUrl}/setWebhook`)
        .set('Content-Type', 'multipart/form-data')
        .send(options)
        .attach('certificate', options.certificate)
        .then((res, err) => this._validateResponse('setWebhook', res, err))
      )
    );
  }


  // file_id [string] REQUIRED
  getFile(options) {
    return (
      request
      .post(`${this._tgApiUrl}/getFile`)
      .send(options)
      .then((res, err) => this._validateResponse('getFile', res, err))
    );
  }

  _sendFile(type, options) {
    let req = request
      .post(`${this._tgApiUrl}/send${_.capitalize(type)}`)
      .send(options);

    // Check if file was location instead of ID
    if (!_.isNumber(options.file)) {
      req
      .set('Content-Type', 'multipart/form-data')
      .attach(type, options.file);
    }

    return (
      req.then((res, err) => this._validateResponse(`send${_.capitalize(type)}`, res, err))
    );
  }

  _validateResponse(action, res, err) {
    if (!err && res.body.ok) {
      log.debug(`botApi: executed ${action}`);
      return Promise.resolve(res.body.result);
    } else {
      let errmsg = (err)
        ? `Telegram API unreachable: ${err}`
        : `Error from Telegram API: ${res.body.description}`;
      log.error(errmsg);
      return Promise.reject(errmsg);
    }
  }

};
