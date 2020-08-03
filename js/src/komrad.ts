'use strict';

//---------------------------------------------------------------- komrad.ts
/**
 * Manifesto for classless object composition.
 */
export type Trait = object;

/**
 * Extend given object with given trait, clobbering existing properties.
 * 
 * @todo Look for ways to update type hint in-place ! 
 */
export function extend<
    Base,
    Extension,
    B extends keyof Base,
    E extends keyof Extension
>(object: Base, trait: Trait & Extension): void {
    Object.keys(trait).forEach(function (key) {
        (<any>object)[<B>key] = trait[<E>key];
    });
}

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
export function cram<
    Base,
    Extension,
    B extends keyof Base,
    E extends keyof Extension
>(object: Base, trait: Trait & Extension): Base & Extension {
    Object.keys(trait).forEach(function (key) {
        switch (typeof object[<B>key]) {
            case 'object':
                if (Array.isArray(object[<B>key])) {
                    [...(<any>object[<B>key]), trait[<E>key]];
                } else {
                    extend(<any>object[<B>key], <any>trait[<E>key]);
                }
                break;
            case undefined:
            // break;
            default:
                /* undefined and scalars */
                (<any>object)[<B>key] = trait[<E>key];
                break;
        }
    });
    return <Base & Extension>object;
}

/**
 * Extend a shallow copy of given object with given trait, clobbering
 * existing properties.
 */
function extendCopy<Base, Extension, K extends keyof Extension>(
    object: Base,
    trait: Trait & Extension
): Base & Extension {
    const extended_copy: Base = { ...object };
    Object.keys(trait).forEach(function (key) {
        (<any>extended_copy)[key] = trait[<K>key];
    });
    return <Base & Extension>extended_copy;
}