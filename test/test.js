const chai = require('chai');

const logger = require('../src/logger')('./test.log');
const coreLib = require('../src/index');
const core = new coreLib();

const expect = chai.expect;

describe('core', () => {

  it('should subscribe webhook', () => {
    core.subscribeWebhook('/api/webhook');
  });
});
