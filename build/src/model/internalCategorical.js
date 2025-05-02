import { isSeqEmpty, empty } from '../internal';
import { colorPool } from './internal';
import { DEFAULT_COLOR } from './Column';
import { FIRST_IS_MISSING } from './missing';
/** @internal */
export function toCategory(cat, value, nextColor) {
    if (nextColor === void 0) { nextColor = function () { return DEFAULT_COLOR; }; }
    if (typeof cat === 'string') {
        //just the category value
        return { name: cat, label: cat, color: nextColor(), value: value };
    }
    var name = cat.name == null ? String(cat.value) : cat.name;
    return {
        name: name,
        label: cat.label || name,
        color: cat.color || nextColor(),
        value: cat.value != null ? cat.value : value,
    };
}
/** @internal */
export function toCompareCategoryValue(v) {
    if (v == null) {
        return NaN;
    }
    return v.value;
}
function findMostFrequent(rows, valueCache) {
    var hist = new Map();
    if (valueCache) {
        valueCache.forEach(function (cat) {
            hist.set(cat, (hist.get(cat) || 0) + 1);
        });
    }
    else {
        rows.forEach(function (cat) {
            hist.set(cat, (hist.get(cat) || 0) + 1);
        });
    }
    if (hist.size === 0) {
        return {
            cat: null,
            count: 0,
        };
    }
    var topCat = null;
    var topCount = 0;
    hist.forEach(function (count, cat) {
        if (count > topCount) {
            topCat = cat;
            topCount = count;
        }
    });
    return {
        cat: topCat,
        count: topCount,
    };
}
/** @internal */
export function toMostFrequentCategoricals(rows, col) {
    if (isSeqEmpty(rows)) {
        return empty(col.dataLength);
    }
    var maps = empty(col.dataLength).map(function () { return new Map(); });
    rows.forEach(function (row) {
        var vs = col.getCategories(row);
        if (!vs) {
            return;
        }
        for (var i = 0; i < maps.length; ++i) {
            var hist = maps[i];
            var cat = vs[i] || null;
            hist.set(cat, (hist.get(cat) || 0) + 1);
        }
    });
    return maps.map(function (hist) {
        if (hist.size === 0) {
            return null;
        }
        var topCat = null;
        var topCount = 0;
        hist.forEach(function (count, cat) {
            if (count > topCount) {
                topCat = cat;
                topCount = count;
            }
        });
        return topCat;
    });
}
/** @internal */
export function toGroupCompareCategoryValue(rows, col, valueCache) {
    if (isSeqEmpty(rows)) {
        return [NaN, null];
    }
    var mostFrequent = findMostFrequent(rows.map(function (d) { return col.getCategory(d); }), valueCache);
    if (mostFrequent.cat == null) {
        return [NaN, null];
    }
    return [mostFrequent.cat.value, mostFrequent.cat.name.toLowerCase()];
}
/** @internal */
export function compareCategory(a, b) {
    var aNull = a == null || Number.isNaN(a.value);
    var bNull = b == null || Number.isNaN(b.value);
    if (aNull || a == null) {
        return bNull ? 0 : FIRST_IS_MISSING;
    }
    if (bNull || b == null) {
        return -FIRST_IS_MISSING;
    }
    if (a.value === b.value) {
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
    }
    return a.value - b.value;
}
export function toCategories(desc) {
    if (!desc.categories) {
        return [];
    }
    var nextColor = colorPool();
    var l = desc.categories.length - 1;
    var cats = desc.categories.map(function (cat, i) { return toCategory(cat, i / l, nextColor); });
    return cats.sort(compareCategory);
}
/** @internal */
function isEmptyFilter(f) {
    return f == null || (!f.filterMissing && (f.filter == null || f.filter === ''));
}
/** @internal */
export function isEqualCategoricalFilter(a, b) {
    if (a === b) {
        return true;
    }
    if (a == null || b == null) {
        return isEmptyFilter(a) === isEmptyFilter(b);
    }
    if (a.filterMissing !== b.filterMissing ||
        typeof a.filter !== typeof b.filter ||
        Array.isArray(a.filter) !== Array.isArray(b.filter)) {
        return false;
    }
    if (Array.isArray(a.filter)) {
        return arrayEquals(a.filter, b.filter);
    }
    return String(a.filter) === String(b.filter);
}
/** @internal */
export function isEqualSetCategoricalFilter(a, b) {
    if (!isEqualCategoricalFilter(a, b)) {
        return false;
    }
    var am = a && a.mode ? a.mode : 'every';
    var bm = b && b.mode ? b.mode : 'every';
    return am === bm;
}
function arrayEquals(a, b) {
    var al = a != null ? a.length : 0;
    var bl = b != null ? b.length : 0;
    if (al !== bl) {
        return false;
    }
    if (al === 0) {
        return true;
    }
    return a.every(function (ai, i) { return ai === b[i]; });
}
/** @internal */
export function isCategoryIncluded(filter, category) {
    if (filter == null) {
        return true;
    }
    if (category == null || Number.isNaN(category.value)) {
        return !filter.filterMissing;
    }
    var filterObj = filter.filter;
    if (Array.isArray(filterObj)) {
        //array mode
        return filterObj.includes(category.name);
    }
    if (typeof filterObj === 'string' && filterObj.length > 0) {
        //search mode
        return category.name.toLowerCase().includes(filterObj.toLowerCase());
    }
    if (filterObj instanceof RegExp) {
        //regex match mode
        return filterObj.test(category.name);
    }
    return true;
}
//# sourceMappingURL=internalCategorical.js.map