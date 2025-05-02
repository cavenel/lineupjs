var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * @internal
 */
export function isForEachAble(v) {
    return typeof v.forEach === 'function';
}
/**
 * @internal
 */
export function isSeqEmpty(seq) {
    return seq.every(function () { return false; }); // more efficient than counting length
}
/**
 * helper function for faster access to avoid function calls
 * @internal
 */
export function isIndicesAble(it) {
    return (Array.isArray(it) ||
        it instanceof Uint8Array ||
        it instanceof Uint16Array ||
        it instanceof Uint32Array ||
        it instanceof Float32Array ||
        it instanceof Int8Array ||
        it instanceof Int16Array ||
        it instanceof Int32Array ||
        it instanceof Float64Array);
}
/**
 * sequence implementation that does the operation lazily on the fly
 */
var LazyFilter = /** @class */ (function () {
    function LazyFilter(it, filters) {
        this.it = it;
        this.filters = filters;
        this._length = -1;
    }
    Object.defineProperty(LazyFilter.prototype, "length", {
        get: function () {
            // cached
            if (this._length >= 0) {
                return this._length;
            }
            var l = 0;
            this.forEach(function () { return l++; });
            this._length = l;
            return l;
        },
        enumerable: false,
        configurable: true
    });
    LazyFilter.prototype.filter = function (callback) {
        // propagate filter
        return new LazyFilter(this.it, this.filters.concat(callback));
    };
    LazyFilter.prototype.map = function (callback) {
        // create lazy map out of myself
        return new LazyMap1(this, callback);
    };
    LazyFilter.prototype.forEach = function (callback) {
        if (isIndicesAble(this.it)) {
            // fast array version
            outer: for (var i_1 = 0; i_1 < this.it.length; ++i_1) {
                var v_1 = this.it[i_1];
                for (var _i = 0, _a = this.filters; _i < _a.length; _i++) {
                    var f = _a[_i];
                    if (!f(v_1, i_1)) {
                        continue outer;
                    }
                }
                callback(v_1, i_1);
            }
            return;
        }
        // iterator version
        var valid = 0;
        var it = this.it[Symbol.iterator]();
        var v = it.next();
        var i = 0;
        outer: while (!v.done) {
            for (var _b = 0, _c = this.filters; _b < _c.length; _b++) {
                var f = _c[_b];
                if (f(v.value, i)) {
                    continue;
                }
                v = it.next();
                i++;
                continue outer;
            }
            callback(v.value, valid++);
            v = it.next();
            i++;
        }
    };
    LazyFilter.prototype[Symbol.iterator] = function () {
        var _this = this;
        var it = this.it[Symbol.iterator]();
        var next = function () {
            var v = it.next();
            var i = -1;
            outer: while (!v.done) {
                i++;
                for (var _i = 0, _a = _this.filters; _i < _a.length; _i++) {
                    var f = _a[_i];
                    if (f(v.value, i)) {
                        continue;
                    }
                    // invalid go to next
                    v = it.next();
                    continue outer;
                }
                return v;
            }
            return v;
        };
        return { next: next };
    };
    LazyFilter.prototype.some = function (callback) {
        if (isIndicesAble(this.it)) {
            // fast array version
            outer: for (var i_2 = 0; i_2 < this.it.length; ++i_2) {
                var v_2 = this.it[i_2];
                for (var _i = 0, _a = this.filters; _i < _a.length; _i++) {
                    var f = _a[_i];
                    if (!f(v_2, i_2)) {
                        continue outer;
                    }
                }
                if (callback(v_2, i_2)) {
                    return true;
                }
            }
            return false;
        }
        var valid = 0;
        var it = this.it[Symbol.iterator]();
        var v = it.next();
        var i = 0;
        outer: while (!v.done) {
            for (var _b = 0, _c = this.filters; _b < _c.length; _b++) {
                var f = _c[_b];
                if (f(v.value, i)) {
                    continue;
                }
                v = it.next();
                i++;
                continue outer;
            }
            if (callback(v.value, valid++)) {
                return true;
            }
            v = it.next();
            i++;
        }
        return false;
    };
    LazyFilter.prototype.every = function (callback) {
        if (isIndicesAble(this.it)) {
            // fast array version
            outer: for (var i_3 = 0; i_3 < this.it.length; ++i_3) {
                var v_3 = this.it[i_3];
                for (var _i = 0, _a = this.filters; _i < _a.length; _i++) {
                    var f = _a[_i];
                    if (!f(v_3, i_3)) {
                        continue outer;
                    }
                }
                if (!callback(v_3, i_3)) {
                    return false;
                }
            }
            return true;
        }
        var valid = 0;
        var it = this.it[Symbol.iterator]();
        var v = it.next();
        var i = 0;
        outer: while (!v.done) {
            for (var _b = 0, _c = this.filters; _b < _c.length; _b++) {
                var f = _c[_b];
                if (f(v.value, i)) {
                    continue;
                }
                v = it.next();
                i++;
                continue outer;
            }
            if (!callback(v.value, valid++)) {
                return false;
            }
            v = it.next();
            i++;
        }
        return true;
    };
    LazyFilter.prototype.reduce = function (callback, initial) {
        if (isIndicesAble(this.it)) {
            // fast array version
            var acc = initial;
            var j = 0;
            outer: for (var i_4 = 0; i_4 < this.it.length; ++i_4) {
                var v_4 = this.it[i_4];
                for (var _i = 0, _a = this.filters; _i < _a.length; _i++) {
                    var f = _a[_i];
                    if (!f(v_4, i_4)) {
                        continue outer;
                    }
                }
                acc = callback(acc, v_4, j++);
            }
            return acc;
        }
        var valid = 0;
        var it = this.it[Symbol.iterator]();
        var v = it.next();
        var i = 0;
        var r = initial;
        outer: while (!v.done) {
            for (var _b = 0, _c = this.filters; _b < _c.length; _b++) {
                var f = _c[_b];
                if (f(v.value, i)) {
                    continue;
                }
                v = it.next();
                i++;
                continue outer;
            }
            r = callback(r, v.value, valid++);
            v = it.next();
            i++;
        }
        return r;
    };
    return LazyFilter;
}());
/**
 * lazy mapping operation
 */
