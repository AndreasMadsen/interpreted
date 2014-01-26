
Error.stackTraceLimit = 0;

var path = require('path');
var interpreted = require('../../interpreted.js');

interpreted({
  expected: path.resolve(__dirname, 'expected'),
  source: path.resolve(__dirname, 'source'),

  types: {
    'mad': {
      test: function (t, actual, expected) {
        t.ok(actual === 'ok');
      },
      update: function (actual) {
        return actual;
      }
    }
  },

  test: function (name, content, callback) {
    if (name === 'default') {
      callback(null, JSON.parse(content).test ? 'valid' : 'invalid');
    } else if (name === 'special') {
      callback(null, 'ok');
    } else {
      callback(null, JSON.parse(content));
    }
  }
});
