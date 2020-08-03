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