var ALazyMap = /** @class */ (function () {
    function ALazyMap(it) {
        this.it = it;
    }
    Object.defineProperty(ALazyMap.prototype, "length", {
        get: function () {
            return this.it.length;
        },
        enumerable: false,
        configurable: true
    });
    ALazyMap.prototype.filter = function (callback) {
        return new LazyFilter(this, [callback]);
    };
    ALazyMap.prototype.forEach = function (callback) {
        if (isIndicesAble(this.it)) {
            for (var i = 0; i < this.it.length; ++i) {
                callback(this.mapV(this.it[i], i), i);
            }
            return;
        }
        var it = this.it[Symbol.iterator]();
        for (var v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            callback(this.mapV(v.value, i), i);
        }
    };
    ALazyMap.prototype[Symbol.iterator] = function () {
        var _this = this;
        var it = this.it[Symbol.iterator]();
        var i = 0;
        var next = function () {
            var v = it.next();
            if (v.done) {
                return {
                    value: undefined,
                    done: true,
                };
            }
            var value = _this.mapV(v.value, i);
            i++;
            return {
                value: value,
                done: false,
            };
        };
        return { next: next };
    };
    ALazyMap.prototype.some = function (callback) {
        if (isIndicesAble(this.it)) {
            for (var i = 0; i < this.it.length; ++i) {
                if (callback(this.mapV(this.it[i], i), i)) {
                    return true;
                }
            }
            return false;
        }
        var it = this.it[Symbol.iterator]();
        for (var v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            if (callback(this.mapV(v.value, i), i)) {
                return true;
            }
        }
        return false;
    };
    ALazyMap.prototype.every = function (callback) {
        if (isIndicesAble(this.it)) {
            for (var i = 0; i < this.it.length; ++i) {
                if (!callback(this.mapV(this.it[i], i), i)) {
                    return false;
                }
            }
            return true;
        }
        var it = this.it[Symbol.iterator]();
        for (var v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            if (!callback(this.mapV(v.value, i), i)) {
                return false;
            }
        }
        return true;
    };
    ALazyMap.prototype.reduce = function (callback, initial) {
        if (isIndicesAble(this.it)) {
            var acc_1 = initial;
            for (var i = 0; i < this.it.length; ++i) {
                acc_1 = callback(acc_1, this.mapV(this.it[i], i), i);
            }
            return acc_1;
        }
        var it = this.it[Symbol.iterator]();
        var acc = initial;
        for (var v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            acc = callback(acc, this.mapV(v.value, i), i);
        }
        return acc;
    };
    return ALazyMap;
}());
var LazyMap1 = /** @class */ (function (_super) {
    __extends(LazyMap1, _super);
    function LazyMap1(it, map12) {
        var _this = _super.call(this, it) || this;
        _this.map12 = map12;
        return _this;
    }
    LazyMap1.prototype.mapV = function (v, i) {
        return this.map12(v, i);
    };
    LazyMap1.prototype.map = function (callback) {
        return new LazyMap2(this.it, this.map12, callback);
    };
    return LazyMap1;
}(ALazyMap));
var LazyMap2 = /** @class */ (function (_super) {
    __extends(LazyMap2, _super);
    function LazyMap2(it, map12, map23) {
        var _this = _super.call(this, it) || this;
        _this.map12 = map12;
        _this.map23 = map23;
        return _this;
    }
    LazyMap2.prototype.map = function (callback) {
        return new LazyMap3(this.it, this.map12, this.map23, callback);
    };
    LazyMap2.prototype.mapV = function (v, i) {
        return this.map23(this.map12(v, i), i);
    };
    return LazyMap2;
}(ALazyMap));
var LazyMap3 = /** @class */ (function (_super) {
    __extends(LazyMap3, _super);
    function LazyMap3(it, map12, map23, map34) {
        var _this = _super.call(this, it) || this;
        _this.map12 = map12;
        _this.map23 = map23;
        _this.map34 = map34;
        return _this;
    }
    LazyMap3.prototype.map = function (callback) {
        var _this = this;
        var map1U = function (v, i) { return callback(_this.map34(_this.map23(_this.map12(v, i), i), i), i); };
        return new LazyMap1(this.it, map1U);
    };
    LazyMap3.prototype.mapV = function (v, i) {
        return this.map34(this.map23(this.map12(v, i), i), i);
    };
    return LazyMap3;
}(ALazyMap));
var LazySeq = /** @class */ (function () {
    function LazySeq(iterable) {
        this.iterable = iterable;
        this._arr = null;
    }
    Object.defineProperty(LazySeq.prototype, "arr", {
        get: function () {
            if (this._arr) {
                return this._arr;
            }
            if (isIndicesAble(this.iterable)) {
                this._arr = this.iterable;
            }
            else {
                this._arr = Array.from(this.iterable);
            }
            return this._arr;
        },
        enumerable: false,
        configurable: true
    });
    LazySeq.prototype[Symbol.iterator] = function () {
        return this.iterable[Symbol.iterator]();
    };
    LazySeq.prototype.filter = function (callback) {
        return new LazyFilter(this.arr, [callback]);
    };
    LazySeq.prototype.map = function (callback) {
        return new LazyMap1(this.arr, callback);
    };
    LazySeq.prototype.forEach = function (callback) {
        if (isIndicesAble(this.iterable)) {
            for (var i = 0; i < this.iterable.length; ++i) {
                callback(this.iterable[i], i);
            }
            return;
        }
        var it = this[Symbol.iterator]();
        for (var v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            callback(v.value, i);
        }
    };
    LazySeq.prototype.some = function (callback) {
        if (isIndicesAble(this.iterable)) {
            for (var i = 0; i < this.iterable.length; ++i) {
                if (callback(this.iterable[i], i)) {
                    return true;
                }
            }
            return false;
        }
        var it = this[Symbol.iterator]();
        for (var v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            if (callback(v.value, i)) {
                return true;
            }
        }
        return false;
    };
    LazySeq.prototype.every = function (callback) {
        if (isIndicesAble(this.iterable)) {
            for (var i = 0; i < this.iterable.length; ++i) {
                if (!callback(this.iterable[i], i)) {
                    return false;
                }
            }
            return true;
        }
        var it = this[Symbol.iterator]();
        for (var v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            if (!callback(v.value, i)) {
                return false;
            }
        }
        return true;
    };
    LazySeq.prototype.reduce = function (callback, initial) {
        if (isIndicesAble(this.iterable)) {
            var acc_2 = initial;
            for (var i = 0; i < this.iterable.length; ++i) {
                acc_2 = callback(acc_2, this.iterable[i], i);
            }
            return acc_2;
        }
        var it = this[Symbol.iterator]();
        var acc = initial;
        for (var v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            acc = callback(acc, v.value, i);
        }
        return acc;
    };
    Object.defineProperty(LazySeq.prototype, "length", {
        get: function () {
            var it = this.iterable;
            if (isIndicesAble(it)) {
                return it.length;
            }
            if (it instanceof Set || it instanceof Map) {
                return it.size;
            }
            return this.arr.length;
        },
        enumerable: false,
        configurable: true
    });
    return LazySeq;
}());
/**
 * @internal
 */
