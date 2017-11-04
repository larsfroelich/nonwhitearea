const fs = require('fs');
global.walkDirectory = function(rootdir, subdir, depth) {
    var results = [];
    var list = fs.readdirSync(rootdir + subdir);
    list.forEach(function(file) {
        var stat = fs.statSync(rootdir + subdir + '/' + file);
        if (stat && stat.isDirectory() && depth > 1) results = results.concat(walkDirectory(rootdir, subdir + '/' + file, depth-1));
        else results.push(subdir + '/' + file)
    });
    return results
};