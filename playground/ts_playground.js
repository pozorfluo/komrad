console.log(this);
const cow = newAnimal('Margie', 'Mooh');
console.log(cow.name);
console.log(cow.speak());
console.log(cow.bite('you'));
console.log(cow);
expecting: Cannot;
assign;
to;
'name';
because;
it;
is;
a;
read - only;
property.
    cow.name = 'Marguerite';
function extend2(object, trait) {
    console.log(Object.keys(trait).length);
    console.log([...Object.keys(trait)]);
    console.log(trait);
    for (let i = 0, length = Object.keys(trait).length; i < length; i++) {
        console.log(object[i]);
        console.log(trait[i]);
        object[i] = trait[i];
    }
}
function extend3(object, trait) {
    console.log(Object.keys(trait));
    keys = Object.keys(trait);
    for (let i = 0, length = keys.length; i < length; i++) {
        console.log(object[keys[i]]);
        console.log(trait[keys[i]]);
        object[keys[i]] = trait[keys[i]];
    }
}
/**
 * Extend given object with given trait, clobbering existing properties.
 */
function extend(object, trait) {
    Object.keys(trait).forEach(function (key) {
        object[key] = trait[key];
    });
}
/**
 * Extend given object with given trait.
 */
function extendSoftly(object, trait) {
    Object.keys(trait).forEach(function (key) {
        // console.log(key);
        if (typeof object[key] !== 'undefined') {
            return;
        }
        object[key] = trait[key];
    });
}
/**
 * Helper for partial application.
 *
 * @note Probably ill-named.
 */
function curry(func, ...partial_arg_list) {
    return function (...args) {
        //         return func(...partial_arg_list, ...args);
        [head, ...tail] = [args];
        return func(head, tail);
    };
}
/**
 * Create a new Monad.
 */
function newMonad() {
    return function unit(value) {
        const monad = Object.create(null);
        monad.bind = function (func) {
            return func(value);
        };
        return monad;
    };
}
function volumeCuboid(length, height, width) {
    return length * height * width;
}
const cuboid_100 = curry(volumeCuboid, 100);
console.log(cuboid_100(5, 5));
console.log(cuboid_100(1, 5));
console.log(cuboid_100(3, 5));
const cuboid_100_25 = curry(cuboid_100, 25);
console.log(cuboid_100_25(3));
console.log(cuboid_100_25(5));
const cuboid_10_12 = curry(volumeCuboid, 10, 12);
console.log(cuboid_10_12(5));
function hello(msg) {
    return msg + msg;
}
const identity = newMonad();
const monad = identity("yo");
monad.bind(console.log);
const identity_too = newMonad();
const monad_too = identity_too(cow);
monad_too.bind(console.log);
(monad_too.bind(console.log)).bind(alert);
console.log(tadam);
destructuring;
objects;
const { yup: yap } = { yup: () => { return 'hey'; } };
const { yup } = { yup: () => { return 'hey'; } };
console.log(yap);
console.log(yup);
console.log(yup());
const app_proxy = new Proxy({
    update_done: false,
    updated_nodes: [],
    timer: null,
}, {
    set: function (target, property, value, receiver) {
        console.log('app_proxy set fired');
        console.log(arguments);
        target[property] = value;
        target.updated_nodes.push(property);
        console.log(target.updated_nodes);
        if (target.update_done) {
            console.log('update done ! re-render ');
        }
        return true;
    }
});
app_proxy.timer = timer_node;
app_proxy.timer.textContent = 'green';
app_proxy.timer.textContent = 'red';
console.log(app_proxy.timer);
fragment.addEventListener('change', render);
const fragment_observer = {
    set: function (target, prop, receiver) {
        // console.log(Reflect.get(...arguments));
        console.log('yo');
    },
};
const fragment_proxy = new Proxy(fragment, fragment_observer);
console.log(fragment_proxy);
fragment_proxy.appendChild(timer);
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
let subscribers = [
    'aaaa',
    'bbbbb',
    'cccc',
    'dddd',
    'aaaa',
    'bbbbb',
    'cccc',
    'dddd',
];
let subscribers2 = [
    'aaaa',
    'bbbbb',
    'cccc',
    'dddd',
    'aaaa',
    'bbbbb',
    'cccc',
    'dddd',
];
for (let j = 5; j < 1000; j++) {
    const splice_me = getRandomInt(100);
    // const splice_me = j;
    subscribers = [
        ...subscribers.slice(0, splice_me),
        splice_me,
        ...subscribers.slice(splice_me),
    ];
    subscribers2.splice(splice_me, 0, splice_me);
}
for (let i = 0, length = subscribers.length; i < length; i++) {
    console.log(subscribers[i] +
        ' === ' +
        subscribers2[i] +
        ' ' +
        (subscribers[i] === subscribers2[i]));
}
console.log(subscribers);
console.log(subscribers2);
check;
types;
console.log(typeof cow);
console.log('is cow an Animal ? ' + isAnimal(cow));
console.log('is cow a Carnivorous Animal ? ' + isCarnivourousAnimal(cow));
// extend a copy
console.log('extending copy_cow withCarnivorous');
const copy_cow = extendCopy(cow, withCarnivorous);
console.log('is cow a Carnivourous Animal ? ' + isCarnivourousAnimal(cow));
// expecting : TypeError: cow.eat is not a function
// console.log(cow.eat('the farmer'));
console.log('is copy_cow a Carnivourous Animal ? ' +
    isCarnivourousAnimal(copy_cow));
