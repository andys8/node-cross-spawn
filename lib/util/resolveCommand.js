'use strict';

const path = require('path');
const which = require('which');
const LRU = require('lru-cache');

const commandCache = new LRU({ max: 50, maxAge: 30 * 1000 });  // Cache just for 30sec

function resolveCommand(command, noExtension) {
    noExtension = !!noExtension;

    const cacheId = `${command}!${noExtension}`;

    // Check if its resolved in the cache
    if (commandCache.has(cacheId)) {
        return commandCache.get(cacheId);
    }

    let resolved;

    try {
        resolved = !noExtension ?
            which.sync(command) :
            which.sync(command, { pathExt: path.delimiter + (process.env.PATHEXT || '') });
    } catch (e) { /* empty */ }

    commandCache.set(cacheId, resolved);

    return resolved;
}

module.exports = resolveCommand;
