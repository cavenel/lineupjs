import { Ranking, isNumberColumn, Column, isSupportType, isMapAbleColumn, DEFAULT_COLOR, } from '../model';
import { colorPool, MAX_COLORS } from '../model/internal';
import { concat, equal, extent, range, resolveValue } from '../internal';
import { timeParse } from 'd3-time-format';
/**
 * @internal
 */
export function cleanCategories(categories) {
    // remove missing values
    categories.delete(null);
    categories.delete(undefined);
    categories.delete('');
    categories.delete('NA');
    categories.delete('NaN');
    categories.delete('na');
    return Array.from(categories).map(String).sort();
}
function hasDifferentSizes(data) {
    if (data.length === 0) {
        return false;
    }
    var base = data[0].length;
    return data.some(function (d) { return d != null && base !== (Array.isArray(d) ? d.length : -1); });
}
function isEmpty(v) {
    return (v == null ||
        (Array.isArray(v) && v.length === 0) ||
        (v instanceof Set && v.size === 0) ||
        (v instanceof Map && v.size === 0) ||
        equal({}, v));
}
function isLink(value) {
    var separator = value.indexOf('://');
    if (separator < 0) {
        return false;
    }
    var protocol = value.slice(0, separator);
    return ['http', 'https', 'ftp'].includes(protocol);
}
function deriveBaseType(value, all, column, options) {
    if (value == null) {
        console.warn('cannot derive from null value for column: ', column);
        return null;
    }
    // primitive
    if (typeof value === 'number') {
        return {
            type: 'number',
            domain: extent(all()),
        };
    }
    if (typeof value === 'boolean') {
        return {
            type: 'boolean',
        };
    }
    if (value instanceof Date) {
        return {
            type: 'date',
        };
    }
    if ((typeof value === 'object' && value.alt != null && value.href != null) ||
        (typeof value === 'string' && isLink(value))) {
        return {
            type: 'link',
        };
    }
    var formats = Array.isArray(options.datePattern) ? options.datePattern : [options.datePattern];
    for (var _i = 0, formats_1 = formats; _i < formats_1.length; _i++) {
        var format = formats_1[_i];
        var dateParse = timeParse(format);
        if (dateParse(value) == null) {
            continue;
        }
        return {
            type: 'date',
            dateParse: format,
        };
    }
    var treatAsCategorical = typeof options.categoricalThreshold === 'function'
        ? options.categoricalThreshold
        : function (u, t) { return u < t * options.categoricalThreshold; };
    if (typeof value === 'string') {
        //maybe a categorical
        var values = all();
        var categories = new Set(values);
        if (treatAsCategorical(categories.size, values.length)) {
            return {
                type: 'categorical',
                categories: cleanCategories(categories),
            };
        }
        return {
            type: 'string',
        };
    }
    return null;
}
function deriveType(label, value, column, all, options) {
    var base = {
        type: 'string',
        label: label,
        column: column,
    };
    var primitive = deriveBaseType(value, all, column, options);
    if (primitive != null) {
        return Object.assign(base, primitive);
    }
    // set
    if (value instanceof Set) {
        var cats_1 = new Set();
        for (var _i = 0, _a = all(); _i < _a.length; _i++) {
            var value_1 = _a[_i];
            if (!(value_1 instanceof Set)) {
                continue;
            }
            value_1.forEach(function (vi) {
                cats_1.add(String(vi));
            });
        }
        return Object.assign(base, {
            type: 'set',
            categories: cleanCategories(cats_1),
        });
    }
    // map
    if (value instanceof Map) {
        var first = Array.from(value.values()).find(function (d) { return !isEmpty(d); });
        var mapAll = function () {
            var r = [];
            for (var _i = 0, _a = all(); _i < _a.length; _i++) {
                var vi = _a[_i];
                if (!(vi instanceof Map)) {
                    continue;
                }
                vi.forEach(function (vii) {
                    if (!isEmpty(vii)) {
                        r.push(vii);
                    }
                });
            }
            return r;
        };
        var p = deriveBaseType(first, mapAll, column, options);
        return Object.assign(base, p || {}, {
            type: p ? "".concat(p.type, "Map") : 'stringMap',
        });
    }
    // array
    if (Array.isArray(value)) {
        var values_1 = all();
        var sameLength = !hasDifferentSizes(values_1);
        if (sameLength) {
            base.dataLength = value.length;
        }
        var first = value.find(function (v) { return !isEmpty(v); });
        var p = deriveBaseType(first, function () { return concat(values_1).filter(function (d) { return !isEmpty(d); }); }, column, options);
        if (p && p.type === 'categorical' && !sameLength) {
            return Object.assign(base, p, {
                type: 'set',
            });
        }
        if (p || isEmpty(first)) {
            return Object.assign(base, p || {}, {
                type: p ? "".concat(p.type, "s") : 'strings',
            });
        }
        if (typeof first === 'object' && first.key != null && first.value != null) {
            // key,value pair map
            var mapAll = function () {
                var r = [];
                for (var _i = 0, values_2 = values_1; _i < values_2.length; _i++) {
                    var vi = values_2[_i];
                    if (!Array.isArray(vi)) {
                        continue;
                    }
                    for (var _a = 0, vi_1 = vi; _a < vi_1.length; _a++) {
                        var vii = vi_1[_a];
                        if (!isEmpty(vii)) {
                            r.push(vii);
                        }
                    }
                }
                return r;
            };
            var p_1 = deriveBaseType(first.value, mapAll, column, options);
            return Object.assign(base, p_1 || {}, {
                type: p_1 ? "".concat(p_1.type, "Map") : 'stringMap',
            });
        }
    }
    // check boxplot
    var bs = ['min', 'max', 'median', 'q1', 'q3'];
    if (value !== null && typeof value === 'object' && bs.every(function (b) { return typeof value[b] === 'number'; })) {
        //  boxplot
        var vs = all();
        return Object.assign(base, {
            type: 'boxplot',
            domain: [
                vs.reduce(function (a, b) { return Math.min(a, b.min); }, Number.POSITIVE_INFINITY),
                vs.reduce(function (a, b) { return Math.max(a, b.max); }, Number.NEGATIVE_INFINITY),
            ],
        });
    }
    if (value !== null && typeof value === 'object') {
        // object map
        var first = Object.keys(value)
            .map(function (k) { return value[k]; })
            .filter(function (d) { return !isEmpty(d); });
        var mapAll = function () {
            var r = [];
            var _loop_1 = function (vi) {
                if (vi == null) {
                    return "continue";
                }
                Object.keys(vi).forEach(function (k) {
                    var vii = vi[k];
                    if (!isEmpty(vii)) {
                        r.push(vii);
                    }
                });
            };
            for (var _i = 0, _a = all(); _i < _a.length; _i++) {
                var vi = _a[_i];
                _loop_1(vi);
            }
            return r;
        };
        var p = deriveBaseType(first, mapAll, column, options);
        return Object.assign(base, p || {}, {
            type: p ? "".concat(p.type, "Map") : 'stringMap',
        });
    }
    console.log('cannot infer type of column:', column);
    //unknown type
    return base;
}
function selectColumns(existing, columns) {
    var allNots = columns.every(function (d) { return d.startsWith('-'); });
    if (!allNots) {
        return columns;
    }
    // negate case, exclude columns that are given using -notation
    var exclude = new Set(columns);
    return existing.filter(function (d) { return !exclude.has("-".concat(d)); });
}
function toLabel(key) {
    if (typeof key === 'number') {
        return "Col ".concat(key + 1);
    }
    key = key.trim();
    if (key.length === 0) {
        return 'Unknown';
    }
    return key
        .split(/[\s]+/gm)
        .map(function (k) { return (k.length === 0 ? k : "".concat(k[0].toUpperCase()).concat(k.slice(1))); })
        .join(' ');
}
export function deriveColumnDescriptions(data, options) {
    if (options === void 0) { options = {}; }
    var config = Object.assign({
        categoricalThreshold: function (u, n) { return u <= MAX_COLORS && u < n * 0.7; }, //70% unique and less equal to 22 categories
        columns: [],
        datePattern: ['%x', '%Y-%m-%d', '%Y-%m-%dT%H:%M:%S.%LZ'],
    }, options);
    var r = [];
    if (data.length === 0) {
        // no data to derive something from
        return r;
    }
    var first = data[0];
    var columns = Array.isArray(first)
        ? range(first.length)
        : config.columns.length > 0
            ? selectColumns(Object.keys(first), config.columns)
            : Object.keys(first);
    return columns.map(function (key) {
        var v = resolveValue(first, key);
        if (isEmpty(v)) {
            // cannot derive something from null try other rows
            var foundRow = data.find(function (row) { return !isEmpty(resolveValue(row, key)); });
            v = foundRow ? foundRow[key] : null;
        }
        return deriveType(toLabel(key), v, key, function () { return data.map(function (d) { return resolveValue(d, key); }).filter(function (d) { return !isEmpty(d); }); }, config);
    });
}
/**
 * assigns colors to columns if they are numbers and not yet defined
 * @param columns
 * @returns {IColumnDesc[]}
 */
