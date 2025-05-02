var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ScriptColumn_1;
import NumberColumn from './NumberColumn';
import { SortByDefault, toolbar } from './annotations';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged, } from './Column';
import CompositeNumberColumn, {} from './CompositeNumberColumn';
import { isDummyNumberFilter, noNumberFilter, restoreNumberFilter } from './internalNumber';
import { isNumberColumn, } from './INumberColumn';
import { restoreMapping } from './MappingFunction';
import { integrateDefaults } from './internal';
const DEFAULT_SCRIPT = `let s = 0;
col.forEach((c) => s += c.v);
return s / col.length`;
/**
 * factory for creating a description creating a mean column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createScriptDesc(label = 'script') {
    return { type: 'script', label, script: DEFAULT_SCRIPT };
}
function wrapWithContext(code) {
    let clean = code.trim();
    if (!clean.includes('return')) {
        clean = `return (${clean});`;
    }
    return `
  const max = function(arr) { return Math.max.apply(Math, arr); };
  const min = function(arr) { return Math.min.apply(Math, arr); };
  const extent = function(arr) { return [min(arr), max(arr)]; };
  const clamp = function(v, minValue, maxValue) { return v < minValue ? minValue : (v > maxValue ? maxValue : v); };
  const normalize = function(v, minMax, max) {
    if (Array.isArray(minMax)) {
      minMax = minMax[0];
      max = minMax[1];
    }
    return (v - minMax) / (max - minMax);
  };
  const denormalize = function(v, minMax, max) {
    if (Array.isArray(minMax)) {
      minMax = minMax[0];
      max = minMax[1];
    }
    return v * (max - minMax) + minMax;
  };
  const linear = function(v, source, target) {
    target = target || [0, 1];
    return denormalize(normalize(v, source), target);
  };
  const v = (function custom() {
    ${clean}
  })();

  return typeof v === 'number' ? v : NaN`;
}
/**
 * wrapper class for simpler column accessing
 */
class ColumnWrapper {
    constructor(c, v, raw) {
        this.c = c;
        this.v = v;
        this.raw = raw;
    }
    get type() {
        return this.c.desc.type;
    }
    get name() {
        return this.c.getMetaData().label;
    }
    get id() {
        return this.c.id;
    }
}
class LazyColumnWrapper {
    constructor(c, row) {
        this.c = c;
        this.row = row;
    }
    get type() {
        return this.c.desc.type;
    }
    get name() {
        return this.c.getMetaData().label;
    }
    get id() {
        return this.c.id;
    }
    get v() {
        return this.c.getValue(this.row);
    }
    get raw() {
        return isNumberColumn(this.c) ? this.c.getRawNumber(this.row) : null;
    }
}
/**
 * helper context for accessing columns within a scripted columns
 */
class ColumnContext {
    constructor(children, allFactory) {
        this.children = children;
        this.allFactory = allFactory;
        this.lookup = new Map();
        this._all = null;
        children.forEach((c) => {
            this.lookup.set(`ID@${c.id}`, c);
            this.lookup.set(`ID@${c.id.toLowerCase()}`, c);
            this.lookup.set(`NAME@${c.name}`, c);
            this.lookup.set(`NAME@${c.name.toLowerCase()}`, c);
        });
    }
    /**
     * get a column by name
     * @param {string} name
     * @return {IColumnWrapper}
     */
    byName(name) {
        return this.lookup.get(`NAME@${name}`);
    }
    /**
     * get a column by id
     * @param {string} id
     * @return {IColumnWrapper}
     */
    byID(id) {
        return this.lookup.get(`ID@${id}`);
    }
    /**
     * get a column by index
     * @param {number} index
     * @return {IColumnWrapper}
     */
    byIndex(index) {
        return this.children[index];
    }
    forEach(callback) {
        return this.children.forEach(callback);
    }
    /**
     * number of columns
     * @return {number}
     */
    get length() {
        return this.children.length;
    }
    /**
     * get the all context, i.e one with all columns of this ranking
     * @return {ColumnContext}
     */
    get all() {
        if (this._all == null) {
            this._all = this.allFactory ? this.allFactory() : null;
        }
        return this._all;
    }
}
/**
 * column combiner which uses a custom JavaScript function to combined the values
 * The script itself can be any valid JavaScript code. It will be embedded in a function.
 * Therefore the last statement has to return a value.
 *
 * In case of a single line statement the code piece statement `return` will be automatically prefixed.
 *
 * The function signature is: <br>` any, index: number, children: Column[], values: any[], raws: (number|null)[]) => number`
 *  <dl>
 *    <dt>param: ```
 *    <dd>the row in the dataset to compute the value for</dd>
 *    <dt>param: ``
 *    <dd>the index of the row</dd>
 *    <dt>param: `code></dt>
 *    <dd>the list of LineUp columns that are part of this ScriptColumn</dd>
 *    <dt>param: `values`</dt>
 *    <dd>the computed value of each column (see `children`) for the current row</dd>
 *    <dt>param: `raws`</dt>
 *    <dd>similar to `values`. Numeric columns return by default the normalized value, this array gives access to the original "raw" values before mapping is applied</dd>
 *    <dt>returns:</dt>
 *    <dd>the computed number <strong>in the range [0, 1] or NaN</strong></dd>
 *  </dl>
 *
 * In addition to the standard JavaScript functions and objects (Math, ...) a couple of utility functions are available: </p>
 * <dl>
 *    <dt>`max(arr: number[]) => number`</dt>
 *    <dd>computes the maximum of the given array of numbers</dd>
 *    <dt>`min(arr: number[]) => number`</dt>
 *    <dd>computes the minimum of the given array of numbers</dd>
 *    <dt>`extent(arr: number[]) => [number, number]`</dt>
 *    <dd>computes both minimum and maximum and returning an array with the first element the minimum and the second the maximum</dd>
 *    <dt>`clamp(v: number, min: number, max: number) => number`</dt>
 *    <dd>ensures that the given value is within the given min/max value</dd>
 *    <dt>`normalize(v: number, min: number, max: number) => number`</dt>
 *    <dd>normalizes the given value `(v - min) / (max - min)`</dd>
 *    <dt>`denormalize(v: number, min: number, max: number) => number`</dt>
 *    <dd>inverts a normalized value `v * (max - min) + min`</dd>
 *    <dt>`linear(v: number, input: [number, number], output: [number, number]) => number`</dt>
 *    <dd>performs a linear mapping from input domain to output domain both given as an array of [min, max] values. `denormalize(normalize(v, input[0], input[1]), output[0], output[1])`</dd>
 *  </dl>
 */
