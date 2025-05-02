import { createIndexArray } from '../internal';
import { FIRST_IS_MISSING, FIRST_IS_NAN, ECompareValueType, Column, Ranking, } from '../model';
var missingUInt8 = FIRST_IS_MISSING > 0 ? 255 : 0;
var missingBinary = missingUInt8;
var missingUInt16 = FIRST_IS_MISSING > 0 ? 65535 : 0; // max or 0
var missingUInt32 = FIRST_IS_MISSING > 0 ? 4294967295 : 0; // max or 0
var missingInt8 = FIRST_IS_MISSING > 0 ? 127 : -128; // max or min
var missingInt16 = FIRST_IS_MISSING > 0 ? 32767 : -32768; // max or min
var missingInt32 = FIRST_IS_MISSING > 0 ? 2147483647 : -2147483648; // max or min
var missingFloat = FIRST_IS_NAN > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
var missingFloatAsc = FIRST_IS_MISSING > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
var missingString = FIRST_IS_MISSING > 0 ? '\uffff' : '\u0000'; // first or last character
function chooseMissingByLength(length) {
    if (length <= 255) {
        return missingBinary;
    }
    if (length <= 65535) {
        return missingUInt16;
    }
    return missingUInt32;
}
function toCompareLookUp(rawLength, type) {
    switch (type) {
        case ECompareValueType.COUNT:
            return createIndexArray(rawLength + 1);
        case ECompareValueType.BINARY:
        case ECompareValueType.UINT8:
            return new Uint8Array(rawLength);
        case ECompareValueType.UINT16:
            return new Uint16Array(rawLength);
        case ECompareValueType.UINT32:
            return new Uint32Array(rawLength);
        case ECompareValueType.INT8:
            return new Int8Array(rawLength);
        case ECompareValueType.INT16:
            return new Int16Array(rawLength);
        case ECompareValueType.INT32:
            return new Int32Array(rawLength);
        case ECompareValueType.STRING:
            return [];
        case ECompareValueType.FLOAT_ASC:
        case ECompareValueType.FLOAT:
            return new Float64Array(rawLength);
        case ECompareValueType.DOUBLE_ASC:
        case ECompareValueType.DOUBLE:
            return new Float64Array(rawLength);
    }
}
function createSetter(type, lookup, missingCount) {
    switch (type) {
        case ECompareValueType.BINARY: // just 0 or 1 -> convert to 0=Number.NEGATIVE_INFINITY 1 2 255=Number.POSITIVE_INFINITY
            return function (index, v) { return (lookup[index] = v == null || Number.isNaN(v) ? missingBinary : v + 1); };
        case ECompareValueType.COUNT: // uint32
            return function (index, v) { return (lookup[index] = v == null || Number.isNaN(v) ? missingCount : v + 1); };
        case ECompareValueType.UINT8: // shift by one to have 0 for -Inf
            return function (index, v) { return (lookup[index] = v == null || Number.isNaN(v) ? missingInt8 : v + 1); };
        case ECompareValueType.UINT16: // shift by one to have 0 for -Inf
            return function (index, v) { return (lookup[index] = v == null || Number.isNaN(v) ? missingInt16 : v + 1); };
        case ECompareValueType.UINT32: // shift by one to have 0 for -Inf
            return function (index, v) { return (lookup[index] = v == null || Number.isNaN(v) ? missingInt32 : v + 1); };
        case ECompareValueType.INT8:
            return function (index, v) { return (lookup[index] = v == null || Number.isNaN(v) ? missingInt8 : v); };
        case ECompareValueType.INT16:
            return function (index, v) { return (lookup[index] = v == null || Number.isNaN(v) ? missingInt16 : v); };
        case ECompareValueType.INT32:
            return function (index, v) { return (lookup[index] = v == null || Number.isNaN(v) ? missingInt32 : v); };
        case ECompareValueType.STRING:
            return function (index, v) { return (lookup[index] = v == null || v === '' ? missingString : v); };
        case ECompareValueType.FLOAT:
        case ECompareValueType.DOUBLE:
            return function (index, v) { return (lookup[index] = v == null || Number.isNaN(v) ? missingFloat : v); };
        case ECompareValueType.FLOAT_ASC:
        case ECompareValueType.DOUBLE_ASC:
            return function (index, v) { return (lookup[index] = v == null || Number.isNaN(v) ? missingFloatAsc : v); };
    }
}
var CompareLookup = /** @class */ (function () {
    function CompareLookup(rawLength, isSorting, ranking, valueCaches) {
        this.criteria = [];
        this.data = [];
        var missingCount = chooseMissingByLength(rawLength + 1); // + 1 for the value shift to have 0 as start
        for (var _i = 0, _a = isSorting ? ranking.getSortCriteria() : ranking.getGroupSortCriteria(); _i < _a.length; _i++) {
            var c = _a[_i];
            var v = isSorting ? c.col.toCompareValueType() : c.col.toCompareGroupValueType();
            var valueCache = valueCaches ? valueCaches(c.col) : undefined;
            this.criteria.push({ col: c.col, valueCache: valueCache });
            if (!Array.isArray(v)) {
                var lookup = toCompareLookUp(rawLength, v);
                this.data.push({ asc: c.asc, v: v, lookup: lookup, setter: createSetter(v, lookup, missingCount) });
                continue;
            }
            for (var _b = 0, v_1 = v; _b < v_1.length; _b++) {
                var vi = v_1[_b];
                var lookup = toCompareLookUp(rawLength, vi);
                this.data.push({ asc: c.asc, v: vi, lookup: lookup, setter: createSetter(vi, lookup, missingCount) });
            }
        }
        if (isSorting) {
            return;
        }
        {
            var v = ECompareValueType.STRING;
            var lookup = toCompareLookUp(rawLength, v);
            this.data.push({ asc: true, v: v, lookup: lookup, setter: createSetter(v, lookup, missingCount) });
        }
    }
    Object.defineProperty(CompareLookup.prototype, "sortOrders", {
        get: function () {
            return this.data.map(function (d) { return ({ asc: d.asc, lookup: d.lookup }); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CompareLookup.prototype, "transferAbles", {
        get: function () {
            // so a typed array
            return this.data
                .map(function (d) { return d.lookup; })
                .filter(function (d) { return !Array.isArray(d); })
                .map(function (d) { return d.buffer; });
        },
        enumerable: false,
        configurable: true
    });
    CompareLookup.prototype.push = function (row) {
        var i = 0;
        for (var _i = 0, _a = this.criteria; _i < _a.length; _i++) {
            var c = _a[_i];
            var r = c.col.toCompareValue(row, c.valueCache ? c.valueCache(row.i) : undefined);
            if (!Array.isArray(r)) {
                this.data[i++].setter(row.i, r);
                continue;
            }
            for (var _b = 0, r_1 = r; _b < r_1.length; _b++) {
                var ri = r_1[_b];
                this.data[i++].setter(row.i, ri);
            }
        }
    };
    CompareLookup.prototype.pushValues = function (dataIndex, vs) {
        for (var i = 0; i < vs.length; ++i) {
            this.data[i].setter(dataIndex, vs[i]);
        }
    };
    CompareLookup.prototype.free = function () {
        // free up to save memory
        this.data.splice(0, this.data.length);
    };
    return CompareLookup;
}());
export { CompareLookup };
//# sourceMappingURL=sort.js.map