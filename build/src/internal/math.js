import { isIndicesAble } from './interable';
import { createWorkerCodeBlob, toFunctionBody } from './worker';
/**
 * computes the optimal number of bins for a given array length
 * @internal
 * @param {number} length
 * @returns {number}
 */
export function getNumberOfBins(length) {
    if (length === 0) {
        return 1;
    }
    // as by default used in d3 the Sturges' formula
    return Math.ceil(Math.log(length) / Math.LN2) + 1;
}
export function min(values, acc) {
    var min = Number.POSITIVE_INFINITY;
    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
        var d = values_1[_i];
        var v = acc ? acc(d) : d;
        if (v < min) {
            min = v;
        }
    }
    return min;
}
export function max(values, acc) {
    var max = Number.NEGATIVE_INFINITY;
    for (var _i = 0, values_2 = values; _i < values_2.length; _i++) {
        var d = values_2[_i];
        var v = acc ? acc(d) : d;
        if (v > max) {
            max = v;
        }
    }
    return max;
}
export function extent(values, acc) {
    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;
    for (var _i = 0, values_3 = values; _i < values_3.length; _i++) {
        var d = values_3[_i];
        var v = acc ? acc(d) : d;
        if (v < min) {
            min = v;
        }
        if (v > max) {
            max = v;
        }
    }
    return [min, max];
}
/**
 * @internal
 */
export function range(length) {
    var r = new Array(length);
    for (var i = 0; i < length; ++i) {
        r[i] = i;
    }
    return r;
}
/**
 * an empty range
 * @internal
 */
export function empty(length) {
    var r = new Array(length);
    r.fill(null);
    return r;
}
/**
 * computes the X quantile assumes the values are sorted
 * @internal
 */
export function quantile(values, quantile, length) {
    if (length === void 0) { length = values.length; }
    if (length === 0) {
        return NaN;
    }
    var target = (length - 1) * quantile;
    var index = Math.floor(target);
    if (index === target) {
        return values[index];
    }
    var v = values[index];
    var vAfter = values[index + 1];
    return v + (vAfter - v) * (target - index); // shift by change
}
export function median(values, acc) {
    var arr = acc ? values.map(acc) : values.slice();
    arr.sort(function (a, b) { return (a < b ? -1 : a > b ? 1 : 0); });
    return quantile(arr, 0.5);
}
function pushAll(push) {
    return function (vs) {
        if (!isIndicesAble(vs)) {
            vs.forEach(push);
            return;
        }
        for (var j = 0; j < vs.length; ++j) {
            push(vs[j]);
        }
    };
}
// See <http://en.wikipedia.org/wiki/Kernel_(statistics)>.
function gaussian(u) {
    var GAUSSIAN_CONST = Math.sqrt(2 * Math.PI);
    return Math.exp(-0.5 * u * u) / GAUSSIAN_CONST;
}
function toSampleVariance(variance, len) {
    return (variance * len) / (len - 1);
}
/**
 *
 * The ["normal reference distribution"
 * rule-of-thumb](https://stat.ethz.ch/R-manual/R-devel/library/MASS/html/bandwidth.nrd.html),
 * a commonly used version of [Silverman's
 * rule-of-thumb](https://en.wikipedia.org/wiki/Kernel_density_estimation#A_rule-of-thumb_bandwidth_estimator).
 */
function nrd(iqr, variance, len) {
    var s = Math.sqrt(toSampleVariance(variance, len));
    if (typeof iqr === 'number') {
        s = Math.min(s, iqr / 1.34);
    }
    return 1.06 * s * Math.pow(len, -0.2);
}
function computeVariance(s, len, mean) {
    var variance = 0;
    for (var i = 0; i < len; i++) {
        var v = s[i];
        variance += (v - mean) * (v - mean);
    }
    variance /= len;
    return variance;
}
function computeKDE(s, len, points, min, max, variance, iqr) {
    var bandwidth = nrd(iqr, variance, len);
    var computePoint = function (x) {
        var i = 0;
        var sum = 0;
        for (i = 0; i < len; i++) {
            var v = s[i];
            sum += gaussian((x - v) / bandwidth);
        }
        return sum / bandwidth / len;
    };
    var step = (max - min) / (points - 1);
    return Array.from({ length: points }, function (_, i) {
        var v = i === points - 1 ? max : min + i * step;
        return {
            v: v,
            p: computePoint(v),
        };
    });
}
/**
 * @internal
 */
