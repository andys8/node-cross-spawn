'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Prepare fixtures
const fixturesDir = __dirname + '/fixtures';

glob.sync('prepare_*', { cwd: __dirname + '/fixtures' }).forEach((file) => {
    const contents = fs.readFileSync(fixturesDir + '/' + file);
    const finalFile = file.replace(/^prepare_/, '').replace(/\.sh$/, '');

    fs.writeFileSync(fixturesDir + '/' + finalFile, contents);
    fs.chmodSync(fixturesDir + '/' + finalFile, parseInt('0777', 8));

    process.stdout.write('Copied "' + file + '" to "' + finalFile + '"\n');
});

// Fix AppVeyor tests because Git bin folder is in PATH and it has a "echo" program there
if (process.env.APPVEYOR) {
    process.env.PATH = process.env.PATH
    .split(path.delimiter)
    .filter((entry) => !/\\git\\bin$/i.test(path.normalize(entry)))
    .join(path.delimiter);
}
