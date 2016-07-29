const profiles = {};

profiles.telegram = {
  name: 'TestTGBot',
  options: {
    token: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'
  }
};

profiles.irc = {
  name: 'TestIRCBot',
  options: {
    server: 'http://example.com',
    nick: 'Mankov'
  }
};

module.exports = profiles;
