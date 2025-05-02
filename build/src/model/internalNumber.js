import { format } from 'd3-format';
import { similar, boxplotBuilder } from '../internal';
import { FIRST_IS_NAN } from './missing';
/** @internal */
export var DEFAULT_FORMATTER = format('.3n');
/** @internal */
export function compareBoxPlot(col, a, b) {
    var aVal = col.getBoxPlotData(a);
    var bVal = col.getBoxPlotData(b);
    var method = col.getSortMethod();
    if (aVal == null) {
        return bVal == null ? 0 : FIRST_IS_NAN;
    }
    if (bVal == null) {
        return FIRST_IS_NAN * -1;
    }
    return numberCompare(aVal[method], bVal[method]);
}
export function toCompareBoxPlotValue(col, row) {
    var v = col.getBoxPlotData(row);
    var method = col.getSortMethod();
    return v == null ? NaN : v[method];
}
export function getBoxPlotNumber(col, row, mode) {
    var data = mode === 'normalized' ? col.getBoxPlotData(row) : col.getRawBoxPlotData(row);
    if (data == null) {
        return NaN;
    }
    return data[col.getSortMethod()];
}
/**
 * save number comparison
 * @param a
 * @param b
 * @param aMissing
 * @param bMissing
 * @return {number}
 * @internal
 */
export function numberCompare(a, b, aMissing, bMissing) {
    if (aMissing === void 0) { aMissing = false; }
    if (bMissing === void 0) { bMissing = false; }
    aMissing = aMissing || a == null || Number.isNaN(a);
    bMissing = bMissing || b == null || Number.isNaN(b);
    if (aMissing) {
        //NaN are smaller
        return bMissing ? 0 : FIRST_IS_NAN;
    }
    if (bMissing) {
        return FIRST_IS_NAN * -1;
    }
    return a - b;
}
/** @internal */
export function noNumberFilter() {
    return { min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY, filterMissing: false };
}
/** @internal */
export function isEqualNumberFilter(a, b, delta) {
    if (delta === void 0) { delta = 0.001; }
    return similar(a.min, b.min, delta) && similar(a.max, b.max, delta) && a.filterMissing === b.filterMissing;
}
/** @internal */
export function isNumberIncluded(filter, value) {
    if (!filter) {
        return true;
    }
    if (Number.isNaN(value)) {
        return !filter.filterMissing;
    }
    return !((isFinite(filter.min) && value < filter.min) || (isFinite(filter.max) && value > filter.max));
}
/** @internal */
export function isDummyNumberFilter(filter) {
    return !filter.filterMissing && !isFinite(filter.min) && !isFinite(filter.max);
}
/** @internal */
export function restoreNumberFilter(v) {
    return {
        min: v.min != null && isFinite(v.min) ? v.min : Number.NEGATIVE_INFINITY,
        max: v.max != null && isFinite(v.max) ? v.max : Number.POSITIVE_INFINITY,
        filterMissing: v.filterMissing,
    };
}
/** @internal */
export function medianIndex(rows, col) {
    //return the median row
    var data = rows.map(function (r, i) { return ({ r: r, i: i, v: col.getNumber(r) }); });
    var sorted = Array.from(data.filter(function (r) { return !Number.isNaN(r.v); })).sort(function (a, b) { return numberCompare(a.v, b.v); });
    var index = sorted[Math.floor(sorted.length / 2.0)];
    if (index === undefined) {
        return { index: 0, row: sorted[0].r }; //error case
    }
    return { index: index.i, row: index.r };
}
/** @internal */
export function toCompareGroupValue(rows, col, sortMethod, valueCache) {
    var b = boxplotBuilder();
    if (valueCache) {
        b.pushAll(valueCache);
    }
    else {
        b.pushAll(rows.map(function (d) { return col.getNumber(d); }));
    }
    var vs = b.build();
    return vs[sortMethod];
}
//# sourceMappingURL=internalNumber.js.map