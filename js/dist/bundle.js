(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newContext = exports.link = exports.withObservable = exports.newObservable = void 0;
const komrad_1 = require("./komrad");
'use strict';
/**
 * Create a new Observable object.
 *
 * @note Optional parameter priority in subscribe method is the index where
 *       given Subscriber is going to be 'spliced' in the subscribers list.
 *       If no paramater is supplied, given Subscriber is appended.
 *
 * @note To resolve notifications according to subscribers priority and
 *       insertion order, notify() Awaits each subscriber's callback in
 *       turn.
 *
 * @todo Research which approach is favored to prevent notification cascade.
 * @todo Defer render to after all compositions/updates are done.
 * @todo Consider using a binary heap for finer grain control of subscribers
 *       priority.
 * @todo Add unsubscribe method.
 * @todo Consider tracking Observables in a list.
 */
function newObservable(value) {
    const observable = {
        subscribers: [],
        value: value,
        notify: async function () {
            // const queue = []; // rate-limit-ish
            // console.log(this.subscribers);
            for (let i = 0, length = this.subscribers.length; i < length; i++) {
                // console.log('notifying ' + this.subscribers[i]);
                // queue.push(this.subscribers[i](this.value)); // rate-limit-ish
                await this.subscribers[i](this.value);
            }
            // await Promise.all(queue); // rate-limit-ish
            /**
             * @todo consider ES2020 Promise.allSettled
             */
            return this;
        },
        subscribe: function (subscriber, priority) {
            if (priority === undefined) {
                this.subscribers.push(subscriber);
            }
            else {
                this.subscribers.splice(priority, 0, subscriber);
            }
            return this;
        },
        flush: function () {
            this.subscribers = [];
            return this;
        },
        get: function () {
            /* Notify that a read is happening here if necessary. */
            return this.value;
        },
        set: function (value) {
            /* The buck stops here. */
            if (value !== this.value) {
                this.value = value;
                this.notify();
            }
            return this;
        },
    };
    return observable;
}
exports.newObservable = newObservable;
/**
 * Define Observable trait.
 */
function withObservable(name, value) {
    const trait = { observable: {} }; //  Record<string, Observable<T>>
    trait.observable[name] = newObservable(value);
    return trait;
}
exports.withObservable = withObservable;
/**
 * Set a 2-way link between given Observable and given DOM node.
 *
 * @todo Consider that the node emitting the original event probably
 *       does not need to be notified back/updated if it is its only
 *       dependency.
 * @todo Add unlink function.
 * @todo Look for an easier way of keeping tracks of writable properties per
 *       Node descendant type.
 * @todo Consider keeping it unsafe with a cast to <any>node.
 */
// type WritableProperty<T> = { [ P in keyof T] : 'readonly' extends keyof T[P] ? never : P}[keyof T];
// WritableProperty<Node>
// type WritableProperty<T> =
//     | 'classname'
//     | 'id'
//     | 'innerHTML'
//     | 'outerHTML'
//     | T extends HTMLFormElement
//     ?
//           | 'name'
//           | 'method'
//           | 'target'
//           | 'action'
//           | 'encoding'
//           | 'enctype'
//           | 'acceptCharset'
//           | 'autocomplete'
//           | 'noValidate'
//           | ''
//           | ''
//     : 'value';
// WritableProperty<typeof node>, //'className' | 'id' | 'innerHTML' | 'outerHTML',
function link(observable, node, property, event = 'input') {
    // console.log(arguments);
    node[property] = observable.value + '';
    observable.subscribe(
    // () => (node[property] = observable.get())
    () => {
        node[property] = observable.value + '';
    });
    node.addEventListener(event, () => observable.set(node[property]));
}
exports.link = link;
/**
 * Create a new Context object.
 *
 * @note put and merge will clobber existing entries.
 */
function newContext() {
    const context = {
        observables: {},
        pins: [],
        links: [],
        put: function (name, observable) {
            this.observables[name] = observable;
            return this;
        },
        remove: function (name) {
            if (this.observables[name] !== undefined) {
                delete this.observables[name];
            }
            return this;
        },
        /**
         * Merge observables from another given context.
         */
        merge: function (another_context) {
            if (another_context.observables !== undefined) {
                another_context = another_context.observables;
            }
            komrad_1.extend(this.observables, another_context);
            return this;
        },
        /**
         * Collect data pins declared in the DOM for this Context.
         *
         * @note If requested observable source is NOT found or available in
         *       this Context, record its name as a string placeholder.
         *
         * @todo Consider using a dictionnary and an identifier per pin.
         */
        musterPins: function () {
            var _a, _b, _c;
            const pin_nodes = [
                ...document.querySelectorAll('[data-pin]'),
            ];
            const length = pin_nodes.length;
            const pins = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = pin_nodes[i].getAttribute('data-pin')) !== null && _a !== void 0 ? _a : 'error';
                const target = (_b = pin_nodes[i].getAttribute('data-property')) !== null && _b !== void 0 ? _b : 'value';
                const type = (_c = pin_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string';
                pins[i] = {
                    source: this.observables[source] !== undefined
                        ? this.observables[source]
                        : source,
                    target: target,
                    type: type,
                    node: pin_nodes[i],
                };
            }
            this.pins = pins;
            return this;
        },
        /**
         * Collect data links declared in the DOM for this Context.
         *
         * @note If requested observable source is NOT found or available in
         *       this Context, record its name as a string placeholder.
         *
         * @todo Consider using a dictionnary and an identifier per pin.
         */
        musterLinks: function () {
            var _a, _b, _c, _d;
            const link_nodes = [
                ...document.querySelectorAll('[data-link]'),
            ];
            const length = link_nodes.length;
            const links = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = link_nodes[i].getAttribute('data-link')) !== null && _a !== void 0 ? _a : 'error';
                const event = (_b = link_nodes[i].getAttribute('data-event')) !== null && _b !== void 0 ? _b : 'input';
                const target = (_c = link_nodes[i].getAttribute('data-property')) !== null && _c !== void 0 ? _c : 'value';
                const type = (_d = link_nodes[i].getAttribute('data-type')) !== null && _d !== void 0 ? _d : 'string';
                links[i] = {
                    source: this.observables[source] !== undefined
                        ? this.observables[source]
                        : source,
                    event: event,
                    target: target,
                    type: type,
                    node: link_nodes[i],
                };
            }
            this.links = links;
            return this;
        },
        /**
         * Reference given pin collection as this context pin collection.
         */
        setPins: function (pins) {
            this.pins = pins;
            return this;
        },
        /**
         * Reference given link collection as this context link collection.
         */
        setLinks: function (links) {
            this.links = links;
            return this;
        },
        /**
         * Activate this context pin collection.
         *
         * @todo Deal with incomple Observable-less pins.
         */
        activatePins: function () {
            for (let i = 0, length = this.pins.length; i < length; i++) {
                if (typeof this.pins[i].source !== 'string') {
                    this.pins[i].source.subscribe((value) => {
                        this.pins[i].node[this.pins[i].target] = value;
                        // console.log('pin['+i+'] notified.');
                    });
                }
            }
            return this;
        },
        /**
         * Activate this context link collection.
         *
         * @todo Deal with incomple Observable-less links.
         */
        activateLinks: function () {
            for (let i = 0, length = this.links.length; i < length; i++) {
                if (typeof this.links[i].source !== 'string') {
                    link(this.links[i].source, this.links[i].node, this.links[i].target, this.links[i].event);
                }
            }
            return this;
        },
    };
    return context;
}
exports.newContext = newContext;

},{"./komrad":2}],2:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.cram = exports.extend = void 0;
/**
 * Extend given object with given trait, clobbering existing properties.
 *
 * @todo Look for ways to update type hint in-place !
 */
