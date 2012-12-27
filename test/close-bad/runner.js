
var path = require('path');
var interpreted = require('../../interpreted.js');

interpreted({
  expected: path.resolve(__dirname, 'expected'),
  source: path.resolve(__dirname, 'source'),

  close: function (callback) {
    callback(new Error('fake error'));
  },

  test: function (name, content, callback) {
    callback(null, JSON.parse(content));
  }
});
