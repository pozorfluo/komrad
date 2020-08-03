import {Trait, extend} from './komrad';
'use strict';

//------------------------------------------------------------------ app-solo.ts
/**
 * Single-page party system ! 
 */

/**
 * Define Subscriber callback.
 */
export interface Subscriber<T> {
    (value: T): void;
}

/**
 * Define Observable object.
 */
export interface Observable<T> {
    subscribers: Subscriber<T>[];
    value: T;
    notify: () => Promise<this>;
    subscribe: (subscriber: Subscriber<T>, priority?: number) => this;
    // unsubscribe: (subscriber: Subscriber<T>) => void;
    flush: () => this;
    get: () => T;
    set: (value: T) => this;
    [extension: string]: any; // open for extension.
}

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
export function newObservable<T>(value: T): Observable<T> {
    const observable: any = {
        subscribers: [],
        value: value,

        notify: async function (): Promise<Observable<T>> {
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

        subscribe: function (
            subscriber: Subscriber<T>,
            priority?: number
        ): Observable<T> {
            if (priority === undefined) {
                this.subscribers.push(subscriber);
            } else {
                this.subscribers.splice(priority, 0, subscriber);
            }
            return this;
        },

        flush: function (): Observable<T> {
            this.subscribers = [];
            return this;
        },

        get: function (): T {
            /* Notify that a read is happening here if necessary. */
            return this.value;
        },

        set: function (value: T): Observable<T> {
            /* The buck stops here. */
            if (value !== this.value) {
                this.value = value;
                this.notify();
            }
            return this;
        },
    };
    return <Observable<T>>observable;
}

/**
 * Define Observable trait.
 */
export function withObservable<T>(name: string, value: T): Observable<T> & Trait {
    const trait: any = { observable: {} }; //  Record<string, Observable<T>>
    trait.observable[name] = newObservable<T>(value);
    return <Observable<T> & Trait>trait;
}
/**
 * Define Pin object.
 *
 * @var source Observed source.
 * @var target Property to target with update inside the downstream Node.
 * @var type Observed value type.
 *
 * @todo Add Tag / component / render function callback.
 */
export interface Pin<T> {
    source: Observable<T> | string;
    target: string;
    type: string;
    node: Node;
}

/**
 * Define Link object.
 * @var event Node Event type triggering an update of the upstream Observed
 *            source with the downstream Node target value.
 */
export interface Link<T> extends Pin<T> {
    event: string;
}

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
export function link(
    observable: Observable<boolean | string | number>,
    node: Node,
    property: string,
    event = 'input'
): void {
    // console.log(arguments);
    (<any>node)[property] = observable.value + '';
    observable.subscribe(
        // () => (node[property] = observable.get())
        () => {
            (<any>node)[property] = observable.value + '';
        }
    );
    node.addEventListener(event, () => observable.set((<any>node)[property]));
}

/**
 * Define Context object.
 *
 * @todo Consider promoting observables definition to interface
 *       ObservableCollection.
 * @todo Add deactivatePins method.
 * @todo Add deactivateLinks method.
 */
export interface Context {
    readonly observables: { [name: string]: Observable<any> };
    readonly pins: Pin<any>[];
    readonly links: Link<any>[];
    put: (name: string, observable: Observable<any>) => this;
    remove: (name: string) => this;
    merge: (
        another_context: Context | { [name: string]: Observable<any> }
    ) => Context;
    musterPins: () => this;
    musterLinks: () => this;
    setPins: (pins: Pin<any>[]) => this;
    setLinks: (links: Link<any>[]) => this;
    activatePins: () => this;
    activateLinks: () => this;
    [extension: string]: any; // open for extension.
}

/**
 * Create a new Context object.
 *
 * @note put and merge will clobber existing entries.
 */
export function newContext(): Context {
    const context: any = {
        observables: {},
        pins: [],
        links: [],
        put: function (name: string, observable: Observable<any>): Context {
            this.observables[name] = observable;
            return this;
        },

        remove: function (name: string): Context {
            if (this.observables[name] !== undefined) {
                delete this.observables[name];
            }
            return this;
        },

        /**
         * Merge observables from another given context.
         */
        merge: function (
            another_context: Context | { [name: string]: Observable<any> }
        ): Context {
            if (another_context.observables !== undefined) {
                another_context = another_context.observables;
            }
            extend(this.observables, another_context);
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
        musterPins: function (): Context {
            const pin_nodes: Element[] = [
                ...document.querySelectorAll('[data-pin]'),
            ];
            const length: number = pin_nodes.length;
            const pins: Pin<any>[] = Array(length);

            for (let i = 0; i < length; i++) {
                const source: string =
                    pin_nodes[i].getAttribute('data-pin') ?? 'error';
                const target: string =
                    pin_nodes[i].getAttribute('data-property') ?? 'value';
                const type: string =
                    pin_nodes[i].getAttribute('data-type') ?? 'string';
                pins[i] = {
                    source:
                        this.observables[source] !== undefined
                            ? this.observables[source]
                            : source,
                    target: target,
                    type: type,
                    node: pin_nodes[i],
                };
            }
            this.pins = <Pin<any>[]>pins;
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
        musterLinks: function (): Context {
            const link_nodes: Element[] = [
                ...document.querySelectorAll('[data-link]'),
            ];
            const length: number = link_nodes.length;
            const links: Link<any>[] = Array(length);

            for (let i = 0; i < length; i++) {
                const source: string =
                    link_nodes[i].getAttribute('data-link') ?? 'error';
                const event: string =
                    link_nodes[i].getAttribute('data-event') ?? 'input';
                const target: string =
                    link_nodes[i].getAttribute('data-property') ?? 'value';
                const type: string =
                    link_nodes[i].getAttribute('data-type') ?? 'string';
                links[i] = {
                    source:
                        this.observables[source] !== undefined
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
        setPins: function (pins: Pin<any>[]): Context {
            this.pins = pins;
            return this;
        },
        /**
         * Reference given link collection as this context link collection.
         */
        setLinks: function (links: Link<any>[]): Context {
            this.links = links;
            return this;
        },
        /**
         * Activate this context pin collection.
         *
         * @todo Deal with incomple Observable-less pins.
         */
        activatePins: function (): Context {
            for (let i = 0, length = this.pins.length; i < length; i++) {
                if (typeof this.pins[i].source !== 'string') {
                    (<Observable<any>>this.pins[i].source).subscribe(
                        (value) => {
                            this.pins[i].node[this.pins[i].target] = value;
                            // console.log('pin['+i+'] notified.');
                        }
                    );
                }
            }
            return this;
        },
        /**
         * Activate this context link collection.
         *
         * @todo Deal with incomple Observable-less links.
         */
        activateLinks: function (): Context {
            for (let i = 0, length = this.links.length; i < length; i++) {
                if (typeof this.links[i].source !== 'string') {
                    link(
                        <Observable<any>>this.links[i].source,
                        this.links[i].node,
                        this.links[i].target,
                        this.links[i].event
                    );
                }
            }
            return this;
        },
    };
    return <Context>context;
}