function extend(object, trait) {
    Object.keys(trait).forEach(function (key) {
        object[key] = trait[key];
    });
}
exports.extend = extend;
/**
 * Extend given object with given trait, stacking existing properties as
 * follow :
 *
 *   Merge objects.
 *   Append to arrays.
 *   Clobber scalars.
 *
 * @note Changing the 'shape' of an existing property would most likely be a
 *       recipe for disaster.
 */
function cram(object, trait) {
    Object.keys(trait).forEach(function (key) {
        switch (typeof object[key]) {
            case 'object':
                if (Array.isArray(object[key])) {
                    [...object[key], trait[key]];
                }
                else {
                    extend(object[key], trait[key]);
                }
                break;
            case undefined:
            // break;
            default:
                /* undefined and scalars */
                object[key] = trait[key];
                break;
        }
    });
    return object;
}
exports.cram = cram;
/**
 * Extend a shallow copy of given object with given trait, clobbering
 * existing properties.
 */
function extendCopy(object, trait) {
    const extended_copy = Object.assign({}, object);
    Object.keys(trait).forEach(function (key) {
        extended_copy[key] = trait[key];
    });
    return extended_copy;
}

},{}],3:[function(require,module,exports){
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

},{"./app-solo":1,"./komrad":2}]},{},[2,1,3]);
