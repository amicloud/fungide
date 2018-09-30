const Befunge = require('./befunge');
let befunge = new Befunge();
befunge.run(null, "1234v\n>9 #5>:#._@\n^876<")
    .then((output) => {
        console.log(output);
});