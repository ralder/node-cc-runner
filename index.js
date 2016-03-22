/* jshint esversion: 6 */

var EE       = require('events').EventEmitter;
var url      = require('url');
var path     = require('path');
var http     = require('http');
var debuglog = require('util').debuglog;
var spawn    = require('child_process').spawn;
var async    = require('async');
var stream   = require('stream-util2');
var javaHome = require('locate-java-home');

var defaults = {
  jar        : 'cc-web-runner-1.0.2.jar',
  port       : 8081,
  statusUrl  : { protocol: 'http:', hostname: '127.0.0.1', path: '/status' },
  compileUrl : { protocol: 'http:', hostname: '127.0.0.1', path: '/compile' }
};

var debug = debuglog('cc-runner');

module.exports = create;
function create(options) {
  var runner = new EE();

  runner.status = function $status(done) {
    status(this, done);
  };
  runner.compile = function $compile(data, done) {
    compile(this, data, done);
  };
  runner.kill = function $kill() {
    kill(this);
  };

  if (typeof options == 'function') {
    done    = options;
    options = {};
  }

  options = Object.assign(defaults, options);
  options.runner = runner;
  options.statusUrl.port  = options.port;
  options.compileUrl.port = options.port;
  runner._options = options;

  async.waterfall([
    async.apply(locateJava, runner),
    startRunner
  ], test);

  return runner;
}

function locateJava(runner, next) {
  javaHome({ version: '>=1.8' }, (error, home) => {
    var java;

    if ( ! error) {
      home = home.length && home[0];
      java = home && home.executables;
      java = java && java.java;

      if (java) {
        runner._options.java = java;
        debug('Java executable found at %s', java);
      } else {
        error = new Error('Java not found');
      }
    }

    next(error, runner);
  });
}

function startRunner(runner, next) {
  var options = runner._options;
  var args = [
    '-Dport='+ options.port,
    '-jar', path.resolve(__dirname, options.jar)
  ];

  debug('Execute runner: %s %s', options.java, args.join(' '));
  options.cp = spawn(options.java, args);

  next(null, runner);
}

function test(error, runner) {
  var options = runner._options;

  if (error) {
    debug('Error\n', error.stack);
    runner.emit('error', error);
  } else {
    debug('Online');
    runner.emit('online');
    options.cp.once('error', (error) => runner.emit('error', error));
    status(runner, (error, res) => {
      if (error) {
        runner.emit('error', error);
      } else {
        debug('Listening');
        runner.emit('listening');
      }
    });
  }
}

function status(instance, done) {
  var url = Object.assign({
    method: 'GET'
  }, instance._options.statusUrl);

  debug('Status');
  _request(url, (error, res) => {
    if (error) {
      debug('Error\n', error.stack);
      done(error);
    } else {
      _decode(res, done);
    }
  });
}

function compile(instance, data, done) {
  var url = Object.assign({
    method: 'POST',
    data: data
  }, instance._options.compileUrl);

  debug('Compile\n', data);
  _request(url, (error, res) => {
    if (error) {
      debug('Error\n', error.stack);
      done(error);
    } else {
      _decode(res, done);
    }
  });
}

function kill(instance) {
  instance._options.cp.kill();
}

function _request(options, done) {
  var req;

  try {
    req = http.request(options, (res) => {
      if (res.statusCode != 200) {
        done(new Error('HTTP '+ res.statusCode +' '+ res.statusMessage));
      } else {
        done(null, res);
      }
    });
    req.on('error', done);
    req.setHeader('content-type', 'application/json');
    if (options.data) {
      req.write(JSON.stringify(options.data));
    }
    req.end();
  } catch (ex) {
    done(ex);
  }
}

function _decode(res, done) {
  res
  .on('error', done)
  .pipe(stream.buffer())
  .pipe(stream.writable((chunk, done_) => {
    chunk = JSON.parse(chunk.toString());
    done_();
    done(null, chunk);
  }));
}