console.log(copy_cow.eat('the farmer'));
// extend
console.log('extending cow withCarnivorous');
extend(cow, withCarnivorous);
console.log('is cow a Carnivourous Animal ? ' + isCarnivourousAnimal(cow));
console.log(cow.eat('the farmer'));
// final
const cow_final = Object.seal(newAnimal('Marguerite', 'Mooh'));
console.log(cow_final.name);
console.log(cow_final.speak());
cow_final.evolveSound('Boooooh');
console.log(cow_final.speak());
// expecting : TypeError: can't define property "eat": Object is not extensible
// extend(cowSealed, withCarnivorous);
// immutable
const cow_immutable = Object.freeze(newAnimal('Marguerite', 'Mooh'));
console.log(cow_immutable.name);
console.log(cow_immutable.speak());
expecting: TypeError: "sound";
is;
read - only;
cowFrozen.evolveSound('Boooooh');
function render(value) {
    console.log(value + ' just add tagged template now ! ');
}
function resolveSoon(value) {
    return new Promise((resolve) => {
        console.log('resolveSoon value : ' + value);
        setTimeout(function (value) {
            render(value);
            resolve('resolveSoon');
            console.log('resolveSoon is done');
        }, 1000, value);
    });
}
function resolveLate(value) {
    return new Promise((resolve) => {
        console.log('resolveLate value : ' + value);
        setTimeout(function (value) {
            render(value);
            resolve('resolveLate');
            console.log('resolveLate is done');
        }, 2000, value);
    });
}
function resolveLater(value) {
    return new Promise((resolve) => {
        console.log('resolveLater value : ' + value);
        setTimeout(function (value) {
            render(value);
            resolve('resolveLater');
            console.log('resolveLater is done');
        }, 3000, value);
    });
}
function resolveFirst(value) {
    return new Promise((resolve) => {
        console.log('resolveFirst value : ' + value);
        setTimeout(function (value) {
            render(value);
            resolve('resolveFirst');
            console.log('resolveFirst is done');
        }, 1000, value);
    });
}
function resolveLast(value) {
    return new Promise((resolve) => {
        console.log('resolveLast value : ' + value);
        setTimeout(function (value) {
            render(value);
            resolve('resolveLast');
            console.log('resolveLast is done');
        }, 1000, value);
    });
}
// mutate read-only properties via defined methods
cow.sound.subscribe(console.log);
cow.evolveSound('Boooooh');
// console.log(cow.speak());
cow.sound.subscribe(resolveLate);
cow.sound.subscribe(console.log);
cow.sound.subscribe(console.log, 3);
cow.sound.subscribe(resolveLater);
cow.sound.subscribe(render);
cow.sound.subscribe(resolveLate);
cow.sound.subscribe(render);
cow.sound.subscribe(resolveSoon);
cow.sound.subscribe(resolveLast);
cow.sound.subscribe(resolveFirst, 0);
cow.evolveSound('Ruuuuuuu-paul');
// console.log(cow.speak());
console.log('I NEED TO HAPPEN NOW');
// resolveSoon('ImNotInTheLoop');
const observer_config = {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
};
const report = function (mutations, observer) {
    console.log(mutations);
    console.log(observer);
};
const observer = new MutationObserver(report);
observer.observe(timer, observer_config);
tag `tagged ${p1} look ${p2} powerful every second :`;
setInterval(tick, 1000, timer, start, tag, `tagged ${p1} look ${p2} powerful every second :`);
setInterval(tick, 1000, start);
console.log(timer);
fragment.appendChild(timer);
timer.textContent = "part";
/**
 * Extend a deep copy of given object with given trait, clobbering existing
 * properties.
 */
function extendDeepCopy(object, trait) {
    Object.keys(trait).forEach(function (key) {
        object[key] = trait[key];
    });
}
/**
 * Define Animal helper trait.
 */
// type Animal = Trait;
const withAnimal = {
    speak: function () {
        return this.name + ' says ' + this.sound.value + ' !';
    },
    bite: function (target) {
        return this.name + ' bites ' + target + ' !';
    },
};
/**
 * Create a new Animal object.
 */