export function boxplotBuilder(fixedLength, kdePoints) {
    var min = Number.POSITIVE_INFINITY;
    var max = Number.NEGATIVE_INFINITY;
    var sum = 0;
    var length = 0;
    var missing = 0;
    var kdePointCount = kdePoints !== null && kdePoints !== void 0 ? kdePoints : 100;
    // if fixed size use the typed array else a regular array
    var values = [];
    var vs = fixedLength != null ? new Float64Array(fixedLength) : null;
    var push = function (v) {
        length += 1;
        if (v == null || Number.isNaN(v)) {
            missing += 1;
            return;
        }
        if (v < min) {
            min = v;
        }
        if (v > max) {
            max = v;
        }
        sum += v;
    };
    var pushAndSave = function (v) {
        push(v);
        if (vs) {
            vs[length] = v;
        }
        else {
            values.push(v);
        }
    };
    var invalid = {
        min: NaN,
        max: NaN,
        mean: NaN,
        missing: missing,
        count: length,
        whiskerHigh: NaN,
        whiskerLow: NaN,
        outlier: [],
        median: NaN,
        q1: NaN,
        q3: NaN,
        kdePoints: [],
    };
    var buildImpl = function (s) {
        var valid = length - missing;
        var median = quantile(s, 0.5, valid);
        var q1 = quantile(s, 0.25, valid);
        var q3 = quantile(s, 0.75, valid);
        var iqr = q3 - q1;
        var left = q1 - 1.5 * iqr;
        var right = q3 + 1.5 * iqr;
        var mean = sum / valid;
        var variance = computeVariance(s, valid, mean);
        var outlier = [];
        // look for the closest value which is bigger than the computed left
        var whiskerLow = left;
        for (var i = 0; i < valid; ++i) {
            var v = s[i];
            if (left < v) {
                whiskerLow = v;
                break;
            }
            // outlier
            outlier.push(v);
        }
        // look for the closest value which is smaller than the computed right
        var whiskerHigh = right;
        var reversedOutliers = [];
        for (var i = valid - 1; i >= 0; --i) {
            var v = s[i];
            if (v < right) {
                whiskerHigh = v;
                break;
            }
            // outlier
            reversedOutliers.push(v);
        }
        outlier = outlier.concat(reversedOutliers.reverse());
        var kdePoints = computeKDE(s, valid, kdePointCount, min, max, variance, iqr);
        return {
            min: min,
            max: max,
            count: length,
            missing: missing,
            mean: sum / valid,
            whiskerHigh: whiskerHigh,
            whiskerLow: whiskerLow,
            outlier: outlier,
            median: median,
            q1: q1,
            q3: q3,
            kdePoints: kdePoints,
        };
    };
    var build = function () {
        var valid = length - missing;
        if (valid === 0) {
            return invalid;
        }
        var s = vs ? vs.sort() : Float64Array.from(values).sort();
        return buildImpl(s);
    };
    var buildArr = function (vs) {
        var s = vs.slice().sort();
        for (var j = 0; j < vs.length; ++j) {
            push(vs[j]);
        }
        // missing are the last
        return buildImpl(s);
    };
    return {
        push: pushAndSave,
        build: build,
        buildArr: buildArr,
        pushAll: pushAll(pushAndSave),
    };
}
/**
 * @internal
 */
export function numberStatsBuilder(domain, numberOfBins) {
    var hist = [];
    var x0 = domain[0];
    var range = domain[1] - domain[0];
    var binWidth = range / numberOfBins;
    for (var i = 0; i < numberOfBins; ++i, x0 += binWidth) {
        hist.push({
            x0: x0,
            x1: x0 + binWidth,
            count: 0,
        });
    }
    var bin1 = domain[0] + binWidth;
    var binN = domain[1] - binWidth;
    var toBin = function (v) {
        if (v < bin1) {
            return 0;
        }
        if (v >= binN) {
            return numberOfBins - 1;
        }
        if (numberOfBins === 3) {
            return 1;
        }
        var low = 1;
        var high = numberOfBins - 1;
        // binary search
        while (low < high) {
            var center = Math.floor((high + low) / 2);
            if (v < hist[center].x1) {
                high = center;
            }
            else {
                low = center + 1;
            }
        }
        return low;
    };
    // filter out NaN
    var min = Number.POSITIVE_INFINITY;
    var max = Number.NEGATIVE_INFINITY;
    var sum = 0;
    var length = 0;
    var missing = 0;
    var push = function (v) {
        length += 1;
        if (v == null || Number.isNaN(v)) {
            missing += 1;
            return;
        }
        if (v < min) {
            min = v;
        }
        if (v > max) {
            max = v;
        }
        sum += v;
        hist[toBin(v)].count++;
    };
    var build = function () {
        var valid = length - missing;
        if (valid === 0) {
            return {
                count: missing,
                missing: missing,
                min: NaN,
                max: NaN,
                mean: NaN,
                hist: hist,
                maxBin: 0,
            };
        }
        return {
            count: length,
            min: min,
            max: max,
            mean: sum / valid,
            missing: missing,
            hist: hist,
            maxBin: hist.reduce(function (a, b) { return Math.max(a, b.count); }, 0),
        };
    };
    return { push: push, build: build, pushAll: pushAll(push) };
}
/**
 * guesses the histogram granularity to use based on min and max date
 */
