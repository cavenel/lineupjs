var _a;
/**
 * a set that preserves the insertion order
 * @internal
 */
var OrderedSet = /** @class */ (function () {
    function OrderedSet(values) {
        if (values === void 0) { values = []; }
        this[_a] = Symbol('OrderedSet');
        this.set = new Set();
        this.list = [];
        this.addAll(Array.isArray(values) ? values : Array.from(values));
    }
    Object.defineProperty(OrderedSet.prototype, "size", {
        get: function () {
            return this.set.size;
        },
        enumerable: false,
        configurable: true
    });
    OrderedSet.prototype.clear = function () {
        this.set.clear();
        this.list.splice(0, this.list.length);
    };
    OrderedSet.prototype.addAll = function (values) {
        var _this = this;
        values.forEach(function (v) { return _this.add(v); });
        return this;
    };
    OrderedSet.prototype.add = function (value) {
        if (this.set.has(value)) {
            return this;
        }
        this.set.add(value);
        this.list.push(value);
        return this;
    };
    OrderedSet.prototype.has = function (value) {
        return this.set.has(value);
    };
    OrderedSet.prototype.delete = function (value) {
        var r = this.set.delete(value);
        if (!r) {
            return false;
        }
        var index = this.list.indexOf(value);
        console.assert(index >= 0);
        this.list.splice(index, 1);
        return true;
    };
    OrderedSet.prototype.deleteAll = function (values) {
        var _this = this;
        return values.reduce(function (acc, act) { return _this.delete(act) && acc; }, true);
    };
    OrderedSet.prototype.forEach = function (callbackfn, thisArg) {
        this.list.forEach(function (v) {
            callbackfn.call(this, v, v, this);
        }, thisArg);
    };
    OrderedSet.prototype[(_a = Symbol.toStringTag, Symbol.iterator)] = function () {
        return this.list[Symbol.iterator]();
    };
    return OrderedSet;
}());
export default OrderedSet;
//# sourceMappingURL=OrderedSet.js.map