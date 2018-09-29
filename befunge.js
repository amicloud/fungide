// const fs = require('fs'), path = require('path');
// const readline = require('readline-sync');

class Befunge {

    /**
     * @param {function} [onStackChange] - Called when the stack is updated (pushed or popped). Supplies one arg, current stack
     * @param {function} [onOutput] - Called when output happens (, or . commands). Supplies one arg, the generated output
     * @param {function} [onProgramChange] - Called when program is changed (p command) Supplies one arg, current program matrix
     * @param {function} [onStep] - Called when the interpreter makes a step (changing program cursor). Supplies two args the current X and Y values
     * @param {function} [onInput] - Called when the interpreter needs user input. Supplies one arg, prompt message
     */
    constructor(onStackChange = null, onOutput = null, onProgramChange = null, onStep = null, onInput = null) {
        this.onStackChangeCallback = onStackChange;
        this.onOutputCallback = onOutput;
        this.onProgramChangeCallback = onProgramChange;
        this.onStepCallback = onStep;
        this.onInputCallback = onInput;
        this.hasNext = false;
        this.ignoreCallbacks = false;
        this.output = "";
        this.x = 0;
        this.y = 0;
        this.dX = 1;
        this.dY = 0;
        this.stack = [];
        this.stringMode = false;
        this.programLoaded = false;
        this.generateEmptyProgram = () => {
            let program = [];
            for (let i = 0; i < 25; i++) {
                program.push(new Array(80).fill(" "));
            }
            this.programLoaded = false;
            return program;
        };
        this.program = this.generateEmptyProgram();
    }

    onStackChange() {
        if (this.ignoreCallbacks) return;
        if (this.onStackChangeCallback) {
            this.onStackChangeCallback(this.stack);
        }
    }

    onOutput(value) {
        this.output += value;
        if (this.ignoreCallbacks) return;
        if (this.onOutputCallback) {
            this.onOutputCallback(value);
        } else {
            console.log(value)
        }
    }

    onInput(doWhatWith, message) {
        // if (this.ignoreCallbacks) return;
        let input = this.onInputCallback ?
            this.onInputCallback(message) : '';
        doWhatWith(input);
    }

    onProgramChange() {
        if (this.ignoreCallbacks) return;
        if (this.onProgramChangeCallback) {
            this.onProgramChangeCallback(this.program);
        }
    }

    onStep() {
        if (this.ignoreCallbacks) return;
        if (this.onProgramChangeCallback) {
            this.onStepCallback(this.x, this.y);
        }
    }

    pop() {
        let v = this.stack.pop();
        this.onStackChange();
        if (v === undefined) {
            return 0;
        } else {
            return v;
        }
    }

    push(value) {
        this.stack.push(value);
        this.onStackChange()
    }

    step(doCallback = true) {
        this.x += this.dX;
        this.y += this.dY;
        if (this.x >= 80) this.x = 0;
        if (this.x < 0) this.x = 79;
        if (this.y >= 25) this.y = 0;
        if (this.y < 0) this.y = 24;
        if (doCallback) {
            this.onStep();
        }
    }

    static isHexDigit(value) {
        let a = parseInt(value, 16);
        return (a.toString(16) === value.toLowerCase())
    }

    parseToken(token) {
        if (this.stringMode) {
            let char = token.charCodeAt(0);
            if (char === 34) { // Char code for "
                this.toggleStringMode();
            } else if (char <= 255) {
                this.push(char);
            } else {
                // Do nothing for now
            }
        } else {
            if (Befunge.isHexDigit(token)) {
                this.pushHexValueToStack(token);
            } else {
                switch (token) {
                    case " ":
                        // this.stepInto();
                        break;
                    case ">":
                        this.right();
                        break;
                    case "<":
                        this.left();
                        break;
                    case "^":
                        this.up();
                        break;
                    case "v":
                        this.down();
                        break;
                    case "?":
                        this.randomDirection();
                        break;
                    case "+":
                        this.add();
                        break;
                    case "-":
                        this.subtract();
                        break;
                    case "*":
                        this.multiply();
                        break;
                    case "/":
                        this.divide();
                        break;
                    case "%":
                        this.modulo();
                        break;
                    case "`":
                        this.greaterThan();
                        break;
                    case "!":
                        this.not();
                        break;
                    case "_":
                        this.horizontalIf();
                        break;
                    case "|":
                        this.verticalIf();
                        break;
                    case ":":
                        this.duplicate();
                        break;
                    case "\\":
                        this.swap();
                        break;
                    case "$":
                        this.discard();
                        break;
                    case ".":
                        this.outInt();
                        break;
                    case ",":
                        this.outAscii();
                        break;
                    case "#":
                        this.bridge();
                        break;
                    case "g":
                        this.get();
                        break;
                    case "p":
                        this.put();
                        break;
                    case "&":
                        this.inInt();
                        break;
                    case "~":
                        this.inAscii();
                        break;
                    case `"`:
                        this.toggleStringMode();
                        break;
                    case "@":
                        this.terminateProgram();
                        break;
                }
            }
        }
    }

