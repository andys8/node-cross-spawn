# cross-spawn

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Build status][appveyor-image]][appveyor-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url] [![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]

[npm-url]:https://npmjs.org/package/cross-spawn
[downloads-image]:http://img.shields.io/npm/dm/cross-spawn.svg
[npm-image]:http://img.shields.io/npm/v/cross-spawn.svg
[travis-url]:https://travis-ci.org/IndigoUnited/node-cross-spawn
[travis-image]:http://img.shields.io/travis/IndigoUnited/node-cross-spawn/master.svg
[appveyor-url]:https://ci.appveyor.com/project/satazor/node-cross-spawn
[appveyor-image]:https://img.shields.io/appveyor/ci/satazor/node-cross-spawn/master.svg
[david-dm-url]:https://david-dm.org/IndigoUnited/node-cross-spawn
[david-dm-image]:https://img.shields.io/david/IndigoUnited/node-cross-spawn.svg
[david-dm-dev-url]:https://david-dm.org/IndigoUnited/node-cross-spawn?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/IndigoUnited/node-cross-spawn.svg
[greenkeeper-image]:https://badges.greenkeeper.io/IndigoUnited/node-cross-spawn.svg
[greenkeeper-url]:https://greenkeeper.io/

A cross platform solution to node's spawn and spawnSync.


## Installation

`$ npm install cross-spawn`


## Why

Node has issues when using spawn on Windows:

- It ignores [PATHEXT](https://github.com/joyent/node/issues/2318)
- It does not support [shebangs](http://pt.wikipedia.org/wiki/Shebang)
- No `options.shell` support on node `<v4.8`
- Has problems running commands with [spaces](https://github.com/nodejs/node/issues/7367)

All these issues are handled correctly by `cross-spawn`.
There are some known modules, such as [win-spawn](https://github.com/ForbesLindesay/win-spawn), that try to solve this but they are either broken or provide faulty escaping of shell arguments.


## Usage

Exactly the same way as node's [`spawn`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) or [`spawnSync`](https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options), so it's a drop in replacement.


```js
var spawn = require('cross-spawn');

// Spawn NPM asynchronously
var child = spawn('npm', ['list', '-g', '-depth', '0'], { stdio: 'inherit' });

// Spawn NPM synchronously
var results = spawn.sync('npm', ['list', '-g', '-depth', '0'], { stdio: 'inherit' });
```


## Caveats

### Using `options.shell` as an alternative to `cross-spawn`

Starting from node `v4.8`, `spawn` has a `shell` option that allows you run commands from within a shell. This new option solves most of the problems that `cross-spawn` attempts to solve, but:

- It's not supported in node `<v4.8`
- You must manually escape the command and arguments which is very error prone, specially when passing user input

If you are using the `shell` option to spawn a command in a cross platform way, consider using `cross-spawn` instead. You have been warned.

### `options.shell` support

While `cross-spawn` adds support for `options.shell` in node `<v4.8`, all of its enhancements are disabled.

This mimics the Node.js behavior. More specifically, the command and its arguments will not be automatically escaped nor shebang support will be offered. This is by design because if you are using `options.shell` you are probably targeting a specific platform anyway and you don't want things to get into your way.


### Shebangs support

While `cross-spawn` handles shebangs on Windows, its support is limited: e.g.: it doesn't handle arguments after the path, e.g.: `#!/bin/bash -e`.

Remember to always test your code on Windows!


## Tests

`$ npm test`


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
