/* eslint prefer-template:0*/

'use strict';

const fs = require('fs');
const path = require('path');
const expect = require('expect.js');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const run = require('./util/run');

const isWin = process.platform === 'win32';

describe('cross-spawn', () => {
    run.methods.forEach((method) => {
        describe(method, () => {
            const originalPath = process.env.PATH;

            before(() => {
                mkdirp.sync(__dirname + '/tmp');
            });

            after(function (next) {
                // Give it some time, RIMRAF was giving problems on windows
                this.timeout(10000);

                rimraf(__dirname + '/tmp', () => {
                    // Ignore errors, RIMRAF was giving problems on windows
                    next(null);
                });
            });

            afterEach(() => {
                process.env.PATH = originalPath;
            });

            it('should support shebang in executables with /usr/bin/env', (next) => {
                run(method, __dirname + '/fixtures/shebang', (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('shebang works!');

                    // Test if the actual shebang file is resolved against the PATH
                    process.env.PATH = path.normalize(__dirname + '/fixtures/') + path.delimiter + process.env.PATH;

                    run(method, 'shebang', (err, data, code) => {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data).to.equal('shebang works!');

                        next();
                    });
                });
            });

            it('should support shebang in executables with relative path', (next) => {
                const executable = './' + path.relative(process.cwd(), __dirname + '/fixtures/shebang');

                fs.writeFileSync(__dirname + '/tmp/shebang', '#!/usr/bin/env node\n\nprocess.stdout.write(\'yeah\');',
                    { mode: parseInt('0777', 8) });
                process.env.PATH = path.normalize(__dirname + '/tmp/') + path.delimiter + process.env.PATH;

                run(method, executable, (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('shebang works!');

                    next();
                });
            });

            it('should support shebang in executables with relative path that starts with `..`', (next) => {
                const executable = '../' + path.basename(process.cwd()) +
                    '/' + path.relative(process.cwd(), __dirname + '/fixtures/shebang');

                fs.writeFileSync(__dirname + '/tmp/shebang', '#!/usr/bin/env node\n\nprocess.stdout.write(\'yeah\');',
                    { mode: parseInt('0777', 8) });
                process.env.PATH = path.normalize(__dirname + '/tmp/') + path.delimiter + process.env.PATH;

                run(method, executable, (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('shebang works!');

                    next();
                });
            });

            it('should support shebang in executables with extensions', (next) => {
                fs.writeFileSync(__dirname + '/tmp/shebang_' + method + '.js', '#!/usr/bin/env node\n\nprocess.stdout.write(\'shebang with \
extension\');', { mode: parseInt('0777', 8) });
                process.env.PATH = path.normalize(__dirname + '/tmp/') + path.delimiter + process.env.PATH;

                run(method, __dirname + '/tmp/shebang_' + method + '.js', (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('shebang with extension');

                    // Test if the actual shebang file is resolved against the PATH
                    process.env.PATH = path.normalize(__dirname + '/fixtures/') + path.delimiter + process.env.PATH;

                    run(method, 'shebang_' + method + '.js', (err, data, code) => {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data).to.equal('shebang with extension');

                        next();
                    });
                });
            });

            it('should expand using PATHEXT properly', (next) => {
                run(method, __dirname + '/fixtures/foo', (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data.trim()).to.equal('foo');

                    next();
                });
            });

            it('should handle commands with spaces', (next) => {
                run(method, __dirname + '/fixtures/bar space', ['foo bar'], (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data.trim()).to.equal('bar');

                    next();
                });
            });

            it('should handle commands with special shell chars', (next) => {
                run(method, __dirname + '/fixtures/()%!^&;, ', (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data.trim()).to.equal('special');

                    next();
                });
            });

            it('should handle arguments with quotes', (next) => {
                run(method, 'node', [
                    __dirname + '/fixtures/echo',
                    '"foo"',
                    'foo"bar"foo',
                ], (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('"foo"\nfoo"bar"foo');

                    next();
                });
            });

            it('should handle empty arguments', (next) => {
                run(method, 'node', [
                    __dirname + '/fixtures/echo',
                    'foo',
                    '',
                    'bar',
                ], (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('foo\n\nbar');

                    next();
                });
            });

            it('should handle non-string arguments', (next) => {
                run(method, 'node', [
                    __dirname + '/fixtures/echo',
                    1234,
                ], (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('1234');

                    next();
                });
            });

            it('should handle arguments with spaces', (next) => {
                run(method, 'node', [
                    __dirname + '/fixtures/echo',
                    'I am',
                    'André Cruz',
                ], (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('I am\nAndré Cruz');

                    next();
                });
            });

            it('should handle arguments with \\"', (next) => {
                run(method, 'node', [
                    __dirname + '/fixtures/echo',
                    'foo',
                    '\\"',
                    'bar',
                ], (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('foo\n\\"\nbar');

                    next();
                });
            });

            it('should handle arguments that end with \\', (next) => {
                run(method, 'node', [
                    __dirname + '/fixtures/echo',
                    'foo',
                    'bar\\',
                    'baz',
                ], (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('foo\nbar\\\nbaz');

                    next();
                });
            });

            it('should handle arguments that contain shell special chars', (next) => {
                const args = [
                    'foo',
                    '()',
                    'foo',
                    '[]',
                    'foo',
                    '%!',
                    'foo',
                    '^<',
                    'foo',
                    '>&',
                    'foo',
                    '|;',
                    'foo',
                    ', ',
                    'foo',
                    '!=',
                    'foo',
                    '\\*',
                    'foo',
                    '"f"',
                    'foo',
                    '?.',
                    'foo',
                    '=`',
                    'foo',
                    '\'',
                    'foo',
                ];

                run(method, 'node', [__dirname + '/fixtures/echo'].concat(args), (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal(args.join('\n'));

                    next();
                });
            });

            it('should handle escaping of quotes followed by special meta chars', (next) => {
                const arg = '"(foo|bar>baz|foz)"';

                run(method, 'node', [
                    __dirname + '/fixtures/echo',
                    arg,
                ], (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal(arg);

                    next();
                });
            });

            it('should handle commands with names of environment variables', (next) => {
                run(method, __dirname + '/fixtures/%CD%', (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data.trim()).to.equal('special');

                    next();
                });
            });

            it('should handle optional args correctly', (next) => {
                run(method, __dirname + '/fixtures/foo', (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);

                    run(method, __dirname + '/fixtures/foo', {
                        stdio: ['pipe', 'pipe', 'pipe'],
                    }, (err, data, code) => {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);

                        run(method, __dirname + '/fixtures/foo', null, {
                            stdio: ['pipe', 'pipe', 'pipe'],
                        }, (err, data, code) => {
                            expect(err).to.not.be.ok();
                            expect(code).to.be(0);

                            next();
                        });
                    });
                });
            });

            it('should not mutate args nor options', (next) => {
                const args = [];
                const options = {};

                run(method, __dirname + '/fixtures/foo', options, (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);

                    expect(args).to.have.length(0);
                    expect(Object.keys(options)).to.have.length(0);

                    next();
                });
            });

            it('should give correct exit code', (next) => {
                run(method, 'node', [__dirname + '/fixtures/exit'], (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(25);

                    next();
                });
            });

            it('should work with a relative command', (next) => {
                run(method, path.relative(process.cwd(), __dirname + '/fixtures/foo'), (err, data, code) => {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data.trim()).to.equal('foo');

                    if (!isWin) {
                        return next();
                    }

                    run(method, path.relative(process.cwd(), __dirname + '/fixtures/foo.bat'), (err, data, code) => {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data.trim()).to.equal('foo');

                        next();
                    });
                });
            });

            it('should emit "error" and "close" if command does not exist', function (next) {
                const spawned = run(method, 'somecommandthatwillneverexist');

                this.timeout(5000);

                function assertError(err) {
                    const syscall = run.isMethodSync(method) ? 'spawnSync' : 'spawn';

                    expect(err).to.be.an(Error);
                    expect(err.message).to.contain(syscall);
                    expect(err.message).to.contain('ENOENT');
                    expect(err.message).to.not.contain('undefined');
                    expect(err.code).to.be('ENOENT');
                    expect(err.errno).to.be('ENOENT');
                    expect(err.syscall).to.contain(syscall);
                    expect(err.syscall).to.not.contain('undefined');
                }

                if (run.isMethodSync(method)) {
                    assertError(spawned.error);
                    return next();
                }

                const errors = [];

                spawned
                .on('error', (err) => {
                    errors.push(err);
                })
                .on('exit', () => {
                    spawned.removeAllListeners();
                    next(new Error('Should not emit exit'));
                })
                .on('close', (code, signal) => {
                    expect(code).to.not.be(0);
                    expect(signal).to.be(null);

                    setTimeout(() => {
                        expect(errors).to.have.length(1);
                        assertError(errors[0]);

                        next();
                    }, 1000);
                });
            });

            it('should NOT emit "error" if shebang command does not exist', function (next) {
                const spawned = run(method, __dirname + '/fixtures/shebang_enoent');
                let exited;
                let timeout;

                this.timeout(5000);

                if (run.isMethodSync(method)) {
                    expect(spawned.error).to.not.be.ok();
                    return next();
                }

                spawned
                .on('error', () => {
                    spawned.removeAllListeners();
                    clearTimeout(timeout);
                    next(new Error('Should not emit error'));
                })
                .on('exit', () => {
                    exited = true;
                })
                .on('close', (code, signal) => {
                    expect(code).to.not.be(0);
                    expect(signal).to.be(null);
                    expect(exited).to.be(true);

                    timeout = setTimeout(next, 1000);
                });
            });

            it('should NOT emit "error" if the command actual exists but exited with 1', function (next) {
                const spawned = run(method, __dirname + '/fixtures/exit1');
                let exited;
                let timeout;

                this.timeout(5000);

                if (run.isMethodSync(method)) {
                    expect(spawned.error).to.not.be.ok();
                    return next();
                }

                spawned
                .on('error', () => {
                    spawned.removeAllListeners();
                    clearTimeout(timeout);
                    next(new Error('Should not emit error'));
                })
                .on('exit', () => {
                    exited = true;
                })
                .on('close', (code, signal) => {
                    expect(code).to.not.be(0);
                    expect(signal).to.be(null);
                    expect(exited).to.be(true);

                    timeout = setTimeout(next, 1000);
                });
            });

            if (isWin) {
                it('should use nodejs\' spawn when options.shell is specified', (next) => {
                    run(method, 'echo', ['%RANDOM%'], { shell: true }, (err, data, code) => {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data.trim()).to.match(/\d+/);

                        next();
                    });
                });
            } else {
                it('should use nodejs\' spawn when options.shell is specified', (next) => {
                    run(method, 'echo', ['hello &&', 'echo there'], { shell: true }, (err, data, code) => {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data.trim()).to.equal('hello\nthere');

                        next();
                    });
                });
            }

            if (isWin && !run.isForceShell(method)) {
                it('should NOT spawn a shell for a .exe', (next) => {
                    run(method, __dirname + '/fixtures/win-ppid.js', (err, data, code) => {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data.trim()).to.equal('' + process.pid);
                        next();
                    });
                });
            }
        });
    });
});
