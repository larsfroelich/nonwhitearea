const jimp = require("jimp");

module.exports = function(path, settings, filename){
    return new Promise(function(resolve, reject){
        jimp.read(path).then(function(img_jimp){
            var total_dark_pixels = 0;
            img_jimp.scan(0, 0, img_jimp.bitmap.width, img_jimp.bitmap.height, function (x, y, idx) {

                var outputColor = undefined;
                var red   = this.bitmap.data[ idx + 0 ];
                var green = this.bitmap.data[ idx + 1 ];
                var blue  = this.bitmap.data[ idx + 2 ];

                if(x <= settings.ml){
                    outputColor = jimp.rgbaToInt(0, 0, 200, 255);
                }else if(x >= img_jimp.bitmap.width - settings.mr){
                    outputColor = jimp.rgbaToInt(0, 0, 200, 255);
                }
                if(y <= settings.mt){
                    outputColor = jimp.rgbaToInt(0, 200, 0, 255);
                }else if(y >= img_jimp.bitmap.height - settings.mb){
                    outputColor = jimp.rgbaToInt(0, 200, 0, 255);
                }

                if(outputColor === undefined){ // inside bounds
                    var brightness = (red + green + blue) / 3;
                    if(brightness > settings.minBright){
                        outputColor = jimp.rgbaToInt(255, 255, 255, 255);
                    }else{
                        outputColor = jimp.rgbaToInt(0, 0, 0, 255);
                        total_dark_pixels ++;
                    }
                }

                img_jimp.setPixelColor(outputColor, x, y);
            });
            img_jimp.write(global.ROOT_DIR + "/nonwhitearea_output/"  + filename, function(err){
                if(err)
                    reject(err);
                else
                    resolve(total_dark_pixels);
            })
        })
    })
};