/**
 * Manifesto for classless object composition.
 */
export declare type Trait = object;
/**
 * Extend given object with given trait, clobbering existing properties.
 *
 * @todo Look for ways to update type hint in-place !
 */
export declare function extend<T>(object: object, trait: Trait & T): void;
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
export declare function cram<Base, Extension, K extends keyof Extension, N extends keyof Base>(object: Base, trait: Trait & Extension): Base & Extension;
export declare function sum(a: number, b: number): number;
