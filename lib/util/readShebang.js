'use strict';

const fs = require('fs');
const LRU = require('lru-cache');
const shebangCommand = require('shebang-command');

const shebangCache = new LRU({ max: 50, maxAge: 30 * 1000 });  // Cache just for 30sec

function readShebang(command) {
    // Check if it is in the cache first
    if (shebangCache.has(command)) {
        return shebangCache.get(command);
    }

    // Read the first 150 bytes from the file
    let fd;
    const buffer = new Buffer(150);

    try {
        fd = fs.openSync(command, 'r');
        fs.readSync(fd, buffer, 0, 150, 0);
        fs.closeSync(fd);
    } catch (e) { /* empty */ }

    // Attempt to extract shebang (null is returned if not a shebang)
    const shebang = shebangCommand(buffer.toString());

    // Store the shebang in the cache
    shebangCache.set(command, shebang);

    return shebang;
}

module.exports = readShebang;