export function deriveColors(columns) {
    var colors = colorPool();
    columns.forEach(function (col) {
        if (isMapAbleColumn(col)) {
            col.colorMapping = col.colorMapping || col.color || colors() || DEFAULT_COLOR;
        }
    });
    return columns;
}
var DEFAULT_EXPORT_OPTIONS = {
    separator: '\t',
    newline: '\n',
    header: true,
    quote: false,
    quoteChar: '"',
    filter: function (c) { return !isSupportType(c); },
    verboseColumnHeaders: false,
};
function createCSVExporter(columns, options) {
    //optionally quote not numbers
    var escape = new RegExp("[".concat(options.quoteChar, "]"), 'g');
    function quote(v, c) {
        var l = String(v);
        if ((options.quote || l.indexOf('\n') >= 0) && (!c || !isNumberColumn(c))) {
            return "".concat(options.quoteChar).concat(l.replace(escape, options.quoteChar + options.quoteChar)).concat(options.quoteChar);
        }
        return l;
    }
    function addHeader() {
        return columns
            .map(function (d) { return quote("".concat(d.label).concat(options.verboseColumnHeaders && d.description ? "\n".concat(d.description) : '')); })
            .join(options.separator);
    }
    function addRow(row) {
        return columns.map(function (c) { return quote(c.getExportValue(row, 'text'), c); }).join(options.separator);
    }
    return {
        addHeader: addHeader,
        addRow: addRow,
    };
}
/**
 * utility to export a ranking to a table with the given separator
 * @param ranking
 * @param data
 * @param options
 * @returns {Promise<string>}
 */
