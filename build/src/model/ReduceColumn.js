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
import { median, quantile } from '../internal';
import { toolbar } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, DEFAULT_COLOR, } from './Column';
import CompositeNumberColumn, {} from './CompositeNumberColumn';
import { EAdvancedSortMethod } from './INumberColumn';
import { integrateDefaults } from './internal';
/**
 *  factory for creating a description creating a max column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createReduceDesc(label) {
    if (label === void 0) { label = 'Reduce'; }
    return { type: 'reduce', label: label };
}
/**
 * combines multiple columns by using the maximal value
 */
var ReduceColumn = /** @class */ (function (_super) {
    __extends(ReduceColumn, _super);
    function ReduceColumn(id, desc) {
        var _this = _super.call(this, id, integrateDefaults(desc, {
            renderer: 'interleaving',
            groupRenderer: 'interleaving',
            summaryRenderer: 'interleaving',
        })) || this;
        _this.reduce = desc.reduce || EAdvancedSortMethod.max;
        return _this;
    }
    ReduceColumn_1 = ReduceColumn;
    Object.defineProperty(ReduceColumn.prototype, "label", {
        get: function () {
            var l = _super.prototype.getMetaData.call(this).label;
            if (l !== 'Reduce') {
                return l;
            }
            return "".concat(this.reduce[0].toUpperCase()).concat(this.reduce.slice(1), "(").concat(this.children.map(function (d) { return d.label; }).join(', '), ")");
        },
        enumerable: false,
        configurable: true
    });
    ReduceColumn.prototype.getColor = function (row) {
        //compute the index of the maximal one
        var c = this._children;
        if (c.length === 0 ||
            this.reduce === EAdvancedSortMethod.q1 ||
            this.reduce === EAdvancedSortMethod.q3 ||
            this.reduce === EAdvancedSortMethod.mean) {
            return DEFAULT_COLOR;
        }
        var v = this.compute(row);
        var selected = c.find(function (c) { return c.getValue(row) === v; });
        return selected ? selected.getColor(row) : DEFAULT_COLOR;
    };
    ReduceColumn.prototype.compute = function (row) {
        var vs = this._children.map(function (d) { return d.getValue(row); }).filter(function (d) { return !Number.isNaN(d); });
        if (vs.length === 0) {
            return NaN;
        }
        switch (this.reduce) {
            case EAdvancedSortMethod.mean:
                return vs.reduce(function (a, b) { return a + b; }, 0) / vs.length;
            case EAdvancedSortMethod.max:
                return vs.reduce(function (a, b) { return Math.max(a, b); }, Number.NEGATIVE_INFINITY);
            case EAdvancedSortMethod.min:
                return vs.reduce(function (a, b) { return Math.min(a, b); }, Number.POSITIVE_INFINITY);
            case EAdvancedSortMethod.median:
                return median(vs);
            case EAdvancedSortMethod.q1:
                return quantile(vs.sort(function (a, b) { return a - b; }), 0.25);
            case EAdvancedSortMethod.q3:
                return quantile(vs.sort(function (a, b) { return a - b; }), 0.75);
        }
    };
    ReduceColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([ReduceColumn_1.EVENT_REDUCE_CHANGED]);
    };
    ReduceColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    ReduceColumn.prototype.getReduce = function () {
        return this.reduce;
    };
    ReduceColumn.prototype.setReduce = function (reduce) {
        if (this.reduce === reduce) {
            return;
        }
        this.fire([ReduceColumn_1.EVENT_REDUCE_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY_CACHES, Column.EVENT_DIRTY], this.reduce, (this.reduce = reduce));
    };
    ReduceColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.reduce = this.reduce;
        return r;
    };
    ReduceColumn.prototype.restore = function (dump, factory) {
        this.reduce = dump.reduce || this.reduce;
        _super.prototype.restore.call(this, dump, factory);
    };
    Object.defineProperty(ReduceColumn.prototype, "canJustAddNumbers", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    ReduceColumn.prototype.getExportValue = function (row, format) {
        if (format === 'json') {
            return {
                value: this.getRawNumber(row),
                children: this.children.map(function (d) { return d.getExportValue(row, format); }),
            };
        }
        return _super.prototype.getExportValue.call(this, row, format);
    };
    var ReduceColumn_1;
    ReduceColumn.EVENT_REDUCE_CHANGED = 'reduceChanged';
    ReduceColumn = ReduceColumn_1 = __decorate([
        toolbar('reduce')
    ], ReduceColumn);
    return ReduceColumn;
}(CompositeNumberColumn));
export default ReduceColumn;
//# sourceMappingURL=ReduceColumn.js.map