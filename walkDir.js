const fs = require('fs');

function walkDirectory(rootdir, subdir, depth) {
    let results = [];
    const list = fs.readdirSync(rootdir + subdir);
    list.forEach(function(file) {
        const stat = fs.statSync(rootdir + subdir + '/' + file);
        if (stat && stat.isDirectory() && depth > 1) {
            results = results.concat(walkDirectory(rootdir, subdir + '/' + file, depth - 1));
        } else {
            results.push(subdir + '/' + file);
        }
    });
    return results;
}

module.exports = walkDirectory;
