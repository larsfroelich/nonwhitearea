module.exports = function(c, i){
    return new Promise(function (resolve, reject) {
        console.log('\x1Bc');
        console.log(c.underline("\nImage-processing settings\n"));
        function isANumber(input){
            return new Promise(function(resolve, reject){
                if(!/^[0-9]+$/.test(input))
                    reject("Enter a number!");
                else{
                    resolve(true);
                }
            });
        }
        i.prompt([
            {
                type: "input",
                message: "Minimum brightness (between 0 and 255): ",
                name: "minBright",
                default: "155",
                validate: isANumber
            },
            {
                type: "input",
                message: "Left margin: ",
                name: "ml",
                default: "0",
                validate: isANumber
            }, {
                type: "input",
                message: "Right margin: ",
                name: "mr",
                default: "0",
                validate: isANumber
            }, {
                type: "input",
                message: "Top margin: ",
                name: "mt",
                default: "0",
                validate: isANumber
            },{
                type: "input",
                message: "Bottom margin: ",
                name: "mb",
                default: "0",
                validate: isANumber
            }
        ]).then(function(result){
            resolve(result);
        })
    });
};