    pushHexValueToStack(token) {
        this.push((parseInt(token, 16)));
    }

    add() {
        let b = this.pop();
        let a = this.pop();
        this.push(a + b);
    }

    subtract() {
        let b = this.pop();
        let a = this.pop();
        this.push(a - b);
    }

    multiply() {
        let b = this.pop();
        let a = this.pop();
        this.push(a * b);
    }

    divide() {
        let b = this.pop();
        let a = this.pop();
        if (b !== 0) {
            this.push(Math.trunc(a / b));
        } else {
            this.push(0)
        }
    }

    modulo() {
        let b = this.pop();
        let a = this.pop();
        this.push(a % b);
    }

    not() {
        if (this.pop()) {
            this.push(0);
        } else {
            this.push(1);
        }
    }

    greaterThan() {
        let b = this.pop();
        let a = this.pop();
        if (a > b) {
            this.push(1);
        } else {
            this.push(0);
        }
    }

    right() {
        this.dY = 0;
        this.dX = 1;
    }

    left() {
        this.dY = 0;
        this.dX = -1;
    }

    up() {
        this.dY = -1;
        this.dX = 0;
    }

    down() {
        this.dY = 1;
        this.dX = 0;
    }

    randomDirection() {
        let r = Math.random();
        if (r <= 0.25) {
            this.left();
        } else if (r <= 0.50) {
            this.right();
        } else if (r <= 0.75) {
            this.up();
        } else if (r <= 1.00) {
            this.down();
        }
    }

    horizontalIf() {
        if (this.pop()) {
            this.left();
        } else {
            this.right();
        }
    }

    verticalIf() {
        if (this.pop()) {
            this.up();
        } else {
            this.down();
        }
    }

    toggleStringMode() {
        this.stringMode = !this.stringMode;
    }

    duplicate() {
        let a = this.pop();
        this.push(a);
        this.push(a);
    }

    swap() {
        let b = this.pop();
        let a = this.pop();
        this.push(b);
        this.push(a);
    }

    discard() {
        this.pop();
    }

    put() {
        this.program[this.pop()][this.pop()] = String.fromCharCode(this.pop() % 256);
        this.onProgramChange();
    }

    get() {
        this.push(this.program[this.pop()][this.pop()].charCodeAt(0));
    }

    bridge() {
        this.step()
    }

    outInt() {
        this.onOutput(this.pop().toString());
    }

    outAscii() {
        this.onOutput(String.fromCharCode(this.pop()));
    }

    inInt() {
        let callback = (input) => {
            if (!input) return;
            this.push(parseInt(input));
        };
        this.onInput(callback, "Enter integer: ");
    }

    inAscii() {
        let callback = (input) => {
            this.push(input.charCodeAt(0) % 256);
        };
        this.onInput(callback, "Enter character: ");
    }

    terminateProgram() {
        this.hasNext = false;
    }

    static readDataFromFile(_file) {
        let filePath = path.join(__dirname, _file);
        return fs.readFileSync(filePath).toString();
    }

    loadProgram(data) {
        let lines = data.split(/(?:\r\n)|(?:\r)|(?:\n)/);
        for (let y = 0; y < lines.length; y++) {
            for (let x = 0; x < lines[y].length; x++) {
                this.program[y][x] = lines[y][x];
            }
        }
        this.programLoaded = true;
        this.hasNext = true;
        return true;
    }

    getToken(x, y) {
        if (!(0 <= x < 80) || !(0 <= y < 25)) {
            throw new Error("Coordinates out of range!")
        }
        return this.program[y][x]
    }

    init(_file = null, _text = null) {
        this.program = this.generateEmptyProgram();
        if (_file) {
            if (this.loadProgram(Befunge.readDataFromFile(_file))) {
                this.hasNext = true;
                this.programLoaded = true;
                this.onProgramChange();
            }
        } else if (_text) {
            if (this.loadProgram(_text)) {
                this.hasNext = true;
                this.programLoaded = true;
                this.onProgramChange();
            }
        } else {
            console.error("Supports running from a file or with straight up text for now.");
            this.programLoaded = false;
        }
    }

    stepInto() {
        let token = this.getToken(this.x, this.y);
        if (this.stringMode) {
            this.parseToken(token);
            this.step();
        } else {
            if (token !== " ") {
                this.parseToken(token);
                this.step();
            } else {
                this.step();
                this.stepInto();
            }
        }
    }

    pause() {
        this.hasNext = false;
    }

    resume() {
        this.hasNext = true;
    }

    run(_file = null, _text = null, onTick = null) {
        this.init(_file, _text);
        while (this.hasNext) {
            if (onTick) {
                onTick();
            }
            this.stepInto();
        }
    }

    reset() {
        this.stack = [];
        this.output = '';
        this.x = 0;
        this.y = 0;
        this.right();
        this.stringMode = false;

    }
}

// module.exports = Befunge;

// let bef = new Befunge();
// bef.run('one_line_test.funge');