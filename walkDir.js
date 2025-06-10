const fs = require('fs');
const path = require('path');
global.walkDirectory = function(rootdir, subdir, depth) {
    var results = [];
    var list = fs.readdirSync(path.join(rootdir, subdir));
    list.forEach(function(file) {
        var stat = fs.statSync(path.join(rootdir, subdir, file));
        if (stat && stat.isDirectory() && depth > 1) results = results.concat(walkDirectory(rootdir, path.join(subdir, file), depth-1));
        else results.push(path.join(subdir, file))
    });
    return results
};
