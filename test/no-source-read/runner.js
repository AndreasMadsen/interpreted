
Error.stackTraceLimit = 0;

var fs = require('fs')
var path = require('path');
var interpreted = require('../../interpreted.js');

interpreted({
  expected: path.resolve(__dirname, 'expected'),
  source: path.resolve(__dirname, 'source'),

  readSource: false,
  test: function (name, callback) {
    fs.readFile(path.resolve(__dirname, 'source', name + '.file'), function (err, content) {
      if (err) return callback(err);
      callback(null, JSON.parse(content));
    });
  }
});
