module.exports = function(c){
    return new Promise(function (resolve, reject){
        console.log('\x1Bc');
        console.log(c.gray("\nCoded Nov-2017 by Lars Froelich"));
        console.log(c("\n\n\n        ", c.underline.cyan("Non-White-Area")));
        console.log(c.white("\n\n    A tool for calculating the size of\n    non-white areas in a set of images.\n\n"));
        setTimeout(resolve, 3 * 1000); // wait 3 seconds
    });
};

