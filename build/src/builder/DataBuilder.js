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
import { DataProvider, LocalDataProvider, deriveColors, deriveColumnDescriptions, } from '../provider';
import { LineUp, Taggle } from '../ui';
import ColumnBuilder from './column/ColumnBuilder';
import LineUpBuilder from './LineUpBuilder';
import { RankingBuilder } from './RankingBuilder';
export * from './column';
export * from './RankingBuilder';
/**
 * builder for a LocalDataProvider along with LineUp configuration options
 */
var DataBuilder = /** @class */ (function (_super) {
    __extends(DataBuilder, _super);
    function DataBuilder(data) {
        var _this = _super.call(this) || this;
        _this.data = data;
        _this.columns = [];
        _this.providerOptions = {
            columnTypes: {},
        };
        _this.rankBuilders = [];
        _this._deriveColors = false;
        return _this;
    }
    /**
     * use the schedulded task executor to asynchronously compute aggregations
     */
    DataBuilder.prototype.scheduledTaskExecutor = function () {
        this.providerOptions.taskExecutor = 'scheduled';
        return this;
    };
    /**
     * when using a top-n strategy how many items should be shown
     */
    DataBuilder.prototype.showTopN = function (n) {
        this.providerOptions.showTopN = n;
        return this;
    };
    /**
     * change the aggregation strategy that should be used when grouping by a column
     */
    DataBuilder.prototype.aggregationStrategy = function (strategy) {
        this.providerOptions.aggregationStrategy = strategy;
        return this;
    };
    /**
     * whether to propagate a collapse operation to its children
     * @default true
     */
    DataBuilder.prototype.propagateAggregationState = function (value) {
        this.providerOptions.propagateAggregationState = value;
        return this;
    };
    /**
     * allow just a single selection
     */
    DataBuilder.prototype.singleSelection = function () {
        this.providerOptions.singleSelection = true;
        return this;
    };
    /**
     * allow multiple selections
     */
    DataBuilder.prototype.multiSelection = function () {
        this.providerOptions.singleSelection = false;
        return this;
    };
    /**
     * filter all rankings by all filters in LineUp
     */
    DataBuilder.prototype.filterGlobally = function () {
        this.providerOptions.filterGlobally = true;
        return this;
    };
    /**
     * triggers to derive the column descriptions for the given data
     * @param {string} columns optional enforced order of columns
     */
    DataBuilder.prototype.deriveColumns = function () {
        var columns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            columns[_i] = arguments[_i];
        }
        var cols = [].concat.apply([], columns);
        for (var _a = 0, _b = deriveColumnDescriptions(this.data, { columns: cols }); _a < _b.length; _a++) {
            var c = _b[_a];
            this.columns.push(c);
        }
        return this;
    };
    /**
     * tirggers to assign colors for the given descriptions
     */
    DataBuilder.prototype.deriveColors = function () {
        this._deriveColors = true;
        return this;
    };
    /**
     * register another column type to this data provider
     * @param {string} type unique type id
     * @param {IColumnConstructor} clazz column class
     */
    DataBuilder.prototype.registerColumnType = function (type, clazz) {
        this.providerOptions.columnTypes[type] = clazz;
        return this;
    };
    /**
     * push another column description to this data provider
     * @param {IColumnDesc | ColumnBuilder} column column description or builder instance
     */
    DataBuilder.prototype.column = function (column) {
        this.columns.push(column instanceof ColumnBuilder ? column.build.bind(column) : column);
        return this;
    };
    /**
     * restores a given ranking dump
     * @param dump dump as created using '.dump()'
     */
    DataBuilder.prototype.restore = function (dump) {
        this.rankBuilders.push(function (data) { return data.restore(dump); });
        return this;
    };
    /**
     * add the default ranking (all columns) to this data provider
     * @param {boolean} addSupportTypes add support types, too, default: true
     */
    DataBuilder.prototype.defaultRanking = function (addSupportTypes) {
        if (addSupportTypes === void 0) { addSupportTypes = true; }
        this.rankBuilders.push(function (data) { return data.deriveDefault(addSupportTypes); });
        return this;
    };
    /**
     * add another ranking to this data provider
     * @param {((data: DataProvider) => void) | RankingBuilder} builder ranking builder
     */
    DataBuilder.prototype.ranking = function (builder) {
        this.rankBuilders.push(builder instanceof RankingBuilder ? builder.build.bind(builder) : builder);
        return this;
    };
    /**
     * builds the data provider itself
     * @returns {LocalDataProvider}
     */
    DataBuilder.prototype.buildData = function () {
        // last come survived separated by label to be able to override columns
        var columns = [];
        var contained = new Set();
        var _loop_1 = function (col) {
            var c = typeof col === 'function' ? col(this_1.data) : col;
            var key = "".concat(c.type, "@").concat(c.label, "@").concat(c.summary);
            if (!contained.has(key)) {
                columns.push(c);
                contained.add(key);
                return "continue";
            }
            var oldPos = columns.findIndex(function (d) { return key === "".concat(d.type, "@").concat(d.label, "@").concat(c.summary); });
            columns.splice(oldPos, 1, c); // replace with new one
        };
        var this_1 = this;
        for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
            var col = _a[_i];
            _loop_1(col);
        }
        if (this._deriveColors) {
            deriveColors(columns);
        }
        var r = new LocalDataProvider(this.data, columns, this.providerOptions);
        if (this.rankBuilders.length === 0) {
            this.defaultRanking();
        }
        this.rankBuilders.forEach(function (builder) { return builder(r); });
        return r;
    };
    /**
     * builds LineUp at the given parent DOM node
     * @param {HTMLElement} node parent DOM node to attach
     * @returns {LineUp}
     */
    DataBuilder.prototype.build = function (node) {
        return new LineUp(node, this.buildData(), this.options);
    };
    /**
     * builds Taggle at the given parent DOM node
     * @param {HTMLElement} node parent DOM node to attach
     * @returns {Taggle}
     */
    DataBuilder.prototype.buildTaggle = function (node) {
        return new Taggle(node, this.buildData(), this.options);
    };
    return DataBuilder;
}(LineUpBuilder));
export { DataBuilder };
/**
 * creates a new builder instance for the given data
 * @param {Record<string, unknown>[]} arr data to visualize
 * @returns {DataBuilder}
 */
export function builder(arr) {
    return new DataBuilder(arr);
}
/**
 * build a new Taggle instance in the given node for the given data
 * @param {HTMLElement} node DOM node to attach to
 * @param {any[]} data data to visualize
 * @param {string[]} columns optional enforced column order
 * @returns {Taggle}
 */
export function asTaggle(node, data) {
    var columns = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        columns[_i - 2] = arguments[_i];
    }
    return builder(data).deriveColumns(columns).deriveColors().defaultRanking().buildTaggle(node);
}
/**
 * build a new LineUp instance in the given node for the given data
 * @param {HTMLElement} node DOM node to attach to
 * @param {any[]} data data to visualize
 * @param {string[]} columns optional enforced column order
 * @returns {LineUp}
 */
export function asLineUp(node, data) {
    var columns = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        columns[_i - 2] = arguments[_i];
    }
    return builder(data).deriveColumns(columns).deriveColors().defaultRanking().build(node);
}
//# sourceMappingURL=DataBuilder.js.map