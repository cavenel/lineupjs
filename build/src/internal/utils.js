import * as equalImpl from 'fast-deep-equal';
// keep here to have a "real" export for webpack not just interfaces
/**
 * deep equal comparison
 */
export function equal(a, b) {
    var f = typeof equalImpl === 'function' ? equalImpl : equalImpl.default;
    return f(a, b);
}
/** @internal */
export function equalArrays(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every(function (ai, i) { return ai === b[i]; });
}
/**
 * converts a given id to css compatible one
 * @param id
 * @return {string|void}
 * @internal
 */
export function fixCSS(id) {
    return id.replace(/[\s!#$%&'()*+,./:;<=>?@[\\\]^`{|}~]+/g, '_'); //replace non css stuff to _
}
/**
 * clear node clearing
 * @param node
 * @internal
 */
export function clear(node) {
    while (node.lastChild) {
        node.removeChild(node.lastChild);
    }
    return node;
}
/**
 * @internal
 * to avoid [].concat(...) which doesn't work for large arrays
 * @param arrs
 */
export function concat(arrs) {
    var r = [];
    for (var _i = 0, arrs_1 = arrs; _i < arrs_1.length; _i++) {
        var a = arrs_1[_i];
        if (!Array.isArray(a)) {
            r.push(a);
            continue;
        }
        for (var _a = 0, a_1 = a; _a < a_1.length; _a++) {
            var ai = a_1[_a];
            r.push(ai);
        }
    }
    return r;
}
/**
 * generates a label for the given sort method
 * @internal
 * @param method sort method
 */
export function getSortLabel(method) {
    switch (method) {
        case 'min':
            return 'Minimum';
        case 'max':
            return 'Maximum';
        case 'median':
            return 'Median';
        case 'mean':
            return 'Mean';
        case 'q1':
            return '25% Quantile';
        case 'q3':
            return '75% Quantile';
        default:
            return String(method);
    }
}
//# sourceMappingURL=utils.js.map