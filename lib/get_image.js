module.exports = function getImage(c, i, msg){
    return new Promise(function(resolve, reject){
        var files = global.walkDirectory(global.ROOT_DIR, "", 1);
        files = files.filter(function(t){return (/.*\.bmp/.test(t) || /.*\.jpg/.test(t) || /.*\.png/.test(t))});
        if(files.length === 0){
            console.log(c(c.bold.red("\nERROR"), c.red(": No *.bmp *.png or *.jpeg images can be found in \"" + __dirname + "\"!")));
        }else{
            console.log('\x1Bc');
            i.prompt([{
                type: "list",
                message: msg,
                name: "file",
                choices: files
            }]).then(function(result){
                resolve(result.file);
            })
        }
    });
};