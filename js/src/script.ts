import { extend } from './komrad';
import {
    Observable,
    withObservable,
    newObservable,
    newContext,
} from './app-solo';

'use strict';

//-------------------------------------------------------- noops-and-crosses
/**
 * Define Timer object.
 * 
 * @var id interval ID
 */
export interface Timer {
    id: number;
    elapsed: number;
    start: number;
    // sync: Timer | undefined;
    readonly observable: { value: Observable<string> };
    tag: () => this; // template: TemplateStringsArray
    toggle: () => this;
    reset: () => this;
    syncWith: (ref_timer: Timer) => this;
    isOn: () => boolean;
    [extension: string]: any; // open for extension.
}

/**
 * Create new Timer object.
 */
export function newTimer(): Timer & Observable<string> {
    const timer: any = {
        id: 0,
        elapsed: 0,
        start: 0,
        // sync: undefined,
        tag: function (): Timer {
            const formatted_time = new Date(
                performance.now() - this.start + this.elapsed
            )
                .toISOString()
                .slice(11, -5);
            this.observable.value.set(formatted_time);
            return this;
        },
        toggle: function (): Timer {
            if (this.id === 0) {
                this.start = performance.now();
                const that = this;
                this.id = setInterval(function (): void {
                    that.tag();
                }, 500);
            } else {
                clearInterval(this.id);
                this.tag();
                this.elapsed += performance.now() - this.start;
                this.id = 0;
            }
            return this;
        },
        reset: function (): Timer {
            if (this.id !== 0) {
                clearInterval(this.id);
                this.id = 0;
            }
            this.elapsed = 0;
            this.start = performance.now();
            this.tag();
            return this;
        },
        syncWith: function (another_timer: Timer): Timer {
            this.elapsed = another_timer.elapsed;
            this.start = another_timer.start;
            this.tag();
            // this.sync = ref_timer;
            return this;
        },
        isOn: function (): boolean {
            return !(this.id === 0);
        },
    };
    extend(timer, withObservable<string>('value', ''));
    return <Timer & Observable<string>>timer;
}

/**
 * Define Turn enum.
 */
const enum Turn {
    x = 'x',
    o = 'o',
    win = 'w',
    draw = 'd',
}

/**
 * Define Board object.
 */
interface Board {
    x: Observable<number>;
    o: Observable<number>;
    turn: Observable<Turn>;
    draw: number;
    wins: number[];
    check: () => this;
    play: (position: number) => this;
    reset: () => this;
    [extension: string]: any; // open for extension.
}

/**
 * Create new Board object.
 */
function newBoard(): Board {
    const board: Board = {
        x: newObservable<number>(0b000000000),
        o: newObservable<number>(0b000000000),
        turn: newObservable<Turn>(Turn.x),
        draw: 0b111111111,
        wins: [
            0b111000000, // horizontal
            0b000111000, // horizontal
            0b000000111, // horizontal
            0b100100100, // vertical
            0b010010010, // vertical
            0b001001001, // vertical
            0b100010001, // diagonal
            0b001010100, // diagonal
        ],

        check: function (): Board {
            /* Win ? */
            for (let condition of this.wins) {
                if ((this[this.turn.value].value & condition) === condition) {
                    this.turn.set(Turn.win);
                    return this;
                }
            }
            /* Draw ? */
            if ((this.x.value | this.o.value) === this.draw) {
                this.turn.set(Turn.draw);
                return this;
            }
            /* Next turn ! */
            this.turn.set(this.turn.value === Turn.x ? Turn.o : Turn.x);
            return this;
        },
        play: function (position: number): Board {
            if (this.turn.value === Turn.x || this.turn.value === Turn.o) {
                const mask = 1 << position;
                if (!(this.x.value & mask) && !(this.o.value & mask)) {
                    this[this.turn.value].set(
                        this[this.turn.value].value | mask
                    );
                    return this.check();
                }
            }
            return this;
        },
        reset: function (): Board {
            this.x.set(0b000000000);
            this.o.set(0b000000000);
            this.turn.set(Turn.x);
            return this;
        },
    };
    return board;
}

//----------------------------------------------------------------- main ---
/**
 * Run the app !
 */
window.addEventListener('DOMContentLoaded', function (event: Event) {
    const timer_x = newTimer().toggle();
    const timer_o = newTimer();
    const board = newBoard();

    const view_context = newContext();
    for (let i = 0; i < 9; i++) {
        const name = i.toString();
        view_context.put(name, newObservable<string>(name));
    }

    const board_context = newContext()
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

    const timer_x_container: Element =
        document.querySelector('.timer-x') ?? document.createElement('p');
    const timer_o_container: Element =
        document.querySelector('.timer-o') ?? document.createElement('p');

    /**
     * Translate board state to observable view context.
     *
     * @todo Update diff subscriber only, even if setting an observable to
     *       its current value does not cause further notify calls.
     * @todo Consider gradually building up and storing partially rendered
     *       templates with closures.
     */
    const boardView = function (value: number): void {
        const x = board.x.value;
        const o = board.o.value;
        for (let i = 0; i < 9; i++) {
            const mask = 1 << i;
            const name = i.toString();
            if (x & mask) {
                view_context.observables[name].set('X');
            } else {
                if (o & mask) {
                    view_context.observables[name].set('O');
                } else {
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
            case Turn.x:
            case Turn.o:
                timer_x.toggle();
                timer_o.toggle();
                timer_x_container.classList.toggle('active');
                timer_o_container.classList.toggle('active');
                return;
            case Turn.draw:
                msg = ': Draw game !';
                break;
            case Turn.win:
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
        squares[i].addEventListener(
            'mousedown',
            function (event) {
                board.play(i);
            },
            false
        );
    }

    //------------------------------------------------------ reset_button
    const reset_button: Element =
        document.querySelector('button[name=reset]') ??
        document.createElement('button');

    reset_button.addEventListener(
        'click',
        function (event: Event): void {
            board.reset();
            timer_x.reset().toggle();
            timer_o.reset();
            timer_x_container.classList.add('active');
            timer_o_container.classList.remove('active');
            event.stopPropagation();
        },
        false
    );
    /**
     * @todo Render single component.
     * @todo Batch renders.
     */
}); /* DOMContentLoaded */
// })(); /* IIFE */

export function sum(a: number, b: number): number {
    return a + b;
}
