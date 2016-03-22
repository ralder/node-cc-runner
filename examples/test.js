/* jshint esversion: 6 */

var runner = require('./index');

var run = runner();
run.on('online', () => console.log('online'));
run.on('listening', () => {
  console.log('listening');

  run.status(console.log);

  run.compile({
    options: {
      foldConstants: true
    },
    externs: [{
      fileName: 'foo.js',
      code: ''
    }],
    sources: [{
      fileName: 'bar.js',
      code: '(console.log(function(){return 42-9;}));'
    }]
  }, (error, res) => console.log(res));
});

run.on('error', error => {
  console.error(error);
});
