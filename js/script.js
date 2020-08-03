"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sum = void 0;
const komrad_1 = require("./komrad");
const app_solo_1 = require("./app-solo");
'use strict';
/**
 * Create new Timer object.
 */
function newTimer() {
    const timer = {
        id: 0,
        elapsed: 0,
        start: 0,
        // sync: undefined,
        tag: function () {
            const formatted_time = new Date(performance.now() - this.start + this.elapsed)
                .toISOString()
                .slice(11, -5);
            this.observable.value.set(formatted_time);
            return this;
        },
        toggle: function () {
            if (this.id === 0) {
                this.start = performance.now();
                const that = this;
                this.id = setInterval(function () {
                    that.tag();
                }, 500);
            }
            else {
                clearInterval(this.id);
                this.tag();
                this.elapsed += performance.now() - this.start;
                this.id = 0;
            }
            return this;
        },
        reset: function () {
            if (this.id !== 0) {
                clearInterval(this.id);
                this.id = 0;
            }
            this.elapsed = 0;
            this.start = performance.now();
            this.tag();
            return this;
        },
        syncWith: function (another_timer) {
            this.elapsed = another_timer.elapsed;
            this.start = another_timer.start;
            this.tag();
            // this.sync = ref_timer;
            return this;
        },
        isOn: function () {
            return !(this.id === 0);
        },
    };
    komrad_1.extend(timer, app_solo_1.withObservable('value', ''));
    return timer;
}
/**
 * Create new Board object.
 */
function newBoard() {
    const board = {
        x: app_solo_1.newObservable(0b000000000),
        o: app_solo_1.newObservable(0b000000000),
        turn: app_solo_1.newObservable("x" /* x */),
        draw: 0b111111111,
        wins: [
            0b111000000,
            0b000111000,
            0b000000111,
            0b100100100,
            0b010010010,
            0b001001001,
            0b100010001,
            0b001010100,
        ],
        check: function () {
            /* Win ? */
            for (let condition of this.wins) {
                if ((this[this.turn.value].value & condition) === condition) {
                    this.turn.set("w" /* win */);
                    return this;
                }
            }
            /* Draw ? */
            if ((this.x.value | this.o.value) === this.draw) {
                this.turn.set("d" /* draw */);
                return this;
            }
            /* Next turn ! */
            this.turn.set(this.turn.value === "x" /* x */ ? "o" /* o */ : "x" /* x */);
            return this;
        },
        play: function (position) {
            if (this.turn.value === "x" /* x */ || this.turn.value === "o" /* o */) {
                const mask = 1 << position;
                if (!(this.x.value & mask) && !(this.o.value & mask)) {
                    this[this.turn.value].set(this[this.turn.value].value | mask);
                    return this.check();
                }
            }
            return this;
        },
        reset: function () {
            this.x.set(0b000000000);
            this.o.set(0b000000000);
            this.turn.set("x" /* x */);
            return this;
        },
    };
    return board;
}
//----------------------------------------------------------------- main ---
/**
 * Run the app !
 */
window.addEventListener('DOMContentLoaded', function (event) {
    var _a, _b, _c;
    const timer_x = newTimer().toggle();
    const timer_o = newTimer();
    const board = newBoard();
    const view_context = app_solo_1.newContext();
    for (let i = 0; i < 9; i++) {
        const name = i.toString();
        view_context.put(name, app_solo_1.newObservable(name));
    }
    const board_context = app_solo_1.newContext()
        .put('timer_x', timer_x.observable.value)
        .put('timer_o', timer_o.observable.value)
        .put('board_x', board.x)
        .put('board_o', board.o)
        .put('turn', board.turn)
        .merge(view_context)
        .musterPins()
        .activatePins();
    /* No links used for this game */
    // .musterLinks()
    // .activateLinks();
    const timer_x_container = (_a = document.querySelector('.timer-x')) !== null && _a !== void 0 ? _a : document.createElement('p');
    const timer_o_container = (_b = document.querySelector('.timer-o')) !== null && _b !== void 0 ? _b : document.createElement('p');
    /**
     * Translate board state to observable view context.
     *
     * @todo Update diff subscriber only, even if setting an observable to
     *       its current value does not cause further notify calls.
     */
    const boardView = function (value) {
        const x = board.x.value;
        const o = board.o.value;
        for (let i = 0; i < 9; i++) {
            const mask = 1 << i;
            const name = i.toString();
            if (x & mask) {
                view_context.observables[name].set('X');
            }
            else {
                if (o & mask) {
                    view_context.observables[name].set('O');
                }
                else {
                    view_context.observables[name].set('');
                }
            }
        }
    };
    /**
     * Add Board state subscriber to refresh view.
     */
    board_context.observables.board_x.subscribe(boardView);
    board_context.observables.board_o.subscribe(boardView);
    /**
     * Add turn subscriber to toggle timers.
     */
    board_context.observables.turn.subscribe((value) => {
        let msg = '';
        switch (value) {
            case "x" /* x */:
            case "o" /* o */:
                timer_x.toggle();
                timer_o.toggle();
                timer_x_container.classList.toggle('active');
                timer_o_container.classList.toggle('active');
                return;
            case "d" /* draw */:
                msg = ': Draw game !';
                break;
            case "w" /* win */:
                msg = 'wins !';
                break;
            default:
                msg = ': something weird happened !';
                break;
        }
        if (timer_x.isOn()) {
            timer_x.toggle();
            timer_x.observable.value.set(msg);
        }
        if (timer_o.isOn()) {
            timer_o.toggle();
            timer_o.observable.value.set(msg);
        }
    });
    //------------------------------------------------------------- grid
    const squares = [...document.querySelectorAll('.square')];
    for (let i = 0, length = squares.length; i < length; i++) {
        squares[i].addEventListener('mousedown', function (event) {
            board.play(i);
        }, false);
    }
    //------------------------------------------------------ reset_button
    const reset_button = (_c = document.querySelector('button[name=reset]')) !== null && _c !== void 0 ? _c : document.createElement('button');
    reset_button.addEventListener('click', function (event) {
        board.reset();
        timer_x.reset().toggle();
        timer_o.reset();
        timer_x_container.classList.add('active');
        timer_o_container.classList.remove('active');
        event.stopPropagation();
    }, false);
    /**
     * @todo Render single component.
     * @todo Batch renders.
     */
}); /* DOMContentLoaded */
// })(); /* IIFE */
function sum(a, b) {
    return a + b;
}
exports.sum = sum;
