#!/usr/bin/env node

const rootDir = process.cwd();
const installDir = __dirname;
const pkg = require('./package.json');
const updateNotifier = require('update-notifier')({pkg});
const c = require('chalk');
const i = require('inquirer');
const fs = require("fs-extra");
const jimp = require("jimp");
var prog = require('progress-bar-formatter');
const walkDirectory = require(__dirname + "/walkDir.js");

const context = { rootDir, installDir, walkDirectory };

if(updateNotifier.update){
    updateNotifier.notify({defer:false, isGlobal:true}); // display plz-update notification message
    setTimeout(main, 5000); // start after 5 seconds
}else{
    main(); // up to date - start right away
}
function main(){
    require(installDir + "/lib/splash_screen")(c).then(function () {
        main_menu();
    });
}

function main_menu() {
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
            require(installDir + "/lib/get_image")(c, i,
                "Choose an image to test your settings on").then(function (test_img_path) {
                require(installDir + "/lib/get_settings")(c, i).then(function (settings) {
                    console.log('\x1Bc');
                    console.log("\nProcessing image...");
                    var filename = /.*\/([^\/]*\.[^\.]*)$/.exec(test_img_path)[1];
                    require(installDir + "/lib/process_image")(context.rootDir, context.rootDir + test_img_path, settings, filename).then(function (amount_black_pixels) {
                        console.log(c.green("\nImage processed!"));
                        console.log("(" + amount_black_pixels + " dark pixels detected)");
                        console.log("Output can be found in \"" + context.rootDir + test_img_path + "\"");
                        setTimeout(main_menu, 4500);
                    });
                });
            });
        } else if (result.action.charAt(0) === '2') {
            require(installDir + "/lib/get_settings")(c, i).then(function (settings) {
                require(installDir + "/lib/get_image")(c, i,
                    "Choose a calibration-image containing a standard one-unit-large dark area for calibration").then(function (calib_img_path) {
                    console.log('\x1Bc');
                    console.log("\nCalculating calibration size...");
                    var filename = /.*\/([^\/]*\.[^\.]*)$/.exec(calib_img_path)[1];
                    require(installDir + "/lib/process_image")(context.rootDir, context.rootDir + calib_img_path, settings, filename).then(function (calibration_pixels) {
                        console.log(c.green("Calibration image processed! (" + calibration_pixels + " dark pixels detected)"));
                        setTimeout(function(){
                            console.log('\x1Bc');
                            console.log("The following files have been found and will now be processed: ");
                            var files = context.walkDirectory(context.rootDir, "", 1).filter(function(t){return (/.*\.bmp/.test(t) || /.*\.jpg/.test(t) || /.*\.png/.test(t))});
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
                                            require(installDir + "/lib/process_image")(context.rootDir, context.rootDir + file_path, settings, filename).then(function (dark_pixels) {
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
                                        fs.writeJsonSync(context.rootDir + "/nonwhitearea.json", arearesults);
                                        setTimeout(main_menu, 5000);
                                    });
                                }else{
                                    main_menu()
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

