## 6.0.0 - 2017-11-11

- Remove NodeJS v0.10 and v0.12 support
- Add `^` to also escape Windows metachars:
    - Fix a bug that made it impossible to escape an argument that contained quotes followed by `>` or other special chars, e.g.: `"foo|bar"`, fixes [#82](https://github.com/IndigoUnited/node-cross-spawn/issues/82)
    - Fix a bug were a command containing `%x%` would be replaced with the contents of the `x` environment variable, fixes [#51](https://github.com/IndigoUnited/node-cross-spawn/issues/51)
- Fix `options` argument being mutated


## 5.1.1 - 2017-02-26

- Fix `options.shell` support for NodeJS [v4.8](https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V4.md#4.8.0)

## 5.0.1 - 2016-11-04

- Fix `options.shell` support for NodeJS v7

## 5.0.0 - 2016-10-30

- Add support for `options.shell`
- Improve parsing of shebangs by using [`shebang-command`](https://github.com/kevva/shebang-command) module
- Refactor some code to make it more clear
- Update README caveats
