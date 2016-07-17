const cfg     = require('./config');
const request = require('request');
const stream  = require('stream');
const fs      = require('fs');
const mime    = require('mime');
const path    = require('path');
const Promise = require('bluebird');
const _       = require('lodash');
const logger  = require('./logger');

var botApi = {};

// ## Public functions
//

botApi.getMe = () => {
  return new Promise((resolve, reject) => {
    request(cfg.tgApiUrl + '/getMe', (err, res, body) => {
      if (!err && JSON.parse(body).ok) {
        resolve(JSON.parse(body).result);
      } else {
        var errmsg = (err) ? ('Telegram API unreachable: ' + err) :
        ('botApi: error when getMe: ' + JSON.parse(body).description);
        logger.log('error', errmsg);
        reject(errmsg);
      }
    });
  });
};

// chat_id [int] REQUIRED
// text [string] REQUIRED
// parse_mode ["Markdown" or "HTML"] OPTIONAL
// disable_web_page_preview [boolean] OPTIONAL
// disable_notification [boolean] OPTIONAL
// reply_to_message_id [int] OPTIONAL
// reply_markup [ReplyKeyboardMarkup, ReplyKeyboardHide or ForeReply] OPTIONAL
botApi.sendMessage = (options) => {
  return new Promise(resolve => {

    options.hide_keyboard = (_.isUndefined(options.reply_markup));

    // Send the message to Telegram API
    request.post(
      cfg.tgApiUrl + '/sendMessage',
      { form: options },
      function requestCallback(err, resp, body) {
        if (!err && JSON.parse(body).ok) {
          logger.info(
            'botApi: sending message to %s: "%s..."',
            options.chat_id,
            _.truncate(options.text)
            );
          resolve(body);
        } else {
          var errmsg = (err) ? ('Telegram API unreachable: ' + err) :
          ('botApi: error when sending message: ' + JSON.parse(body).description);
          logger.log('error', errmsg);
          resolve(errmsg);
        }
      }
    );
  });
};

// chat_id [int or string] REQUIRED
// from_chat_id [int or string] REQUIRED
// disable_notification [boolean] OPTIONAL
// message_id [int] REQUIRED
botApi.forwardMessage = (options) => {
  return new Promise(resolve => {
    request.post(
      cfg.tgApiUrl + '/forwardMessage',
      { form: options },
      function requestCallback(err, resp, body) {
        if (!err && JSON.parse(body).ok) {
          logger.log('info', 'botApi: forwarded message to %s', options.chat_id);
          resolve(body);
        } else {
          var errmsg = (err) ? ('Telegram API unreachable: ' + err) :
          ('botApi: error when forwarding message: ' + JSON.parse(body).description);
          logger.log('error', errmsg);
          resolve(errmsg);
        }
      }
      );
  });
};

// chat_id [int or string] REQUIRED
// action ['typing' or 'upload_photo' or 'record_video' or
//        'upload_video' or 'record_video' or 'upload_audio' or
//        'upload_document' or 'find_location'] REQUIRED
botApi.sendAction = (options) => {
  request.post(cfg.tgApiUrl + '/sendChatAction', { form: options });
};

// chat_id [int or string] REQUIRED
// file [file_location or file_id] REQUIRED
// disable_notification [boolean] OPTIONAL
// reply_to_message_id [int] OPTIONAL
// reply_markup [ReplyKeyboardMarkup or ReplyKeyboardHide or ForceReply] OPTIONAL
botApi.sendSticker = (options) => {
  return _sendFile('sticker', options);
};

// chat_id [int or string] REQUIRED
// file [file_location or file_id] REQUIRED
// duration [int] OPTIONAL
// width [int] OPTIONAL
// height [int] OPTIONAL
// caption [string] OPTIONAL
// disable_notification [boolean] OPTIONAL
// reply_to_message_id [int] OPTIONAL
// reply_markup [ReplyKeyboardMarkup or ReplyKeyboardHide or ForceReply] OPTIONAL
botApi.sendVideo = (options) => {
  return _sendFile('video', options);
};

// chat_id [int or string] REQUIRED
// file [file_location or file_id] REQUIRED
// caption [string] OPTIONAL
// disable_notification [boolean] OPTIONAL
// reply_to_message_id [int] OPTIONAL
// reply_markup [ReplyKeyboardMarkup or ReplyKeyboardHide or ForceReply] OPTIONAL
botApi.sendPhoto = (options) => {
  return _sendFile('photo', options);
};

// url [string] REQUIRED
// certificate [file_location] OPTIONAL
botApi.setWebhook = (options) => {
  return new Promise((resolve, reject) => {
    // Delete old webhook
    let payload = { form: { url: '' } };
    request.post(cfg.tgApiUrl + '/setWebhook', payload, (err, response, body) => {
      if (err) {
        logger.error('Telegram API unreachable: ', err);
      } else {
        logger.debug('botApi: previous webhook deleted, response: ' + body);

        // Subscribe new webhook
        var formData = '';
        if (!_.isEmpty(options.certificate)) {
          formData = _formatSendData('certificate', options.certificate).formData;
        }

        request.post(cfg.tgApiUrl + '/setWebhook',
          { qs: options, formData: formData },
            (err, response, body) => { // TODO we shouldn't be cascading these requests
            if (!err && JSON.parse(body).ok) {
              logger.info('botApi: webhook updated successfully!');
              logger.debug('botApi: webhook response' + body);
              resolve();
            }
            else {
              var errmsg = (err)
              ? 'Telegram API unreachable: ' + err
              : 'Error when setting webhook: ' + JSON.parse(body).description;
              logger.error(errmsg);
              reject(errmsg);
            }
          }
        );
      }
    });
  });
};

// file_id [string] REQUIRED
botApi.getFile = (options) => {
  return new Promise((resolve, reject) => {
    request.post(cfg.tgApiUrl + '/getFile', { qs: options }, (err, response, body) => {
      if (!err && JSON.parse(body).ok) {
        resolve(JSON.parse(body).result);
      } else {
        var errmsg = (err)
        ? 'Telegram API unreachable: ' + err
        : 'botApi: error when getting file: ' + JSON.parse(body).description;
        logger.error(errmsg);
        reject(errmsg);
      }
    });
  });
};

// ## Internal functions
//

var _formatSendData = function(type, data) {
  var formData = {};
  var fileName;
  var fileId = data;

  if (data instanceof stream.Stream) {
    fileName = path.basename(data.path);

    formData[type] = {
      value: data,
      options: {
        filename: fileName,
        contentType: mime.lookup(fileName)
      }
    };
  }
  else if (fs.existsSync(data)) {
    fileName = path.basename(data);

    formData[type] = {
      value: fs.createReadStream(data),
      options: {
        filename: fileName,
        contentType: mime.lookup(fileName)
      }
    };
  }

  return {
    formData: formData,
    file: fileId
  };
};

var _sendFile = function(type, options) {
  return new Promise((resolve, reject) => {
    var content = _formatSendData(type, options.file);
    options[type] = content.file;

    request.post(
      cfg.tgApiUrl + '/send' + _.camelCase(type),
      { qs: options, formData: content.formData },
      function callback(err, httpResponse, body) {
        if (!err && JSON.parse(body).ok) {
          logger.log('info', 'botApi: sent ' + type + ' to ' + options.chat_id);
          resolve();
        } else {
          var errmsg = (err) ? ('Telegram API unreachable: ' + err) :
          ('botApi: error when sending' + type + ': ' + JSON.parse(body).description);
          logger.log('error', errmsg);
          reject(errmsg);
        }
      }
      );
  });
};


module.exports = botApi;
