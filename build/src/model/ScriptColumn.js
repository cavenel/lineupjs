var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import NumberColumn from './NumberColumn';
import { SortByDefault, toolbar } from './annotations';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged, } from './Column';
import CompositeNumberColumn, {} from './CompositeNumberColumn';
import { isDummyNumberFilter, noNumberFilter, restoreNumberFilter } from './internalNumber';
import { isNumberColumn, } from './INumberColumn';
import { restoreMapping } from './MappingFunction';
import { integrateDefaults } from './internal';
var DEFAULT_SCRIPT = "let s = 0;\ncol.forEach((c) => s += c.v);\nreturn s / col.length";
/**
 * factory for creating a description creating a mean column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createScriptDesc(label) {
    if (label === void 0) { label = 'script'; }
    return { type: 'script', label: label, script: DEFAULT_SCRIPT };
}
function wrapWithContext(code) {
    var clean = code.trim();
    if (!clean.includes('return')) {
        clean = "return (".concat(clean, ");");
    }
    return "\n  const max = function(arr) { return Math.max.apply(Math, arr); };\n  const min = function(arr) { return Math.min.apply(Math, arr); };\n  const extent = function(arr) { return [min(arr), max(arr)]; };\n  const clamp = function(v, minValue, maxValue) { return v < minValue ? minValue : (v > maxValue ? maxValue : v); };\n  const normalize = function(v, minMax, max) {\n    if (Array.isArray(minMax)) {\n      minMax = minMax[0];\n      max = minMax[1];\n    }\n    return (v - minMax) / (max - minMax);\n  };\n  const denormalize = function(v, minMax, max) {\n    if (Array.isArray(minMax)) {\n      minMax = minMax[0];\n      max = minMax[1];\n    }\n    return v * (max - minMax) + minMax;\n  };\n  const linear = function(v, source, target) {\n    target = target || [0, 1];\n    return denormalize(normalize(v, source), target);\n  };\n  const v = (function custom() {\n    ".concat(clean, "\n  })();\n\n  return typeof v === 'number' ? v : NaN");
}
/**
 * wrapper class for simpler column accessing
 */
