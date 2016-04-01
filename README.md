# node-cc-runner

Client for [Closure Compiler web runner](https://github.com/monai/cc-web-runner).

## Install

`npm install cc-runner`

## Usage

```js
var runner = require('cc-runner');
var compiler = runner.create();

compiler.on('listening', () => {
  compiler.status((error, res) => {
    console.log(res);
  });

  compiler.compile({
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
    console.log(res);
  });
});
```

## API

### create()

Returns compiler instance. Compiler is EventEmitter.

### compiler

#### Event: 'online'

Emitted when Closure Compiler child process is started.

#### Event: 'listening'

Emitted when Closure Compiler runner server is listening for connections.

#### Event: 'error'

Forwards all errors.

#### compiler.status(callback)

Callback arguments:

- `error`
- `object`
  - `options` - [CompilerOptions](https://github.com/google/closure-compiler/blob/v20160208/src/com/google/javascript/jscomp/CompilerOptions.java)
  - `compilerVersion` - Closure Compiler version

#### compiler.compile(data, callback)

Data:

- `options` - [CompilerOptions](https://github.com/google/closure-compiler/blob/v20160208/src/com/google/javascript/jscomp/CompilerOptions.java) object
- `externs` - `[{ fileName: String, code: String }]`
- `sources` - `[{ fileName: String, code: String }]`

Callback arguments:

- `error`
- `object`
  - `result` - [Result](https://github.com/google/closure-compiler/blob/v20160208/src/com/google/javascript/jscomp/Result.java) object
  - `source` - compiled code
  - `status` - SUCCESS|ERROR
  - `message` - error message if status is 'ERROR'

#### compiler.kill()

Kill Closure Compiler child process.

## License

ISC
