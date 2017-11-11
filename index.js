#!/usr/bin/env node

global.ROOT_DIR = process.cwd();
global.INSTALL_DIR = __dirname;
const pkg = require('./package.json');
const updateNotifier = require('update-notifier')({pkg});
const c = require('chalk');
const i = require('inquirer');
const fs = require("fs-extra");
const jimp = require("jimp");
var prog = require('progress-bar-formatter');
require(__dirname + "/walkDir.js");

if(updateNotifier.update){
    updateNotifier.notify({defer:false, isGlobal:true}); // display plz-update notification message
    setTimeout(main, 5000); // start after 5 seconds
}else{
    main(); // up to date - start right away
}
function main(){
    require(global.INSTALL_DIR + "/lib/splash_screen")(c).then(function () {
        global.main_menu();
    });
}

global.main_menu = function() {
    console.log('\x1Bc');
    i.prompt([{
        type: "list",
        message: "What would you like to do? ",
        name: "action",
        choices: [
            "1) Test settings on test-image",
            "2) Generate areas on a set of images",
            "3) Exit"
        ]
    }]).then(function (result) {
        if (result.action.charAt(0) === '1') {
            require(global.INSTALL_DIR + "/lib/get_image")(c, i,
                "Choose an image to test your settings on").then(function (test_img_path) {
                require(global.INSTALL_DIR + "/lib/get_settings")(c, i).then(function (settings) {
                    console.log('\x1Bc');
                    console.log("\nProcessing image...");
                    var filename = /.*\/([^\/]*\.[^\.]*)$/.exec(test_img_path)[1];
                    require(global.INSTALL_DIR + "/lib/process_image")(global.ROOT_DIR + test_img_path, settings, filename).then(function (amount_black_pixels) {
                        console.log(c.green("\nImage processed!"));
                        console.log("(" + amount_black_pixels + " dark pixels detected)");
                        console.log("Output can be found in \"" + global.ROOT_DIR + test_img_path + "\"");
                        setTimeout(global.main_menu, 4500);
                    });
                });
            });
        } else if (result.action.charAt(0) === '2') {
            require(global.INSTALL_DIR + "/lib/get_settings")(c, i).then(function (settings) {
                require(global.INSTALL_DIR + "/lib/get_image")(c, i,
                    "Choose a calibration-image containing a standard one-unit-large dark area for calibration").then(function (calib_img_path) {
                    console.log('\x1Bc');
                    console.log("\nCalculating calibration size...");
                    var filename = /.*\/([^\/]*\.[^\.]*)$/.exec(calib_img_path)[1];
                    require(global.INSTALL_DIR + "/lib/process_image")(global.ROOT_DIR + calib_img_path, settings, filename).then(function (calibration_pixels) {
                        console.log(c.green("Calibration image processed! (" + calibration_pixels + " dark pixels detected)"));
                        setTimeout(function(){
                            console.log('\x1Bc');
                            console.log("The following files have been found and will now be processed: ");
                            var files = global.walkDirectory(global.ROOT_DIR, "", 1).filter(function(t){return (/.*\.bmp/.test(t) || /.*\.jpg/.test(t) || /.*\.png/.test(t))});
                            console.log(files);
                            i.prompt([{
                                type: "confirm",
                                message: "Continue? ",
                                name: "decision"
                            }]).then(function(result){
                                if(result.decision){
                                    var arearesults = {};
                                    var currentProgress = 0;
                                    var totalFiles = files.length;
                                    console.log('\x1Bc');
                                    var bar = new prog(); //'Processing :bar :current/:total (:percent)  :filename', { total: files.length, width: 20});
                                    function updateProgressBar(filen){
                                        console.log('\x1Bc');
                                        console.log(        '\n\n    Processing ['
                                            +   bar.format(currentProgress / (totalFiles * 1.0)) + "] "
                                            +   currentProgress + "/" + totalFiles
                                            +   " (" + (currentProgress / (totalFiles * 0.01)).toFixed(0) + "%)   "
                                            +   filen);
                                    }
                                    updateProgressBar("");
                                    function processNextImg() {
                                        return new Promise(function(resolve, reject){
                                            var file_path = files.shift();
                                            var filename = /.*\/([^\/]*\.[^\.]*)$/.exec(file_path)[1];
                                            require(global.INSTALL_DIR + "/lib/process_image")(global.ROOT_DIR + file_path, settings, filename).then(function (dark_pixels) {
                                                arearesults[filename] = dark_pixels / calibration_pixels;
                                                currentProgress++;
                                                updateProgressBar(filename);
                                                if(files.length > 0)
                                                    resolve(processNextImg());
                                                else
                                                    resolve();
                                            }.bind(filename))
                                        });
                                    }
                                    processNextImg().then(function(){
                                        console.log(c.green("\n\n All files processed!"));
                                        fs.writeJsonSync(global.ROOT_DIR + "/nowhitearea.json", arearesults);
                                        setTimeout(global.main_menu, 5000);
                                    });
                                }else{
                                    global.main_menu()
                                }
                            })
                        }, 3500);
                    });
                });
            });
        }else{
            console.log('\x1Bc'); // EXIT
        }
    });
};