const fs = require('fs');
const path = require('path');

function walkDirectory(rootdir, subdir, depth) {
    let results = [];
    const list = fs.readdirSync(path.join(rootdir, subdir));
    list.forEach(function(file) {
        const stat = fs.statSync(path.join(rootdir, subdir, file));
        if (stat && stat.isDirectory() && depth > 1) {
            results = results.concat(walkDirectory(rootdir, path.posix.join(subdir, file), depth - 1));
        } else {
            results.push(path.posix.join('/', subdir, file));
        }
    });
    return results;
}

module.exports = walkDirectory;