function computeGranularity(min, max) {
    if (min == null || max == null) {
        return { histGranularity: 'year', hist: [] };
    }
    var hist = [];
    if (max.getFullYear() - min.getFullYear() >= 2) {
        // more than two years difference
        var minYear = min.getFullYear();
        var maxYear = max.getFullYear();
        for (var i = minYear; i <= maxYear; ++i) {
            hist.push({
                x0: new Date(i, 0, 1),
                x1: new Date(i + 1, 0, 1),
                count: 0,
            });
        }
        return { hist: hist, histGranularity: 'year' };
    }
    if (max.getTime() - min.getTime() <= 1000 * 60 * 60 * 24 * 31) {
        // less than a month use day
        var x0_1 = new Date(min.getFullYear(), min.getMonth(), min.getDate());
        while (x0_1 <= max) {
            var x1 = new Date(x0_1);
            x1.setDate(x1.getDate() + 1);
            hist.push({
                x0: x0_1,
                x1: x1,
                count: 0,
            });
            x0_1 = x1;
        }
        return { hist: hist, histGranularity: 'day' };
    }
    // by month
    var x0 = new Date(min.getFullYear(), min.getMonth(), 1);
    while (x0 <= max) {
        var x1 = new Date(x0);
        x1.setMonth(x1.getMonth() + 1);
        hist.push({
            x0: x0,
            x1: x1,
            count: 0,
        });
        x0 = x1;
    }
    return { hist: hist, histGranularity: 'month' };
}
function pushDateHist(hist, v, count) {
    if (count === void 0) { count = 1; }
    if (v < hist[0].x1) {
        hist[0].count += count;
        return;
    }
    var l = hist.length - 1;
    if (v > hist[l].x0) {
        hist[l].count += count;
        return;
    }
    if (l === 2) {
        hist[1].count += count;
        return;
    }
    var low = 1;
    var high = l;
    // binary search
    while (low < high) {
        var center = Math.floor((high + low) / 2);
        if (v < hist[center].x1) {
            high = center;
        }
        else {
            low = center + 1;
        }
    }
    hist[low].count += count;
}
/**
 * @internal
 */
export function dateStatsBuilder(template) {
    var min = null;
    var max = null;
    var count = 0;
    var missing = 0;
    // yyyymmdd, count
    var byDay = new Map();
    var templateHist = template ? template.hist.map(function (d) { return ({ x0: d.x0, x1: d.x1, count: 0 }); }) : null;
    var push = function (v) {
        count += 1;
        if (!v || v == null) {
            missing += 1;
            return;
        }
        if (min == null || v < min) {
            min = v;
        }
        if (max == null || v > max) {
            max = v;
        }
        if (templateHist) {
            pushDateHist(templateHist, v, 1);
            return;
        }
        var key = v.getFullYear() * 10000 + v.getMonth() * 100 + v.getDate();
        if (byDay.has(key)) {
            byDay.get(key).count++;
        }
        else {
            byDay.set(key, { count: 1, x: v });
        }
    };
    var build = function () {
        if (templateHist) {
            return {
                min: min,
                max: max,
                missing: missing,
                count: count,
                maxBin: templateHist.reduce(function (acc, h) { return Math.max(acc, h.count); }, 0),
                hist: templateHist,
                histGranularity: template.histGranularity,
            };
        }
        // copy template else derive
        var _a = computeGranularity(min, max), histGranularity = _a.histGranularity, hist = _a.hist;
        byDay.forEach(function (v) { return pushDateHist(hist, v.x, v.count); });
        return {
            min: min,
            max: max,
            missing: missing,
            count: count,
            maxBin: hist.reduce(function (acc, h) { return Math.max(acc, h.count); }, 0),
            hist: hist,
            histGranularity: histGranularity,
        };
    };
    return { push: push, build: build, pushAll: pushAll(push) };
}
/**
 * computes a categorical histogram
 * @param arr the data array
 * @param categories the list of known categories
 * @returns {{hist: {cat: string, y: number}[]}}
 * @internal
 */
