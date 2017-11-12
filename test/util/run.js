'use strict';

const spawn = require('../../index');
const once = require('once');

function isForceShell(method) {
    return /-force-shell$/.test(method);
}

function isMethodSync(method) {
    return /^sync(-|$)/.test(method);
}

function run(method, command, args, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    if (typeof args === 'function') {
        callback = args;
        args = options = null;
    }

    callback = callback || (() => {});

    // Are we forcing the shell?
    if (isForceShell(method)) {
        if (args && !Array.isArray(args)) {
            options = args;
            args = null;
        }

        method = method.replace(/-force-shell$/, '');
        options = Object.assign({ forceShell: true }, options);
    }

    // Run sync version
    if (method === 'sync') {
        const results = spawn.sync(command, args, options);

        callback(results.error, results.stdout ? results.stdout.toString() : null, results.status);

        return results;
    }

    // Run normal version
    const cp = spawn(command, args, options);
    let stdout = null;
    let stderr = null;

    callback = once(callback);

    cp.stdout && cp.stdout.on('data', (buffer) => {
        stdout = stdout || '';
        stdout += buffer.toString();
    });

    cp.stderr && cp.stderr.on('data', (buffer) => {
        stderr = stderr || '';
        stderr += buffer.toString();
    });

    cp.on('error', callback);

    cp.on('close', (code) => {
        code !== 0 && stderr && console.warn(stderr);
        callback(null, stdout, code);
    });

    return cp;
}

module.exports = run;
module.exports.methods = ['spawn-force-shell', 'spawn', 'sync-force-shell', 'sync'];
module.exports.isMethodSync = isMethodSync;
module.exports.isForceShell = isForceShell;
