const Befunge = require('./befunge');
let befunge = new Befunge();
const readLine = require('readline-sync');

befunge.onInputCallback = (message) => {
    console.log(message);
    return readLine.prompt();
};

befunge.onOutputCallback = (output) => {
    console.log(output);
};

befunge.onStepCallback = (x, y) => {
    console.log(`Current x position: ${x}`);
    console.log(`Current y position: ${y}`);
};

befunge.onCellChangeCallback = (x, y, newValue) => {
    console.log(`Cell at ${x}, ${y} has been updated to ${newValue.toString()}`);
};

befunge.onStackChangeCallback = (stack) => {
    console.log(`Current stack: ${stack.toString()}`);
};

befunge.run(null, "~123v\n>89#4>:#._@\n^765<")
    .then((output) => {
        console.log(output);
    });