var ColumnWrapper = /** @class */ (function () {
    function ColumnWrapper(c, v, raw) {
        this.c = c;
        this.v = v;
        this.raw = raw;
    }
    Object.defineProperty(ColumnWrapper.prototype, "type", {
        get: function () {
            return this.c.desc.type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColumnWrapper.prototype, "name", {
        get: function () {
            return this.c.getMetaData().label;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColumnWrapper.prototype, "id", {
        get: function () {
            return this.c.id;
        },
        enumerable: false,
        configurable: true
    });
    return ColumnWrapper;
}());
var LazyColumnWrapper = /** @class */ (function () {
    function LazyColumnWrapper(c, row) {
        this.c = c;
        this.row = row;
    }
    Object.defineProperty(LazyColumnWrapper.prototype, "type", {
        get: function () {
            return this.c.desc.type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LazyColumnWrapper.prototype, "name", {
        get: function () {
            return this.c.getMetaData().label;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LazyColumnWrapper.prototype, "id", {
        get: function () {
            return this.c.id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LazyColumnWrapper.prototype, "v", {
        get: function () {
            return this.c.getValue(this.row);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LazyColumnWrapper.prototype, "raw", {
        get: function () {
            return isNumberColumn(this.c) ? this.c.getRawNumber(this.row) : null;
        },
        enumerable: false,
        configurable: true
    });
    return LazyColumnWrapper;
}());
/**
 * helper context for accessing columns within a scripted columns
 */
var ColumnContext = /** @class */ (function () {
    function ColumnContext(children, allFactory) {
        var _this = this;
        this.children = children;
        this.allFactory = allFactory;
        this.lookup = new Map();
        this._all = null;
        children.forEach(function (c) {
            _this.lookup.set("ID@".concat(c.id), c);
            _this.lookup.set("ID@".concat(c.id.toLowerCase()), c);
            _this.lookup.set("NAME@".concat(c.name), c);
            _this.lookup.set("NAME@".concat(c.name.toLowerCase()), c);
        });
    }
    /**
     * get a column by name
     * @param {string} name
     * @return {IColumnWrapper}
     */
    ColumnContext.prototype.byName = function (name) {
        return this.lookup.get("NAME@".concat(name));
    };
    /**
     * get a column by id
     * @param {string} id
     * @return {IColumnWrapper}
     */
    ColumnContext.prototype.byID = function (id) {
        return this.lookup.get("ID@".concat(id));
    };
    /**
     * get a column by index
     * @param {number} index
     * @return {IColumnWrapper}
     */
    ColumnContext.prototype.byIndex = function (index) {
        return this.children[index];
    };
    ColumnContext.prototype.forEach = function (callback) {
        return this.children.forEach(callback);
    };
    Object.defineProperty(ColumnContext.prototype, "length", {
        /**
         * number of columns
         * @return {number}
         */
        get: function () {
            return this.children.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColumnContext.prototype, "all", {
        /**
         * get the all context, i.e one with all columns of this ranking
         * @return {ColumnContext}
         */
        get: function () {
            if (this._all == null) {
                this._all = this.allFactory ? this.allFactory() : null;
            }
            return this._all;
        },
        enumerable: false,
        configurable: true
    });
    return ColumnContext;
}());
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
var ScriptColumn = /** @class */ (function (_super) {
    __extends(ScriptColumn, _super);
    function ScriptColumn(id, desc, factory) {
        var _this = _super.call(this, id, integrateDefaults(desc, {
            renderer: 'number',
            groupRenderer: 'boxplot',
            summaryRenderer: 'histogram',
        })) || this;
        _this.script = ScriptColumn_1.DEFAULT_SCRIPT;
        _this.f = null;
        /**
         * currently active filter
         * @type {{min: number, max: number}}
         * @private
         */
        _this.currentFilter = noNumberFilter();
        _this.script = desc.script || _this.script;
        _this.mapping = restoreMapping(desc, factory);
        _this.original = _this.mapping.clone();
        _this.colorMapping = factory.colorMappingFunction(desc.colorMapping || desc.color);
        return _this;
    }
    ScriptColumn_1 = ScriptColumn;
    ScriptColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            ScriptColumn_1.EVENT_SCRIPT_CHANGED,
            ScriptColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            ScriptColumn_1.EVENT_MAPPING_CHANGED,
        ]);
    };
    ScriptColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    ScriptColumn.prototype.setScript = function (script) {
        if (this.script === script) {
            return;
        }
        this.f = null;
        this.fire([ScriptColumn_1.EVENT_SCRIPT_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY_CACHES, Column.EVENT_DIRTY], this.script, (this.script = script));
    };
    ScriptColumn.prototype.getScript = function () {
        return this.script;
    };
    ScriptColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.script = this.script;
        r.filter = !isDummyNumberFilter(this.currentFilter) ? this.currentFilter : null;
        r.map = this.mapping.toJSON();
        r.colorMapping = this.colorMapping.toJSON();
        return r;
    };
    ScriptColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
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
    };
    ScriptColumn.prototype.compute = function (row) {
        var _this = this;
        if (this.f == null) {
            this.f = new Function('children', 'values', 'raws', 'col', 'row', 'index', wrapWithContext(this.script));
        }
        var children = this._children;
        var values = this._children.map(function (d) { return d.getValue(row); });
        var raws = this._children.map(function (d) { return (isNumberColumn(d) ? d.getRawNumber(row) : null); });
        var col = new ColumnContext(children.map(function (c, i) { return new ColumnWrapper(c, values[i], raws[i]); }), function () {
            var cols = _this.findMyRanker().flatColumns; // all except myself
            return new ColumnContext(cols.map(function (c) { return new LazyColumnWrapper(c, row); }));
        });
        return this.f.call(this, children, values, raws, col, row.v, row.i);
    };
    ScriptColumn.prototype.getExportValue = function (row, format) {
        if (format === 'json') {
            return {
                value: this.getRawNumber(row),
                children: this.children.map(function (d) { return d.getExportValue(row, format); }),
            };
        }
        return _super.prototype.getExportValue.call(this, row, format);
    };
    ScriptColumn.prototype.getRange = function () {
        return this.mapping.getRange(this.getNumberFormat());
    };
    ScriptColumn.prototype.getOriginalMapping = function () {
        return this.original.clone();
    };
    ScriptColumn.prototype.getMapping = function () {
        return this.mapping.clone();
    };
    ScriptColumn.prototype.setMapping = function (mapping) {
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
    };
    ScriptColumn.prototype.getColor = function (row) {
        return NumberColumn.prototype.getColor.call(this, row);
    };
    ScriptColumn.prototype.getColorMapping = function () {
        return this.colorMapping.clone();
    };
    ScriptColumn.prototype.setColorMapping = function (mapping) {
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
    };
    ScriptColumn.prototype.isFiltered = function () {
        return NumberColumn.prototype.isFiltered.call(this);
    };
    ScriptColumn.prototype.getFilter = function () {
        return NumberColumn.prototype.getFilter.call(this);
    };
    ScriptColumn.prototype.setFilter = function (value) {
        NumberColumn.prototype.setFilter.call(this, value);
    };
    ScriptColumn.prototype.filter = function (row) {
        return NumberColumn.prototype.filter.call(this, row);
    };
    ScriptColumn.prototype.clearFilter = function () {
        return NumberColumn.prototype.clearFilter.call(this);
    };
    var ScriptColumn_1;
    ScriptColumn.EVENT_MAPPING_CHANGED = NumberColumn.EVENT_MAPPING_CHANGED;
    ScriptColumn.EVENT_COLOR_MAPPING_CHANGED = NumberColumn.EVENT_COLOR_MAPPING_CHANGED;
    ScriptColumn.EVENT_SCRIPT_CHANGED = 'scriptChanged';
    ScriptColumn.DEFAULT_SCRIPT = DEFAULT_SCRIPT;
    ScriptColumn = ScriptColumn_1 = __decorate([
        toolbar('script', 'filterNumber', 'colorMapped', 'editMapping'),
        SortByDefault('descending')
    ], ScriptColumn);
    return ScriptColumn;
}(CompositeNumberColumn));
export default ScriptColumn;
//# sourceMappingURL=ScriptColumn.js.map