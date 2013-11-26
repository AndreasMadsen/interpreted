var fs = require('fs');
var tap = require('tap');
var path = require('path');
var util = require('util');
var async = require('async');
var events = require('events');

function Intrepreted(settings) {
  if (!(this instanceof Intrepreted)) return new Intrepreted(settings);

  var self = this;

  this.source = path.resolve(settings.source);
  this.expected = path.resolve(settings.expected);

  this.update = !!settings.update;

  this.run = Array.isArray(settings.run) ? settings.run : null;

  this.methods = {
    start: settings.start,
    close: settings.close,
    test: settings.test
  };

  this.files = {
    source: {},
    expected: {},
    total: []
  };

  this.tapOptions = settings.tap || {};

  this._readdir(function (err) {
    if (err) return self.emit('error', err);

    // if no run files was set use all files
    if (self.run === null) {
      self.run = self.files.total;
    }

    // validate run files
    self._validateFiles();

    self._assignStart();
    self.run.forEach(self._assignTest, self);
    self._assignClose();
  });
}
module.exports = Intrepreted;
util.inherits(Intrepreted, events.EventEmitter);

Intrepreted.prototype._assignStart = function (callback) {
  var self = this;

  if (this.methods.start === undefined) return;

  tap.test('start interpreted tester', this.tapOptions, function (t) {
    process.nextTick(function () {
      self.methods.start(function (err) {
        if (err) throw err;
  
        t.end();
      });
    });
  });
};

Intrepreted.prototype._assignClose = function (callback) {
  var self = this;

  if (this.methods.close === undefined) return;

  tap.test('close interperted tester', this.tapOptions, function (t) {
    process.nextTick(function () {
      self.methods.close(function (err) {
        if (err) throw err;
  
        t.end();
      });
    });
  });
};

Intrepreted.prototype._assignTest = function (name) {
  var self = this;

  tap.test('test ' + name + ' interpreted', this.tapOptions, function (t) {

    async.parallel({
      source: function (done) {
        fs.readFile(self.files.source[name], 'utf8', done);
      },

      expected: function (done) {
        fs.readFile(self.files.expected[name], 'utf8', done);
      }
    }, function (err, file) {
      if (err) throw err;
			
      self.methods.test(name, file.source, function (err, result) {
        if (err) throw err;

        if (self.update) {
          result = JSON.stringify(result, null, '\t');
          fs.writeFile(self.files.expected[name], result, function (err) {
            if (err) throw err;

            t.end();
          });
        } else {
          t.deepEqual(result, JSON.parse(file.expected));
          t.end();
        }
      });
    });
  });
};

// validate run files
Intrepreted.prototype._validateFiles = function () {
  for (var i = 0; i < this.run.length; i++) {
    if (this.files.source.hasOwnProperty(this.run[i]) === false) {
      return this.emit('error',
        new Error(this.run[i] + ' source file is missing')
      );
    }

    if (this.files.expected.hasOwnProperty(this.run[i]) === false) {
      return this.emit('error',
        new Error(this.run[i] + ' expected file is missing')
      );
    }
  }
};

Intrepreted.prototype._readdir = function (callback) {
  var self = this;
  var files = this.files;

  function readDir(name) {
    return function (done) {
      fs.readdir(self[name], function (err, content) {
        if (err) return done(err);

        // create a object map between name and full filepath
        var map = {}, basename;

        for (var i = 0; i < content.length; i++) {
          if (content[i][0] === '.') continue;
          basename = path.basename(content[i], path.extname(content[i]));
          map[basename] = path.resolve(self[name], content[i]);
        }

        files[name] = map;

        done(null);
      });
    };
  }

  async.parallel([
    readDir('source'),
    readDir('expected')
  ], function (err) {
    if (err) return callback(err);

    // create a unique total list
    var unique = {};

    Object.keys(files.source).forEach(function (name) {
      unique[name] = true;
    });

    Object.keys(files.expected).forEach(function (name) {
      unique[name] = true;
    });

    files.total = Object.keys(unique);

    // done
    callback(null);
  });
};
