// const Befunge = require('befunge');
// import Befunge from 'befunge'
let program = $('#program');
let interpreter = $('#interpreter');
let stack = $('#stack');
let output = $('#output');
let buttonRun = $('#run');
let buttonResume = $('#resume');
let buttonPause = $('#pause');
let buttonPlay = $('#play');
let buttonStep = $('#step');
let buttonReset = $('#reset');
let buttonClear = $('#clear');
let buttonCrawl = $('#crawl');
let buttonToggleMode = $('#toggleMode');
let editorButtons = [buttonClear, buttonReset];
let interpreterButtons = [buttonRun, buttonResume, buttonPause, buttonPlay, buttonStep, buttonCrawl];
let x = 0, y = 0;
let interpreterMode = false;
let befunge = new Befunge(onStackChange, onOutput, onCellChange, onStep, onInput);
let lastCell;
let running = false;
interpreter.width(program.width());
interpreter.height(program.height());

toggleInterpreterButtons();


function toggleInterpreterMode() {
    interpreterMode = !interpreterMode;
    program.toggleClass("invisible");
    interpreter.toggleClass("invisible");
    toggleEditorButtons();
    toggleInterpreterButtons();
    if (interpreterMode) {
        resetPartialUI();
        befunge.reset();
        befunge.loadProgram(program.val());
        interpreter.html(generateSpansFromProgram());
        buttonToggleMode.text("Go To Editor Mode");
    } else {
        buttonToggleMode.text("Go To Interpreter Mode");
    }
}

function generateSpansFromProgram() {
    let output = "";
    for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 80; x++) {
            output += `<span id='${"c" + (y * 80 + x) }'>${befunge.program[y][x]}</span>`;
        }
        output = output.replace(/\s+$/, '') + "\n";
    }
    return output;
}

function toggleInterpreterButtons() {
    interpreterButtons.forEach((button) => {
        button.toggleClass('disabled');
    });
}

function toggleEditorButtons() {
    editorButtons.forEach((button) => {
        button.toggleClass('disabled');
    })
}

function onStackChange(_stack) {
    stack.text(_stack.join(" "));
}

function onOutput(_output) {
    output.text(output.text() + _output);
}

function onInput(_message) {
    return prompt(_message);
}

function onCellChange(_x, _y, newValue) {
    let currentCell = $(`#c${_y * 80 + _x}`);
    currentCell.text(newValue);
}

function onStep(_x, _y) {
    if (lastCell) {
        lastCell.removeClass("active-cell");
    }
    let currentCell = $(`#c${_y * 80 + _x}`);
    currentCell.addClass("active-cell");
    lastCell = currentCell;
}

function onClickRun() {
    resetPartialUI();
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
    if (befunge.programLoaded === false) {
        befunge.loadProgram(program.val());
    }
    befunge.stepInto(null, program.val());
}

function onClickClear() {
    if (alert("Are you sure you want to clear everything?")) {
        resetAllUI();
        befunge.reset();
    }
}

function resetAllUI() {
    output.text("");
    program.val("");
    stack.text("");
}

function resetPartialUI() {
    output.text("");
    stack.text("");
}

function onClickPlay() {
    befunge.reset();
    resetPartialUI();
    befunge.loadProgram(program.val());
    playLoop(0);
}

function onClickCrawl(){
    befunge.reset();
    resetPartialUI();
    befunge.loadProgram(program.val());
    playLoop(100);
}

function playLoop(_delay = 0) {
    let bench = new Benchmark("Play");
    bench.start();
    let delay = _delay; // ms
    befunge.stepInto();
    let timeoutId = setTimeout(function loop() {
        bench.tick();
        befunge.stepInto();
        if (befunge.hasNext) {
            timeoutId = setTimeout(loop, delay);
        } else {
            console.log("Ended");
            bench.end();
        }
    }, delay);
}

function onClickReset() {
    resetPartialUI();
    befunge.reset();
    befunge.loadProgram(program.val());
}

function onClickPause() {
    befunge.hasNext = !befunge.hasNext;
    if(running){
        buttonPause.text("Resume");
        befunge.hasNext = false;
        running = false;
    } else {
        buttonPause.text("Pause");
        befunge.hasNext = true;
        running = true;
        playLoop();
    }
}

function onClickResume() {
    befunge.hasNext = true;
    running = true;
    playLoop();
}

function onClickToggleInterpreter() {
    toggleInterpreterMode();
}

class Benchmark {
    constructor(name) {
        this.name = name;
        this.startTime = null;
        this.endTime = null;
        this.elapsedTime = null;
        this.ticks = 0;
    }

    start() {
        this.startTime = (new Date()).getTime();
        console.log(this.startTime);
    }

    end() {
        this.endTime = (new Date()).getTime();
        this.elapsedTime = this.endTime - this.startTime;
        this.stats();
    }

    tick() {
        this.ticks += 1;
    }

    stats() {
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