function newAnimal(name, sound) {
    const animal = {
        name: name,
        sound: newObservable(sound),
    };
    extend(animal, withAnimal);
    extend(animal, withEvolvable);
    return animal;
    // return Object.freeze(animal);
    // return Object.seal(animal);
}
const withCarnivorous = {
    eat: function (target) {
        return this.name + ' eats ' + target + ' !';
    },
};
const withEvolvable = {
    evolveSound: function (sound) {
        // this.sound = sound;
        this.sound.set(sound);
    },
};
function isAnimal(object) {
    return object.name !== undefined;
    // return <Animal>object.name !== undefined;
}
function isCarnivourousAnimal(object) {
    return object.eat !== undefined;
    // return <Animal & Carnivorous>object.eat !== undefined;
}
function isEvolvableAnimal(object) {
    return object.evolveSound !== undefined;
    // return <Animal & Evolvable>object.evolveSound !== undefined;
}
const base_object = extendCopy({}, withObservable('observable_extension', 'notice me !'));
// console.log(base_object);
cram(base_object, withObservable('another_observe', 'let me in'));
// console.log(base_object);
cram(base_object, withObservable('yet_another', 'make some room'));
console.log(JSON.stringify(base_object));
console.log(base_object.observable.observable_extension);
console.log(base_object.observable.another_observe);
console.log(base_object.observable.yet_another);
const fragment = document.createDocumentFragment();
const p1_timer = document.createElement('p');
const p2_timer = document.createElement('p');
const input = document.createElement('input');
const output = document.createElement('input');
input.type = 'text';
output.type = 'text';
fragment.appendChild(p1_timer);
fragment.appendChild(input);
fragment.appendChild(output);
document.body.appendChild(fragment);
// 1-way
observable_state.subscribe((value) => (timer.textContent = value));
// 2-way link
link(observable_state, input);
link(observable_state, output, 'value', 'change');
/**
 *  !!! PAY ATTENTION this is METHOD CHAINING !!!
 *
 * Test_context mutates along the way for now.
 */
test_context
    .put('timer', observable_state)
    .remove('timer')
    .put('timer', observable_state)
    .merge({
    timer: observable_state,
    timer2: observable_state,
    timer3: observable_state,
})
    .remove('timer2');
const another_context = newContext();
another_context
    .put('another_timer', observable_state)
    .merge(test_context);
// ------------------------------------------------- tagged templates
function render() {
    console.log('render');
    console.log(this);
}
function tag(chunks, ...placeholders) {
    console.log('Tagged templates are amazing !');
    console.log('array of all string chunks in the template :');
    console.log(chunks);
    console.log('array of all placeholders in the template :');
    console.log(placeholders);
}
function tick(target, time, tag, template) {
    const formatted_time = new Date(Date.now() - time).toISOString().slice(11, -5);
    target.set('time elapsed : ' + formatted_time
    // + formatted_time.getMinutes()
    // + ':'
    // + formatted_time.getSeconds()
    );
    // console.log(template);
    // console.log(tag);
    // tag`${template}`;
    // node.textContent = template;
}
/**
 * Collect data pins currently in the DOM for a given Context.
 *
 * @note If requested observable source is NOT found or available in given
 *       Context, record its name as a string placeholder.
 *
 * @todo Consider using a dictionnary and an identifier per pin.
 * @todo Consider making it a method of Context object.
 */
function musterPins(context) {
    const pin_nodes = [...document.querySelectorAll('[data-pin]')];
    const length = pin_nodes.length;
    const pins = Array(length);
    for (let i = 0; i < length; i++) {
        const source = pin_nodes[i].getAttribute('data-pin');
        const target = pin_nodes[i].getAttribute('data-property');
        const type = pin_nodes[i].getAttribute('data-type');
        pins[i] = {
            source: context.observables[source] !== undefined
                ? context.observables[source]
                : source,
            target: target !== null ? target : 'value',
            type: type !== null ? type : 'string',
            node: pin_nodes[i],
        };
    }
    return pins;
}
/**
 * Collect data links currently in the DOM for a given Context.
 *
 * @note If requested observable source is NOT found or available in given
 *       Context, record its name as a string placeholder.
 *
 * @todo Consider using a dictionnary and an identifier per pin.
 * @todo Consider making it a method of Context object.
 */
function musterLinks(context) {
    const link_nodes = [
        ...document.querySelectorAll('[data-link]'),
    ];
    const length = link_nodes.length;
    const links = Array(length);
    for (let i = 0; i < length; i++) {
        const source = link_nodes[i].getAttribute('data-link');
        const event = link_nodes[i].getAttribute('data-event');
        const target = link_nodes[i].getAttribute('data-property');
        const type = link_nodes[i].getAttribute('data-type');
        links[i] = {
            source: context.observables[source] !== undefined
                ? context.observables[source]
                : source,
            target: target !== null ? target : 'value',
            event: event !== null ? event : 'input',
            type: type !== null ? type : 'string',
            node: link_nodes[i],
        };
    }
    return links;
}
/**
 * Activate a given pin collection.
 *
 * @todo Deal with incomple Observable-less pins
 * @todo Consider making it a method of Context object.
 */
function activatePins(pins) {
    for (let i = 0, length = pins.length; i < length; i++) {
        if (typeof pins[i].source !== 'string') {
            pins[i].source.subscribe((value) => (pins[i].node[pins[i].target] = value));
        }
    }
}
/**
 * Activate a given Link collection.
 *
 * @todo Deal with incomple Observable-less pins
 * @todo Consider making it a method of Context object.
 */
function activateLinks(links) {
    for (let i = 0, length = links.length; i < length; i++) {
        if (typeof links[i].source !== 'string') {
            link(links[i].source, links[i].node, links[i].target, links[i].event);
        }
    }
}