export function categoricalStatsBuilder(categories) {
    var m = new Map();
    categories.forEach(function (cat) { return m.set(cat.name, { cat: cat.name, count: 0 }); });
    var missing = 0;
    var count = 0;
    var push = function (v) {
        count += 1;
        if (v == null) {
            missing += 1;
        }
        else {
            var entry = m.get(v.name);
            if (entry) {
                entry.count++;
            }
            else {
                m.set(v.name, { cat: v.name, count: 1 });
            }
        }
    };
    var build = function () {
        var entries = categories.map(function (d) { return m.get(d.name); });
        var maxBin = entries.reduce(function (a, b) { return Math.max(a, b.count); }, Number.NEGATIVE_INFINITY);
        return {
            maxBin: maxBin,
            hist: entries,
            count: count,
            missing: missing,
        };
    };
    return { push: push, build: build, pushAll: pushAll(push) };
}
/**
 * computes a string statistics
 * @internal
 */
export function stringStatsBuilder(topN) {
    var missing = 0;
    var count = 0;
    var m = new Map();
    if (Array.isArray(topN)) {
        for (var _i = 0, topN_1 = topN; _i < topN_1.length; _i++) {
            var t = topN_1[_i];
            m.set(t, { value: t, count: 0 });
        }
    }
    var push = function (v) {
        count += 1;
        if (v == null) {
            missing += 1;
        }
        else {
            var entry = m.get(v);
            if (entry) {
                entry.count++;
            }
            else {
                m.set(v, { value: v, count: 1 });
            }
        }
    };
    var build = function () {
        var byFrequency = Array.isArray(topN)
            ? topN.map(function (d) { return m.get(d); })
            : Array.from(m.values()).sort(function (a, b) {
                if (a.count === b.count) {
                    return a.value.localeCompare(b.value);
                }
                return b.count - a.count;
            });
        return {
            count: count,
            missing: missing,
            topN: byFrequency.slice(0, Math.min(byFrequency.length, Array.isArray(topN) ? topN.length : topN)),
            unique: m.size,
        };
    };
    return { push: push, build: build, pushAll: pushAll(push) };
}
/**
 * round to the given commas similar to d3.round
 * @param {number} v
 * @param {number} precision
 * @returns {number}
 * @internal
 */
export function round(v, precision) {
    if (precision === void 0) { precision = 0; }
    if (precision === 0) {
        return Math.round(v);
    }
    var scale = Math.pow(10, precision);
    return Math.round(v * scale) / scale;
}
/**
 * compares two number whether they are similar up to delta
 * @param {number} a first number
 * @param {number} b second number
 * @param {number} delta
 * @returns {boolean} a and b are similar
 * @internal
 */
export function similar(a, b, delta) {
    if (delta === void 0) { delta = 0.5; }
    if (a === b) {
        return true;
    }
    return Math.abs(a - b) < delta;
}
/**
 * @internal
 */
export function isPromiseLike(value) {
    return value instanceof Promise || typeof value.then === 'function';
}
/**
 * @internal
 */
export function createIndexArray(length, dataSize) {
    if (dataSize === void 0) { dataSize = length; }
    if (dataSize <= 255) {
        return new Uint8Array(length);
    }
    if (dataSize <= 65535) {
        return new Uint16Array(length);
    }
    return new Uint32Array(length);
}
/**
 * @internal
 */
export function toIndexArray(arr, maxDataIndex) {
    if (arr instanceof Uint8Array || arr instanceof Uint16Array || arr instanceof Uint32Array) {
        return arr.slice();
    }
    var l = maxDataIndex != null ? maxDataIndex : arr.length;
    if (l <= 255) {
        return Uint8Array.from(arr);
    }
    if (l <= 65535) {
        return Uint16Array.from(arr);
    }
    return Uint32Array.from(arr);
}
function createLike(template, total, maxDataIndex) {
    if (template instanceof Uint8Array) {
        return new Uint8Array(total);
    }
    if (template instanceof Uint16Array) {
        return new Uint16Array(total);
    }
    if (template instanceof Uint32Array) {
        return new Uint32Array(total);
    }
    return createIndexArray(total, maxDataIndex);
}
/**
 * @internal
 */
