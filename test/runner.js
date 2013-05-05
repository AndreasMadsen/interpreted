
var fs = require('fs');
var path = require('path');
var test = require('tap').test;
var flower = require('flower');
var spawn = require('child_process').spawn;

function replaceAll(string, out, replacer) {
  while (true) {
    var index = string.indexOf(out);
    if (index === -1) break;

    string = string.slice(0, index) + replacer + string.slice(index + out.length);
  }

  return string;
}

var tapPath = path.resolve(require.resolve('tap'), '..', '..', 'bin', 'tap.js');
function runTest(name, callback) {
  callback = callback || function (t) {
    t.end();
  };

  return function (t) {
    var cp = spawn(tapPath, ['--tap', path.resolve(__dirname, name, 'runner.js')], {
      cwd: path.resolve(__dirname, name)
    });

    flower.stream2buffer(cp.stdout, function (err, actual) {
      t.equal(err, null);

      // Replace stacktrace paths
      actual = replaceAll(actual.toString(), path.resolve(__dirname, '..'), '/interpreted');

      fs.readFile(path.resolve(__dirname, 'fixture', name + '.txt'), function (err, expected) {
        t.deepEqual(actual.toString(), expected.toString());

        callback(t);
      });
    });
  };
}

test('all good', runTest('all-good'));

test('run only', runTest('run-only'));

test('close bad', runTest('close-bad'));

test('expected missing', runTest('expected-missing'));

test('source missing', runTest('source-missing'));

test('start bad', runTest('start-bad'));

test('test bad', runTest('test-bad'));

var acutalPath = path.resolve(__dirname, 'update-file', 'expected', 'stringify.json');
var expectedPath = path.resolve(__dirname, 'fixture', 'stringify.json');
var restore = fs.readFileSync(acutalPath, 'utf8');

test('update-file', runTest('update-file', function (t) {
  fs.readFile(acutalPath, 'utf8', function (err, actual) {
    t.equal(err, null);

    fs.readFile(expectedPath, 'utf8', function (err, expected) {
      t.equal(err, null);

      t.deepEqual(actual, expected);

      fs.writeFile(acutalPath, restore, function () {
        t.equal(err, null);
        t.end();
      });
    });
  });
}));
