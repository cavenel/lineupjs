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
    const base = data[0].length;
    return data.some((d) => d != null && base !== (Array.isArray(d) ? d.length : -1));
}
function isEmpty(v) {
    return (v == null ||
        (Array.isArray(v) && v.length === 0) ||
        (v instanceof Set && v.size === 0) ||
        (v instanceof Map && v.size === 0) ||
        equal({}, v));
}
function isLink(value) {
    const separator = value.indexOf('://');
    if (separator < 0) {
        return false;
    }
    const protocol = value.slice(0, separator);
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
    const formats = Array.isArray(options.datePattern) ? options.datePattern : [options.datePattern];
    for (const format of formats) {
        const dateParse = timeParse(format);
        if (dateParse(value) == null) {
            continue;
        }
        return {
            type: 'date',
            dateParse: format,
        };
    }
    const treatAsCategorical = typeof options.categoricalThreshold === 'function'
        ? options.categoricalThreshold
        : (u, t) => u < t * options.categoricalThreshold;
    if (typeof value === 'string') {
        //maybe a categorical
        const values = all();
        const categories = new Set(values);
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
    const base = {
        type: 'string',
        label,
        column,
    };
    const primitive = deriveBaseType(value, all, column, options);
    if (primitive != null) {
        return Object.assign(base, primitive);
    }
    // set
    if (value instanceof Set) {
        const cats = new Set();
        for (const value of all()) {
            if (!(value instanceof Set)) {
                continue;
            }
            value.forEach((vi) => {
                cats.add(String(vi));
            });
        }
        return Object.assign(base, {
            type: 'set',
            categories: cleanCategories(cats),
        });
    }
    // map
    if (value instanceof Map) {
        const first = Array.from(value.values()).find((d) => !isEmpty(d));
        const mapAll = () => {
            const r = [];
            for (const vi of all()) {
                if (!(vi instanceof Map)) {
                    continue;
                }
                vi.forEach((vii) => {
                    if (!isEmpty(vii)) {
                        r.push(vii);
                    }
                });
            }
            return r;
        };
        const p = deriveBaseType(first, mapAll, column, options);
        return Object.assign(base, p || {}, {
            type: p ? `${p.type}Map` : 'stringMap',
        });
    }
    // array
    if (Array.isArray(value)) {
        const values = all();
        const sameLength = !hasDifferentSizes(values);
        if (sameLength) {
            base.dataLength = value.length;
        }
        const first = value.find((v) => !isEmpty(v));
        const p = deriveBaseType(first, () => concat(values).filter((d) => !isEmpty(d)), column, options);
        if (p && p.type === 'categorical' && !sameLength) {
            return Object.assign(base, p, {
                type: 'set',
            });
        }
        if (p || isEmpty(first)) {
            return Object.assign(base, p || {}, {
                type: p ? `${p.type}s` : 'strings',
            });
        }
        if (typeof first === 'object' && first.key != null && first.value != null) {
            // key,value pair map
            const mapAll = () => {
                const r = [];
                for (const vi of values) {
                    if (!Array.isArray(vi)) {
                        continue;
                    }
                    for (const vii of vi) {
                        if (!isEmpty(vii)) {
                            r.push(vii);
                        }
                    }
                }
                return r;
            };
            const p = deriveBaseType(first.value, mapAll, column, options);
            return Object.assign(base, p || {}, {
                type: p ? `${p.type}Map` : 'stringMap',
            });
        }
    }
    // check boxplot
    const bs = ['min', 'max', 'median', 'q1', 'q3'];
    if (value !== null && typeof value === 'object' && bs.every((b) => typeof value[b] === 'number')) {
        //  boxplot
        const vs = all();
        return Object.assign(base, {
            type: 'boxplot',
            domain: [
                vs.reduce((a, b) => Math.min(a, b.min), Number.POSITIVE_INFINITY),
                vs.reduce((a, b) => Math.max(a, b.max), Number.NEGATIVE_INFINITY),
            ],
        });
    }
    if (value !== null && typeof value === 'object') {
        // object map
        const first = Object.keys(value)
            .map((k) => value[k])
            .filter((d) => !isEmpty(d));
        const mapAll = () => {
            const r = [];
            for (const vi of all()) {
                if (vi == null) {
                    continue;
                }
                Object.keys(vi).forEach((k) => {
                    const vii = vi[k];
                    if (!isEmpty(vii)) {
                        r.push(vii);
                    }
                });
            }
            return r;
        };
        const p = deriveBaseType(first, mapAll, column, options);
        return Object.assign(base, p || {}, {
            type: p ? `${p.type}Map` : 'stringMap',
        });
    }
    console.log('cannot infer type of column:', column);
    //unknown type
    return base;
}
function selectColumns(existing, columns) {
    const allNots = columns.every((d) => d.startsWith('-'));
    if (!allNots) {
        return columns;
    }
    // negate case, exclude columns that are given using -notation
    const exclude = new Set(columns);
    return existing.filter((d) => !exclude.has(`-${d}`));
}
function toLabel(key) {
    if (typeof key === 'number') {
        return `Col ${key + 1}`;
    }
    key = key.trim();
    if (key.length === 0) {
        return 'Unknown';
    }
    return key
        .split(/[\s]+/gm)
        .map((k) => (k.length === 0 ? k : `${k[0].toUpperCase()}${k.slice(1)}`))
        .join(' ');
}
export function deriveColumnDescriptions(data, options = {}) {
    const config = Object.assign({
        categoricalThreshold: (u, n) => u <= MAX_COLORS && u < n * 0.7, //70% unique and less equal to 22 categories
        columns: [],
        datePattern: ['%x', '%Y-%m-%d', '%Y-%m-%dT%H:%M:%S.%LZ'],
    }, options);
    const r = [];
    if (data.length === 0) {
        // no data to derive something from
        return r;
    }
    const first = data[0];
    const columns = Array.isArray(first)
        ? range(first.length)
        : config.columns.length > 0
            ? selectColumns(Object.keys(first), config.columns)
            : Object.keys(first);
    return columns.map((key) => {
        let v = resolveValue(first, key);
        if (isEmpty(v)) {
            // cannot derive something from null try other rows
            const foundRow = data.find((row) => !isEmpty(resolveValue(row, key)));
            v = foundRow ? foundRow[key] : null;
        }
        return deriveType(toLabel(key), v, key, () => data.map((d) => resolveValue(d, key)).filter((d) => !isEmpty(d)), config);
    });
}
/**
 * assigns colors to columns if they are numbers and not yet defined
 * @param columns
 * @returns {IColumnDesc[]}
 */
export function deriveColors(columns) {
    const colors = colorPool();
    columns.forEach((col) => {
        if (isMapAbleColumn(col)) {
            col.colorMapping = col.colorMapping || col.color || colors() || DEFAULT_COLOR;
        }
    });
    return columns;
}
const DEFAULT_EXPORT_OPTIONS = {
    separator: '\t',
    newline: '\n',
    header: true,
    quote: false,
    quoteChar: '"',
    filter: (c) => !isSupportType(c),
    verboseColumnHeaders: false,
};
function createCSVExporter(columns, options) {
    //optionally quote not numbers
    const escape = new RegExp(`[${options.quoteChar}]`, 'g');
    function quote(v, c) {
        const l = String(v);
        if ((options.quote || l.indexOf('\n') >= 0) && (!c || !isNumberColumn(c))) {
            return `${options.quoteChar}${l.replace(escape, options.quoteChar + options.quoteChar)}${options.quoteChar}`;
        }
        return l;
    }
    function addHeader() {
        return columns
            .map((d) => quote(`${d.label}${options.verboseColumnHeaders && d.description ? `\n${d.description}` : ''}`))
            .join(options.separator);
    }
    function addRow(row) {
        return columns.map((c) => quote(c.getExportValue(row, 'text'), c)).join(options.separator);
    }
    return {
        addHeader,
        addRow,
    };
}
/**
 * utility to export a ranking to a table with the given separator
 * @param ranking
 * @param data
 * @param options
 * @returns {Promise<string>}
 */
export function exportRanking(ranking, data, options = {}) {
    const opts = Object.assign({}, DEFAULT_EXPORT_OPTIONS, options);
    const columns = ranking.flatColumns.filter((c) => opts.filter(c));
    const order = ranking.getOrder();
    const exporter = createCSVExporter(columns, opts);
    const r = [];
    if (opts.header) {
        r.push(exporter.addHeader());
    }
    data.forEach((row, i) => {
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
export function exportTable(columnsOrRanking, data, options = {}) {
    const opts = Object.assign({}, DEFAULT_EXPORT_OPTIONS, options);
    const columns = columnsOrRanking instanceof Ranking ? columnsOrRanking.flatColumns.filter((c) => opts.filter(c)) : columnsOrRanking;
    const exporter = createCSVExporter(columns, opts);
    const r = [];
    if (opts.header) {
        r.push(exporter.addHeader());
    }
    data.forEach((row) => {
        r.push(exporter.addRow(row));
    });
    return r.join(opts.newline);
}
/** @internal */
export function map2Object(map) {
    const r = {};
    map.forEach((v, k) => (r[k] = v));
    return r;
}
/** @internal */
export function object2Map(obj) {
    const r = new Map();
    for (const k of Object.keys(obj)) {
        r.set(k, obj[k]);
    }
    return r;
}
/** @internal */
export function rangeSelection(provider, rankingId, dataIndex, relIndex, ctrlKey) {
    const ranking = provider.getRankings().find((d) => d.id === rankingId);
    if (!ranking) {
        // no known reference
        return false;
    }
    const selection = provider.getSelection();
    if (selection.length === 0 || selection.includes(dataIndex)) {
        return false; // no other or deselect
    }
    const order = ranking.getOrder();
    const lookup = new Map(Array.from(order).map((d, i) => [d, i]));
    const distances = selection.map((d) => {
        const index = lookup.has(d) ? lookup.get(d) : Number.POSITIVE_INFINITY;
        return { s: d, index, distance: Math.abs(relIndex - index) };
    });
    const nearest = distances.sort((a, b) => a.distance - b.distance)[0];
    if (!isFinite(nearest.distance)) {
        return false; // all outside
    }
    if (!ctrlKey) {
        selection.splice(0, selection.length);
        selection.push(nearest.s);
    }
    if (nearest.index < relIndex) {
        for (let i = nearest.index + 1; i <= relIndex; ++i) {
            selection.push(order[i]);
        }
    }
    else {
        for (let i = relIndex; i <= nearest.index; ++i) {
            selection.push(order[i]);
        }
    }
    provider.setSelection(selection);
    return true;
}
export function isPromiseLike(promiseLike) {
    return promiseLike != null && typeof promiseLike.then === 'function';
}