export function lazySeq(iterable) {
    return new LazySeq(iterable);
}
var ConcatSequence = /** @class */ (function () {
    function ConcatSequence(seqs) {
        this.seqs = seqs;
        //
    }
    ConcatSequence.prototype[Symbol.iterator] = function () {
        var seqs = Array.from(this.seqs);
        var it = seqs.shift()[Symbol.iterator]();
        var next = function () {
            var v = it.next();
            if (!v.done) {
                return v;
            }
            if (seqs.length === 0) {
                // last last
                return v;
            }
            // next iterator and compute next element
            it = seqs.shift()[Symbol.iterator]();
            return next();
        };
        return { next: next };
    };
    ConcatSequence.prototype.filter = function (callback) {
        return new LazyFilter(this, [callback]);
    };
    ConcatSequence.prototype.map = function (callback) {
        return new LazyMap1(this, callback);
    };
    ConcatSequence.prototype.forEach = function (callback) {
        this.seqs.forEach(function (s) { return s.forEach(callback); });
    };
    ConcatSequence.prototype.some = function (callback) {
        return this.seqs.some(function (s) { return s.some(callback); });
    };
    ConcatSequence.prototype.every = function (callback) {
        return this.seqs.every(function (s) { return s.every(callback); });
    };
    ConcatSequence.prototype.reduce = function (callback, initial) {
        return this.seqs.reduce(function (acc, s) { return s.reduce(callback, acc); }, initial);
    };
    Object.defineProperty(ConcatSequence.prototype, "length", {
        get: function () {
            return this.seqs.reduce(function (a, b) { return a + b.length; }, 0);
        },
        enumerable: false,
        configurable: true
    });
    return ConcatSequence;
}());
export function concatSeq(seq1, seq2) {
    var seqs = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        seqs[_i - 2] = arguments[_i];
    }
    if (seq2) {
        return new ConcatSequence([seq1, seq2].concat(seqs));
    }
    return new ConcatSequence(seq1);
}
//# sourceMappingURL=interable.js.map