let ScriptColumn = ScriptColumn_1 = class ScriptColumn extends CompositeNumberColumn {
    constructor(id, desc, factory) {
        super(id, integrateDefaults(desc, {
            renderer: 'number',
            groupRenderer: 'boxplot',
            summaryRenderer: 'histogram',
        }));
        this.script = ScriptColumn_1.DEFAULT_SCRIPT;
        this.f = null;
        /**
         * currently active filter
         * @type {{min: number, max: number}}
         * @private
         */
        this.currentFilter = noNumberFilter();
        this.script = desc.script || this.script;
        this.mapping = restoreMapping(desc, factory);
        this.original = this.mapping.clone();
        this.colorMapping = factory.colorMappingFunction(desc.colorMapping || desc.color);
    }
    createEventList() {
        return super
            .createEventList()
            .concat([
            ScriptColumn_1.EVENT_SCRIPT_CHANGED,
            ScriptColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            ScriptColumn_1.EVENT_MAPPING_CHANGED,
        ]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    setScript(script) {
        if (this.script === script) {
            return;
        }
        this.f = null;
        this.fire([ScriptColumn_1.EVENT_SCRIPT_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY_CACHES, Column.EVENT_DIRTY], this.script, (this.script = script));
    }
    getScript() {
        return this.script;
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.script = this.script;
        r.filter = !isDummyNumberFilter(this.currentFilter) ? this.currentFilter : null;
        r.map = this.mapping.toJSON();
        r.colorMapping = this.colorMapping.toJSON();
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        this.script = dump.script || this.script;
        if (dump.filter) {
            this.currentFilter = restoreNumberFilter(dump.filter);
        }
        if (dump.map || dump.domain) {
            this.mapping = restoreMapping(dump.map, factory);
        }
        if (dump.colorMapping) {
            this.colorMapping = factory.colorMappingFunction(dump.colorMapping);
        }
    }
    compute(row) {
        if (this.f == null) {
            this.f = new Function('children', 'values', 'raws', 'col', 'row', 'index', wrapWithContext(this.script));
        }
        const children = this._children;
        const values = this._children.map((d) => d.getValue(row));
        const raws = this._children.map((d) => (isNumberColumn(d) ? d.getRawNumber(row) : null));
        const col = new ColumnContext(children.map((c, i) => new ColumnWrapper(c, values[i], raws[i])), () => {
            const cols = this.findMyRanker().flatColumns; // all except myself
            return new ColumnContext(cols.map((c) => new LazyColumnWrapper(c, row)));
        });
        return this.f.call(this, children, values, raws, col, row.v, row.i);
    }
    getExportValue(row, format) {
        if (format === 'json') {
            return {
                value: this.getRawNumber(row),
                children: this.children.map((d) => d.getExportValue(row, format)),
            };
        }
        return super.getExportValue(row, format);
    }
    getRange() {
        return this.mapping.getRange(this.getNumberFormat());
    }
    getOriginalMapping() {
        return this.original.clone();
    }
    getMapping() {
        return this.mapping.clone();
    }
    setMapping(mapping) {
        if (this.mapping.eq(mapping)) {
            return;
        }
        this.fire([
            ScriptColumn_1.EVENT_MAPPING_CHANGED,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], this.mapping.clone(), (this.mapping = mapping));
    }
    getColor(row) {
        return NumberColumn.prototype.getColor.call(this, row);
    }
    getColorMapping() {
        return this.colorMapping.clone();
    }
    setColorMapping(mapping) {
        if (this.colorMapping.eq(mapping)) {
            return;
        }
        this.fire([
            ScriptColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], this.colorMapping.clone(), (this.colorMapping = mapping));
    }
    isFiltered() {
        return NumberColumn.prototype.isFiltered.call(this);
    }
    getFilter() {
        return NumberColumn.prototype.getFilter.call(this);
    }
    setFilter(value) {
        NumberColumn.prototype.setFilter.call(this, value);
    }
    filter(row) {
        return NumberColumn.prototype.filter.call(this, row);
    }
    clearFilter() {
        return NumberColumn.prototype.clearFilter.call(this);
    }
};
ScriptColumn.EVENT_MAPPING_CHANGED = NumberColumn.EVENT_MAPPING_CHANGED;
ScriptColumn.EVENT_COLOR_MAPPING_CHANGED = NumberColumn.EVENT_COLOR_MAPPING_CHANGED;
ScriptColumn.EVENT_SCRIPT_CHANGED = 'scriptChanged';
ScriptColumn.DEFAULT_SCRIPT = DEFAULT_SCRIPT;
ScriptColumn = ScriptColumn_1 = __decorate([
    toolbar('script', 'filterNumber', 'colorMapped', 'editMapping'),
    SortByDefault('descending')
], ScriptColumn);
export default ScriptColumn;
