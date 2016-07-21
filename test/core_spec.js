const expect = require('chai').expect;

const testData = require('./data/telegram-messages');

const Mankov = require('../src/index');
const IltaaCommander = require('../src/commander/iltaa-commander');


describe('Mankov Core', () => {
  let mankov = null;

  before(() => {
    mankov = new Mankov();
  });

  describe('Commanders', () => {
    before(() => {
      mankov.addCommander(new IltaaCommander());
    });


    it('Handles basic /iltaa-command', () => mankov
      .processEvent(testData.parsedIltaaMessage)
      .then(intent => {
        // NOTE/TODO: this test will be scrapped when functionality is added
        expect(intent).to.containSubset({
          action: 'sendMessage',
          text: 'Game of Iltuz',
          targetId: testData.parsedIltaaMessage.replyTarget
        });
      })
    );
  });


});
