/* jshint esversion: 6 */

var util   = require('util');
var runner = require('../index');

var run = runner();
run.on('online', () => console.log('online'));
run.on('listening', () => {
  console.log('listening');


  run.status((error, res) => {
    console.log('--> status');
    console.log(util.inspect(error || res, { colors: true }));
  });

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
  }, (error, res) => {
    console.log('--> compile');
    console.log(util.inspect(error || res, { colors: true }));
  });
});

run.on('error', error => {
  console.error(error);
});
