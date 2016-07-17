/* eslint-disable func-names */
// ^ Use old-school function style in some tests because with
//   arrow-notation "this" variable is scoped outside the function

process.env.NODE_ENV = 'test';

const chai = require('chai');

const log     = require('../src/logger')(__filename);
const coreLib = require('../src/index');

const core = new coreLib();

const expect = chai.expect;

// NOTE: Do we wanna use environment variables in tests?
const tgApiKey = process.env.MANKOV_TELEGRAM_APIKEY;
const webhook  = process.env.MANKOV_TELEGRAM_WEBHOOK;

describe('core', () => {

  it('should subscribe webhook', function() {

    if (webhook) {
      core.subscribeWebhook(webhook);

      /* ... */

    } else {
      this.skip();
    }
  });
});

describe('telegram-api', () => {

  // TODO: Mock Telegram API if using example token
  const token = (tgApiKey) ? tgApiKey : '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

  it('should set Telegram API key', () => {
    core.setTelegramApiKey(token);

    /* ... */

  });

});

