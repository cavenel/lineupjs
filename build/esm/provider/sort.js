import { createIndexArray } from '../internal';
import { FIRST_IS_MISSING, FIRST_IS_NAN, ECompareValueType, Column, Ranking, } from '../model';
const missingUInt8 = FIRST_IS_MISSING > 0 ? 255 : 0;
const missingBinary = missingUInt8;
const missingUInt16 = FIRST_IS_MISSING > 0 ? 65535 : 0; // max or 0
const missingUInt32 = FIRST_IS_MISSING > 0 ? 4294967295 : 0; // max or 0
const missingInt8 = FIRST_IS_MISSING > 0 ? 127 : -128; // max or min
const missingInt16 = FIRST_IS_MISSING > 0 ? 32767 : -32768; // max or min
const missingInt32 = FIRST_IS_MISSING > 0 ? 2147483647 : -2147483648; // max or min
const missingFloat = FIRST_IS_NAN > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
const missingFloatAsc = FIRST_IS_MISSING > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
const missingString = FIRST_IS_MISSING > 0 ? '\uffff' : '\u0000'; // first or last character
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
            return (index, v) => (lookup[index] = v == null || Number.isNaN(v) ? missingBinary : v + 1);
        case ECompareValueType.COUNT: // uint32
            return (index, v) => (lookup[index] = v == null || Number.isNaN(v) ? missingCount : v + 1);
        case ECompareValueType.UINT8: // shift by one to have 0 for -Inf
            return (index, v) => (lookup[index] = v == null || Number.isNaN(v) ? missingInt8 : v + 1);
        case ECompareValueType.UINT16: // shift by one to have 0 for -Inf
            return (index, v) => (lookup[index] = v == null || Number.isNaN(v) ? missingInt16 : v + 1);
        case ECompareValueType.UINT32: // shift by one to have 0 for -Inf
            return (index, v) => (lookup[index] = v == null || Number.isNaN(v) ? missingInt32 : v + 1);
        case ECompareValueType.INT8:
            return (index, v) => (lookup[index] = v == null || Number.isNaN(v) ? missingInt8 : v);
        case ECompareValueType.INT16:
            return (index, v) => (lookup[index] = v == null || Number.isNaN(v) ? missingInt16 : v);
        case ECompareValueType.INT32:
            return (index, v) => (lookup[index] = v == null || Number.isNaN(v) ? missingInt32 : v);
        case ECompareValueType.STRING:
            return (index, v) => (lookup[index] = v == null || v === '' ? missingString : v);
        case ECompareValueType.FLOAT:
        case ECompareValueType.DOUBLE:
            return (index, v) => (lookup[index] = v == null || Number.isNaN(v) ? missingFloat : v);
        case ECompareValueType.FLOAT_ASC:
        case ECompareValueType.DOUBLE_ASC:
            return (index, v) => (lookup[index] = v == null || Number.isNaN(v) ? missingFloatAsc : v);
    }
}
export class CompareLookup {
    constructor(rawLength, isSorting, ranking, valueCaches) {
        this.criteria = [];
        this.data = [];
        const missingCount = chooseMissingByLength(rawLength + 1); // + 1 for the value shift to have 0 as start
        for (const c of isSorting ? ranking.getSortCriteria() : ranking.getGroupSortCriteria()) {
            const v = isSorting ? c.col.toCompareValueType() : c.col.toCompareGroupValueType();
            const valueCache = valueCaches ? valueCaches(c.col) : undefined;
            this.criteria.push({ col: c.col, valueCache });
            if (!Array.isArray(v)) {
                const lookup = toCompareLookUp(rawLength, v);
                this.data.push({ asc: c.asc, v, lookup, setter: createSetter(v, lookup, missingCount) });
                continue;
            }
            for (const vi of v) {
                const lookup = toCompareLookUp(rawLength, vi);
                this.data.push({ asc: c.asc, v: vi, lookup, setter: createSetter(vi, lookup, missingCount) });
            }
        }
        if (isSorting) {
            return;
        }
        {
            const v = ECompareValueType.STRING;
            const lookup = toCompareLookUp(rawLength, v);
            this.data.push({ asc: true, v, lookup, setter: createSetter(v, lookup, missingCount) });
        }
    }
    get sortOrders() {
        return this.data.map((d) => ({ asc: d.asc, lookup: d.lookup }));
    }
    get transferAbles() {
        // so a typed array
        return this.data
            .map((d) => d.lookup)
            .filter((d) => !Array.isArray(d))
            .map((d) => d.buffer);
    }
    push(row) {
        let i = 0;
        for (const c of this.criteria) {
            const r = c.col.toCompareValue(row, c.valueCache ? c.valueCache(row.i) : undefined);
            if (!Array.isArray(r)) {
                this.data[i++].setter(row.i, r);
                continue;
            }
            for (const ri of r) {
                this.data[i++].setter(row.i, ri);
            }
        }
    }
    pushValues(dataIndex, vs) {
        for (let i = 0; i < vs.length; ++i) {
            this.data[i].setter(dataIndex, vs[i]);
        }
    }
    free() {
        // free up to save memory
        this.data.splice(0, this.data.length);
    }
}
