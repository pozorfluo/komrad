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