export function joinIndexArrays(groups, maxDataIndex) {
    switch (groups.length) {
        case 0:
            return [];
        case 1:
            return groups[0];
        default: {
            var total = groups.reduce(function (a, b) { return a + b.length; }, 0);
            var r = createLike(groups[0], total, maxDataIndex);
            var shift = 0;
            for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
                var g = groups_1[_i];
                r.set(g, shift);
                shift += g.length;
            }
            return r;
        }
    }
}
function asc(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
function desc(a, b) {
    return a < b ? 1 : a > b ? -1 : 0;
}
/**
 * sort the given index array based on the lookup array
 * @internal
 */
export function sortComplex(indices, comparators) {
    if (indices.length < 2) {
        return indices;
    }
    switch (comparators.length) {
        case 0:
            // sort by indices
            return indices.sort();
        case 1: {
            var c_1 = comparators[0].asc ? asc : desc;
            var cLookup_1 = comparators[0].lookup;
            return indices.sort(function (a, b) {
                var r = c_1(cLookup_1[a], cLookup_1[b]);
                return r !== 0 ? r : a - b;
            });
        }
        case 2: {
            var c1_1 = comparators[0].asc ? asc : desc;
            var c1Lookup_1 = comparators[0].lookup;
            var c2_1 = comparators[1].asc ? asc : desc;
            var c2Lookup_1 = comparators[1].lookup;
            return indices.sort(function (a, b) {
                var r = c1_1(c1Lookup_1[a], c1Lookup_1[b]);
                r = r !== 0 ? r : c2_1(c2Lookup_1[a], c2Lookup_1[b]);
                return r !== 0 ? r : a - b;
            });
        }
        default: {
            var l_1 = comparators.length;
            var fs_1 = comparators.map(function (d) { return (d.asc ? asc : desc); });
            return indices.sort(function (a, b) {
                for (var i = 0; i < l_1; ++i) {
                    var l_2 = comparators[i].lookup;
                    var r = fs_1[i](l_2[a], l_2[b]);
                    if (r !== 0) {
                        return r;
                    }
                }
                return a - b;
            });
        }
    }
}
/**
 * helper to build a value cache for dates, use dateValueCache2Value to convert back
 * @internal
 */
export function dateValueCacheBuilder(length) {
    var vs = new Float64Array(length);
    var i = 0;
    return {
        push: function (d) { return (vs[i++] = d == null ? NaN : d.getTime()); },
        cache: vs,
    };
}
/**
 * @internal
 */
export function dateValueCache2Value(v) {
    return Number.isNaN(v) ? null : new Date(v);
}
/**
 * @internal
 */
export function categoricalValueCacheBuilder(length, categories) {
    var vs = createIndexArray(length, categories.length + 1);
    var name2index = new Map();
    for (var i_1 = 0; i_1 < categories.length; ++i_1) {
        name2index.set(categories[i_1].name, i_1 + 1); // shift by one for missing = 0
    }
    var i = 0;
    return {
        push: function (d) { return (vs[i++] = d == null ? 0 : name2index.get(d.name) || 0); },
        cache: vs,
    };
}
/**
 * @internal
 */
export function categoricalValueCache2Value(v, categories) {
    return v === 0 ? null : categories[v - 1];
}
function sortWorkerMain() {
    var workerSelf = self;
    // stored refs to avoid duplicate copy
    var refs = new Map();
    var sort = function (r) {
        if (r.sortOrders) {
            sortComplex(r.indices, r.sortOrders);
        }
        var order = r.indices;
        workerSelf.postMessage({
            type: r.type,
            uid: r.uid,
            ref: r.ref,
            order: order,
        }, [r.indices.buffer]);
    };
    var setRef = function (r) {
        if (r.data) {
            refs.set(r.ref, r.data);
        }
        else {
            refs.delete(r.ref);
        }
    };
    var deleteRef = function (r) {
        if (!r.startsWith) {
            refs.delete(r.ref);
            return;
        }
        for (var _i = 0, _a = Array.from(refs.keys()); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key.startsWith(r.ref)) {
                refs.delete(key);
            }
        }
    };
    var resolveRefs = function (r) {
        // resolve refs or save the new data
        var data = r.data ? r.data : refs.get(r.refData);
        var indices = r.indices ? r.indices : r.refIndices ? refs.get(r.refIndices) : undefined;
        if (r.refData) {
            refs.set(r.refData, data);
        }
        if (r.refIndices) {
            refs.set(r.refIndices, indices);
        }
        return { data: data, indices: indices };
    };
    var dateStats = function (r) {
        var _a = resolveRefs(r), data = _a.data, indices = _a.indices;
        var b = dateStatsBuilder(r.template);
        if (indices) {
            for (var ii = 0; ii < indices.length; ++ii) {
                var v = data[indices[ii]];
                b.push(dateValueCache2Value(v));
            }
        }
        else {
            for (var i = 0; i < data.length; ++i) {
                b.push(dateValueCache2Value(data[i]));
            }
        }
        workerSelf.postMessage({
            type: r.type,
            uid: r.uid,
            stats: b.build(),
        });
    };
    var categoricalStats = function (r) {
        var _a = resolveRefs(r), data = _a.data, indices = _a.indices;
        var cats = r.categories.map(function (name) { return ({ name: name }); });
        var b = categoricalStatsBuilder(cats);
        if (indices) {
            for (var ii = 0; ii < indices.length; ++ii) {
                b.push(categoricalValueCache2Value(data[indices[ii]], cats));
            }
        }
        else {
            for (var i = 0; i < data.length; ++i) {
                b.push(categoricalValueCache2Value(data[i], cats));
            }
        }
        workerSelf.postMessage({
            type: r.type,
            uid: r.uid,
            stats: b.build(),
        });
    };
    var stringStats = function (r) {
        var _a;
        var _b = resolveRefs(r), data = _b.data, indices = _b.indices;
        var b = stringStatsBuilder((_a = r.topN) !== null && _a !== void 0 ? _a : 10);
        if (indices) {
            for (var ii = 0; ii < indices.length; ++ii) {
                b.push(data[indices[ii]]);
            }
        }
        else {
            for (var i = 0; i < data.length; ++i) {
                b.push(data[i]);
            }
        }
        workerSelf.postMessage({
            type: r.type,
            uid: r.uid,
            stats: b.build(),
        });
    };
    var numberStats = function (r) {
        var _a;
        var _b = resolveRefs(r), data = _b.data, indices = _b.indices;
        var b = numberStatsBuilder((_a = r.domain) !== null && _a !== void 0 ? _a : [0, 1], r.numberOfBins);
        if (indices) {
            for (var ii = 0; ii < indices.length; ++ii) {
                b.push(data[indices[ii]]);
            }
        }
        else {
            for (var i = 0; i < data.length; ++i) {
                b.push(data[i]);
            }
        }
        workerSelf.postMessage({
            type: r.type,
            uid: r.uid,
            stats: b.build(),
        });
    };
    var boxplotStats = function (r) {
        var _a = resolveRefs(r), data = _a.data, indices = _a.indices;
        var b = boxplotBuilder(indices ? indices.length : undefined);
        var stats;
        if (!indices) {
            stats = b.buildArr(data);
        }
        else {
            for (var ii = 0; ii < indices.length; ++ii) {
                b.push(data[indices[ii]]);
            }
            stats = b.build();
        }
        workerSelf.postMessage({
            type: r.type,
            uid: r.uid,
            stats: stats,
        });
    };
    // message type to handler function
    var msgHandlers = {
        sort: sort,
        setRef: setRef,
        deleteRef: deleteRef,
        dateStats: dateStats,
        categoricalStats: categoricalStats,
        numberStats: numberStats,
        boxplotStats: boxplotStats,
        stringStats: stringStats,
    };
    workerSelf.addEventListener('message', function (evt) {
        var r = evt.data;
        if (typeof r.uid !== 'number' || typeof r.type !== 'string') {
            return;
        }
        var h = msgHandlers[r.type];
        if (h) {
            h(r);
        }
    });
}
/**
 * copy source code of a worker and create a blob out of it
 * to avoid webpack imports all the code functions need to be in this file
 * @internal
 */
export function createWorkerBlob() {
    return createWorkerCodeBlob([
        pushAll.toString(),
        quantile.toString(),
        numberStatsBuilder.toString(),
        boxplotBuilder.toString(),
        pushDateHist.toString(),
        dateStatsBuilder.toString(),
        categoricalStatsBuilder.toString(),
        stringStatsBuilder.toString(),
        createIndexArray.toString(),
        asc.toString(),
        desc.toString(),
        sortComplex.toString(),
        dateValueCache2Value.toString(),
        categoricalValueCache2Value.toString(),
        computeVariance.toString(),
        toSampleVariance.toString(),
        nrd.toString(),
        gaussian.toString(),
        computeKDE.toString(),
        toFunctionBody(sortWorkerMain),
    ]);
}
//# sourceMappingURL=math.js.map