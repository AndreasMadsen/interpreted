
Error.stackTraceLimit = 0;

var path = require('path');
var interpreted = require('../../interpreted.js');

interpreted({
  expected: path.resolve(__dirname, 'expected'),
  source: path.resolve(__dirname, 'source'),

	run: ['only'],

  test: function (name, content, callback) {
    callback(null, JSON.parse(content));
  }
});