export function exportRanking(ranking, data, options) {
    if (options === void 0) { options = {}; }
    var opts = Object.assign({}, DEFAULT_EXPORT_OPTIONS, options);
    var columns = ranking.flatColumns.filter(function (c) { return opts.filter(c); });
    var order = ranking.getOrder();
    var exporter = createCSVExporter(columns, opts);
    var r = [];
    if (opts.header) {
        r.push(exporter.addHeader());
    }
    data.forEach(function (row, i) {
        r.push(exporter.addRow({ v: row, i: order[i] }));
    });
    return r.join(opts.newline);
}
/**
 * export table helper
 * @param columnsOrRanking
 * @param data
 * @param options
 * @returns {string}
 */
export function exportTable(columnsOrRanking, data, options) {
    if (options === void 0) { options = {}; }
    var opts = Object.assign({}, DEFAULT_EXPORT_OPTIONS, options);
    var columns = columnsOrRanking instanceof Ranking ? columnsOrRanking.flatColumns.filter(function (c) { return opts.filter(c); }) : columnsOrRanking;
    var exporter = createCSVExporter(columns, opts);
    var r = [];
    if (opts.header) {
        r.push(exporter.addHeader());
    }
    data.forEach(function (row) {
        r.push(exporter.addRow(row));
    });
    return r.join(opts.newline);
}
/** @internal */
export function map2Object(map) {
    var r = {};
    map.forEach(function (v, k) { return (r[k] = v); });
    return r;
}
/** @internal */
export function object2Map(obj) {
    var r = new Map();
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var k = _a[_i];
        r.set(k, obj[k]);
    }
    return r;
}
/** @internal */
export function rangeSelection(provider, rankingId, dataIndex, relIndex, ctrlKey) {
    var ranking = provider.getRankings().find(function (d) { return d.id === rankingId; });
    if (!ranking) {
        // no known reference
        return false;
    }
    var selection = provider.getSelection();
    if (selection.length === 0 || selection.includes(dataIndex)) {
        return false; // no other or deselect
    }
    var order = ranking.getOrder();
    var lookup = new Map(Array.from(order).map(function (d, i) { return [d, i]; }));
    var distances = selection.map(function (d) {
        var index = lookup.has(d) ? lookup.get(d) : Number.POSITIVE_INFINITY;
        return { s: d, index: index, distance: Math.abs(relIndex - index) };
    });
    var nearest = distances.sort(function (a, b) { return a.distance - b.distance; })[0];
    if (!isFinite(nearest.distance)) {
        return false; // all outside
    }
    if (!ctrlKey) {
        selection.splice(0, selection.length);
        selection.push(nearest.s);
    }
    if (nearest.index < relIndex) {
        for (var i = nearest.index + 1; i <= relIndex; ++i) {
            selection.push(order[i]);
        }
    }
    else {
        for (var i = relIndex; i <= nearest.index; ++i) {
            selection.push(order[i]);
        }
    }
    provider.setSelection(selection);
    return true;
}
export function isPromiseLike(promiseLike) {
    return promiseLike != null && typeof promiseLike.then === 'function';
}
//# sourceMappingURL=utils.js.map