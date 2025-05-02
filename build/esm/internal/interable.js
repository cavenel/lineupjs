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
    return seq.every(() => false); // more efficient than counting length
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
class LazyFilter {
    constructor(it, filters) {
        this.it = it;
        this.filters = filters;
        this._length = -1;
    }
    get length() {
        // cached
        if (this._length >= 0) {
            return this._length;
        }
        let l = 0;
        this.forEach(() => l++);
        this._length = l;
        return l;
    }
    filter(callback) {
        // propagate filter
        return new LazyFilter(this.it, this.filters.concat(callback));
    }
    map(callback) {
        // create lazy map out of myself
        return new LazyMap1(this, callback);
    }
    forEach(callback) {
        if (isIndicesAble(this.it)) {
            // fast array version
            outer: for (let i = 0; i < this.it.length; ++i) {
                const v = this.it[i];
                for (const f of this.filters) {
                    if (!f(v, i)) {
                        continue outer;
                    }
                }
                callback(v, i);
            }
            return;
        }
        // iterator version
        let valid = 0;
        const it = this.it[Symbol.iterator]();
        let v = it.next();
        let i = 0;
        outer: while (!v.done) {
            for (const f of this.filters) {
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
    }
    [Symbol.iterator]() {
        const it = this.it[Symbol.iterator]();
        const next = () => {
            let v = it.next();
            let i = -1;
            outer: while (!v.done) {
                i++;
                for (const f of this.filters) {
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
        return { next };
    }
    some(callback) {
        if (isIndicesAble(this.it)) {
            // fast array version
            outer: for (let i = 0; i < this.it.length; ++i) {
                const v = this.it[i];
                for (const f of this.filters) {
                    if (!f(v, i)) {
                        continue outer;
                    }
                }
                if (callback(v, i)) {
                    return true;
                }
            }
            return false;
        }
        let valid = 0;
        const it = this.it[Symbol.iterator]();
        let v = it.next();
        let i = 0;
        outer: while (!v.done) {
            for (const f of this.filters) {
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
    }
    every(callback) {
        if (isIndicesAble(this.it)) {
            // fast array version
            outer: for (let i = 0; i < this.it.length; ++i) {
                const v = this.it[i];
                for (const f of this.filters) {
                    if (!f(v, i)) {
                        continue outer;
                    }
                }
                if (!callback(v, i)) {
                    return false;
                }
            }
            return true;
        }
        let valid = 0;
        const it = this.it[Symbol.iterator]();
        let v = it.next();
        let i = 0;
        outer: while (!v.done) {
            for (const f of this.filters) {
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
    }
    reduce(callback, initial) {
        if (isIndicesAble(this.it)) {
            // fast array version
            let acc = initial;
            let j = 0;
            outer: for (let i = 0; i < this.it.length; ++i) {
                const v = this.it[i];
                for (const f of this.filters) {
                    if (!f(v, i)) {
                        continue outer;
                    }
                }
                acc = callback(acc, v, j++);
            }
            return acc;
        }
        let valid = 0;
        const it = this.it[Symbol.iterator]();
        let v = it.next();
        let i = 0;
        let r = initial;
        outer: while (!v.done) {
            for (const f of this.filters) {
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
    }
}
/**
 * lazy mapping operation
 */
class ALazyMap {
    constructor(it) {
        this.it = it;
    }
    get length() {
        return this.it.length;
    }
    filter(callback) {
        return new LazyFilter(this, [callback]);
    }
    forEach(callback) {
        if (isIndicesAble(this.it)) {
            for (let i = 0; i < this.it.length; ++i) {
                callback(this.mapV(this.it[i], i), i);
            }
            return;
        }
        const it = this.it[Symbol.iterator]();
        for (let v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            callback(this.mapV(v.value, i), i);
        }
    }
    [Symbol.iterator]() {
        const it = this.it[Symbol.iterator]();
        let i = 0;
        const next = () => {
            const v = it.next();
            if (v.done) {
                return {
                    value: undefined,
                    done: true,
                };
            }
            const value = this.mapV(v.value, i);
            i++;
            return {
                value,
                done: false,
            };
        };
        return { next };
    }
    some(callback) {
        if (isIndicesAble(this.it)) {
            for (let i = 0; i < this.it.length; ++i) {
                if (callback(this.mapV(this.it[i], i), i)) {
                    return true;
                }
            }
            return false;
        }
        const it = this.it[Symbol.iterator]();
        for (let v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            if (callback(this.mapV(v.value, i), i)) {
                return true;
            }
        }
        return false;
    }
    every(callback) {
        if (isIndicesAble(this.it)) {
            for (let i = 0; i < this.it.length; ++i) {
                if (!callback(this.mapV(this.it[i], i), i)) {
                    return false;
                }
            }
            return true;
        }
        const it = this.it[Symbol.iterator]();
        for (let v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            if (!callback(this.mapV(v.value, i), i)) {
                return false;
            }
        }
        return true;
    }
    reduce(callback, initial) {
        if (isIndicesAble(this.it)) {
            let acc = initial;
            for (let i = 0; i < this.it.length; ++i) {
                acc = callback(acc, this.mapV(this.it[i], i), i);
            }
            return acc;
        }
        const it = this.it[Symbol.iterator]();
        let acc = initial;
        for (let v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            acc = callback(acc, this.mapV(v.value, i), i);
        }
        return acc;
    }
}
class LazyMap1 extends ALazyMap {
    constructor(it, map12) {
        super(it);
        this.map12 = map12;
    }
    mapV(v, i) {
        return this.map12(v, i);
    }
    map(callback) {
        return new LazyMap2(this.it, this.map12, callback);
    }
}
class LazyMap2 extends ALazyMap {
    constructor(it, map12, map23) {
        super(it);
        this.map12 = map12;
        this.map23 = map23;
    }
    map(callback) {
        return new LazyMap3(this.it, this.map12, this.map23, callback);
    }
    mapV(v, i) {
        return this.map23(this.map12(v, i), i);
    }
}
class LazyMap3 extends ALazyMap {
    constructor(it, map12, map23, map34) {
        super(it);
        this.map12 = map12;
        this.map23 = map23;
        this.map34 = map34;
    }
    map(callback) {
        const map1U = (v, i) => callback(this.map34(this.map23(this.map12(v, i), i), i), i);
        return new LazyMap1(this.it, map1U);
    }
    mapV(v, i) {
        return this.map34(this.map23(this.map12(v, i), i), i);
    }
}
class LazySeq {
    constructor(iterable) {
        this.iterable = iterable;
        this._arr = null;
    }
    get arr() {
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
    }
    [Symbol.iterator]() {
        return this.iterable[Symbol.iterator]();
    }
    filter(callback) {
        return new LazyFilter(this.arr, [callback]);
    }
    map(callback) {
        return new LazyMap1(this.arr, callback);
    }
    forEach(callback) {
        if (isIndicesAble(this.iterable)) {
            for (let i = 0; i < this.iterable.length; ++i) {
                callback(this.iterable[i], i);
            }
            return;
        }
        const it = this[Symbol.iterator]();
        for (let v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            callback(v.value, i);
        }
    }
    some(callback) {
        if (isIndicesAble(this.iterable)) {
            for (let i = 0; i < this.iterable.length; ++i) {
                if (callback(this.iterable[i], i)) {
                    return true;
                }
            }
            return false;
        }
        const it = this[Symbol.iterator]();
        for (let v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            if (callback(v.value, i)) {
                return true;
            }
        }
        return false;
    }
    every(callback) {
        if (isIndicesAble(this.iterable)) {
            for (let i = 0; i < this.iterable.length; ++i) {
                if (!callback(this.iterable[i], i)) {
                    return false;
                }
            }
            return true;
        }
        const it = this[Symbol.iterator]();
        for (let v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            if (!callback(v.value, i)) {
                return false;
            }
        }
        return true;
    }
    reduce(callback, initial) {
        if (isIndicesAble(this.iterable)) {
            let acc = initial;
            for (let i = 0; i < this.iterable.length; ++i) {
                acc = callback(acc, this.iterable[i], i);
            }
            return acc;
        }
        const it = this[Symbol.iterator]();
        let acc = initial;
        for (let v = it.next(), i = 0; !v.done; v = it.next(), i++) {
            acc = callback(acc, v.value, i);
        }
        return acc;
    }
    get length() {
        const it = this.iterable;
        if (isIndicesAble(it)) {
            return it.length;
        }
        if (it instanceof Set || it instanceof Map) {
            return it.size;
        }
        return this.arr.length;
    }
}
/**
 * @internal
 */
export function lazySeq(iterable) {
    return new LazySeq(iterable);
}
class ConcatSequence {
    constructor(seqs) {
        this.seqs = seqs;
        //
    }
    [Symbol.iterator]() {
        const seqs = Array.from(this.seqs);
        let it = seqs.shift()[Symbol.iterator]();
        const next = () => {
            const v = it.next();
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
        return { next };
    }
    filter(callback) {
        return new LazyFilter(this, [callback]);
    }
    map(callback) {
        return new LazyMap1(this, callback);
    }
    forEach(callback) {
        this.seqs.forEach((s) => s.forEach(callback));
    }
    some(callback) {
        return this.seqs.some((s) => s.some(callback));
    }
    every(callback) {
        return this.seqs.every((s) => s.every(callback));
    }
    reduce(callback, initial) {
        return this.seqs.reduce((acc, s) => s.reduce(callback, acc), initial);
    }
    get length() {
        return this.seqs.reduce((a, b) => a + b.length, 0);
    }
}
export function concatSeq(seq1, seq2, ...seqs) {
    if (seq2) {
        return new ConcatSequence([seq1, seq2].concat(seqs));
    }
    return new ConcatSequence(seq1);
}
