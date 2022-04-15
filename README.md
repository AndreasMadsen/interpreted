# interpreted [![Build Status](https://travis-ci.org/AndreasMadsen/interpreted.png?branch=master)](https://travis-ci.org/AndreasMadsen/interpreted)

> node-tap wrapper for testing input/output functionality

## Installation

```shell
npm install interpreted
```

## Documentation

```javascript
var interpreted = require("interpreted");

interpreted({
  // required. full path to the source file directory and the expected directory
  // the expected directory should contain JSON files (e.q. example.json)
  // and the source directory can contain anything. Note that the basename
  // must exist in both source and expected directroy.
  // (e.q yaml to json converter: source/example.yaml, expected/example.json)
  source: path.resolve(__dirname, "source"),
  expected: path.resolve(__dirname, "expected"),

  // optional. the basenames of the files to use in tests. If this is not specified
  // all tests will be used.
  run: ["example"],

  // optional, update flag. Instead of testing expected files, they will be overwritten with
  // the actual value. Default: false
  update: false,

  // optional, read source file flag. If true the source file is read and passed
  // as a second argument to the test function. Default: true
  sourceRead: true,

  // optional. This method will execute before the file tests.
  start: function (callback) {
    callback(null);
  },

  // required. This method will be used to test the files. Note that there
  // must be passed a JSON valid value to the callback.
  test: function (name, content, callback) {
    callback(null, YAML.parse(content)); // real object (e. q. { test: true })
  },

  // optional. This method will execute after the file tests.
  close: function (callback) {
    callback(null);
  },

  // optional. This configuration object will be passed to the tap.test
  // function.
  tap: {
    timeout: 3000,
  },

  // optional: by default json files are parsed and everything else is threaded
  // as a simple text. You can extend this behaviour.
  types: {
    yaml: {
      test: function (t, actual, expected) {
        t.deepEqual(actual, YAML.parse(expected));
      },
      update: function (actual) {
        return YAML.stringify(actual);
      },
    },
  },
});
```
