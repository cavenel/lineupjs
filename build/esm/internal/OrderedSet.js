var _a;
/**
 * a set that preserves the insertion order
 * @internal
 */
export default class OrderedSet {
    constructor(values = []) {
        this[_a] = Symbol('OrderedSet');
        this.set = new Set();
        this.list = [];
        this.addAll(Array.isArray(values) ? values : Array.from(values));
    }
    get size() {
        return this.set.size;
    }
    clear() {
        this.set.clear();
        this.list.splice(0, this.list.length);
    }
    addAll(values) {
        values.forEach((v) => this.add(v));
        return this;
    }
    add(value) {
        if (this.set.has(value)) {
            return this;
        }
        this.set.add(value);
        this.list.push(value);
        return this;
    }
    has(value) {
        return this.set.has(value);
    }
    delete(value) {
        const r = this.set.delete(value);
        if (!r) {
            return false;
        }
        const index = this.list.indexOf(value);
        console.assert(index >= 0);
        this.list.splice(index, 1);
        return true;
    }
    deleteAll(values) {
        return values.reduce((acc, act) => this.delete(act) && acc, true);
    }
    forEach(callbackfn, thisArg) {
        this.list.forEach(function (v) {
            callbackfn.call(this, v, v, this);
        }, thisArg);
    }
    [(_a = Symbol.toStringTag, Symbol.iterator)]() {
        return this.list[Symbol.iterator]();
    }
}
