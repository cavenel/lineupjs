/**
 * create a delayed call, can be called multiple times but only the last one at most delayed by timeToDelay will be executed
 * @param {(...args: any[]) => void} callback the callback to call
 * @param {number} timeToDelay delay the call in milliseconds
 * @param choose optional function to merge call context
 * @return {(...args: any[]) => any} a function that can be called with the same interface as the callback but delayed
 * @internal
 */
export default function debounce(callback, timeToDelay, choose) {
    if (timeToDelay === void 0) { timeToDelay = 100; }
    var tm = -1;
    var ctx = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (tm >= 0) {
            clearTimeout(tm);
            tm = -1;
        }
        var next = { self: this, args: args };
        // compute current context
        ctx = ctx && choose ? choose(ctx, next) : next;
        tm = setTimeout(function () {
            console.assert(ctx != null);
            callback.apply(ctx.self, ctx.args);
            ctx = null;
        }, timeToDelay);
    };
}
//# sourceMappingURL=debounce.js.map