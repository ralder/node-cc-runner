"use strict";

var util   = require('util');
var runner = require('../index');

var run = runner();
run.on('online', () => console.log('online'));
run.on('listening', () => {
  console.log('listening');


  run.status({ level: 'SIMPLE_OPTIMIZATIONS' }, (error, res) => {
    console.log('--> status');
    console.log(util.inspect(error || res, { colors: true }));
  });

  run.compile({
    optimizations: {
      level: "SIMPLE_OPTIMIZATIONS"
    },
    sources: [{
      fileName: 'bar.js',
      code: '(console.log(function(){return 42-9;}));'
    }]
  }, (error, res) => {
    console.log('--> compile');
    console.log(util.inspect(error || res, { colors: true }));
  });

  // run.externs((error, res) => {
  //   console.log('--> externs');
  //   console.log(util.inspect(error || res, { colors: true }));
  // });
});

run.on('error', error => {
  console.error(error);
});
