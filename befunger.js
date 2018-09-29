// const Befunge = require('befunge');
// import {Befunge} from 'befunge'
let program = $('#program');
let stack = $('#stack');
let output = $('#output');
let x = 0, y = 0;
let befunge = new Befunge(onStackChange, onOutput, onProgramChange, onStep, onInput);

function onStackChange(_stack) {
    stack.text(_stack.join(" "));
}

function onOutput(_output) {
    output.text(output.text() + _output);
}

function onInput(_message) {
    return prompt(_message);
}

function onProgramChange(_program) {
    let newProgram = "";
    for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 80; x++) {
            newProgram += _program[y][x];
        }
        newProgram = newProgram.replace(/\s+$/, '') + "\n";
    }
    program.val(newProgram);
}

function onStep(_x, _y) {
    let pos = (_y * 80) + _x;
    // console.log(pos);
}

function onClickRun() {
    output.text("");
    stack.text("");
    befunge.reset();
    befunge.ignoreCallbacks = true;
    let bench = new Benchmark("Run");
    let tickCallback = () => {
      bench.tick();
    };
    bench.start();
    befunge.run(null, program.val(), tickCallback);
    bench.end();
    befunge.ignoreCallbacks = false;
    onOutput(befunge.output);
    onStackChange(befunge.stack);
}

function onClickStep() {
    console.log("step clicked");
    if(befunge.programLoaded === false){
        befunge.loadProgram(program.val());
    }
    befunge.stepInto(null, program.val());
}

function onClickClear() {
    if (alert("Are you sure you want to clear everything?")) {
        program.text("");
    }
}

function onClickPlay() {
    befunge.reset();
    befunge.loadProgram(program.val());
    let bench = new Benchmark("Play");
    bench.start();
    let delay = 16; // ms
    befunge.stepInto();
    let timeoutId = setTimeout(function loop() {
        bench.tick();
        befunge.stepInto();
        if(befunge.hasNext){
            timeoutId = setTimeout(loop, delay);
        } else {
            console.log("Ended");
            bench.end();
        }
    }, delay);
}

function onClickReset() {

}

class Benchmark {
    constructor(name){
        this.name = name;
        this.startTime = null;
        this.endTime = null;
        this.elapsedTime = null;
        this.ticks = 0;
    }
    start(){
        this.startTime = (new Date()).getTime();
        console.log(this.startTime);
    }

    end(){
        this.endTime = (new Date()).getTime();
        this.elapsedTime = this.endTime - this.startTime;
        this.stats();
    }

    tick(){
        this.ticks += 1;
    }

    stats(){
        console.log(`-------BENCHMARKING-------`);
        console.log(`Benchmark stats for ${this.name}:`);
        console.log(`Start time: ${this.startTime}`);
        console.log(`End time: ${this.endTime}`);
        console.log(`Ticks: ${this.ticks}`);
        console.log(`Elapsed time (ms): ${this.elapsedTime}`);
        console.log(`Elapsed time (s) : ${this.elapsedTime / 1000}`);
        console.log(`-------BENCHMARKING-------`);
    }
}
