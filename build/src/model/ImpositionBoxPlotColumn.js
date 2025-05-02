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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { suffix } from '../internal';
import { toolbar, SortByDefault, dialogAddons } from './annotations';
import BoxPlotColumn from './BoxPlotColumn';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, DEFAULT_COLOR, } from './Column';
import CompositeColumn, { addColumn, filterChanged, moveColumn, removeColumn } from './CompositeColumn';
import { ESortMethod, isBoxPlotColumn, isMapAbleColumn, } from './INumberColumn';
import { ScaleMappingFunction } from './MappingFunction';
import NumbersColumn from './NumbersColumn';
import { DEFAULT_COLOR_FUNCTION } from './ColorMappingFunction';
import { DEFAULT_FORMATTER, noNumberFilter } from './internalNumber';
import { integrateDefaults } from './internal';
/**
 *  factory for creating a description creating a max column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createImpositionBoxPlotDesc(label) {
    if (label === void 0) { label = 'Imposition'; }
    return { type: 'impositions', label: label };
}
/**
 * implementation of a combine column, standard operations how to select
 */
var ImpositionBoxPlotColumn = /** @class */ (function (_super) {
    __extends(ImpositionBoxPlotColumn, _super);
    function ImpositionBoxPlotColumn(id, desc) {
        return _super.call(this, id, integrateDefaults(desc, {
            renderer: 'boxplot',
            groupRenderer: 'boxplot',
            summaryRenderer: 'boxplot',
        })) || this;
    }
    ImpositionBoxPlotColumn_1 = ImpositionBoxPlotColumn;
    Object.defineProperty(ImpositionBoxPlotColumn.prototype, "label", {
        get: function () {
            var l = _super.prototype.getMetaData.call(this).label;
            var c = this._children;
            if (l !== 'Imposition' || c.length === 0) {
                return l;
            }
            if (c.length === 1) {
                return c[0].label;
            }
            var w = this.wrapper;
            var rest = this.rest;
            return "".concat(w ? w.label : '?', " (").concat(rest.map(function (c) { return c.label; }).join(', '), ")");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ImpositionBoxPlotColumn.prototype, "wrapper", {
        get: function () {
            var _a;
            return (_a = this._children.find(isBoxPlotColumn)) !== null && _a !== void 0 ? _a : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ImpositionBoxPlotColumn.prototype, "rest", {
        get: function () {
            var w = this.wrapper;
            return this._children.filter(function (d) { return d !== w; });
        },
        enumerable: false,
        configurable: true
    });
    ImpositionBoxPlotColumn.prototype.getLabel = function (row) {
        var c = this._children;
        if (c.length === 0) {
            return '';
        }
        if (c.length === 1) {
            return c[0].getLabel(row);
        }
        var w = this.wrapper;
        var rest = this.rest;
        return "".concat(w ? w.getLabel(row) : '?', " (").concat(rest.map(function (c) { return "".concat(c.label, " = ").concat(c.getLabel(row)); }), ")");
    };
    ImpositionBoxPlotColumn.prototype.getColor = function (row) {
        var c = this._children;
        switch (c.length) {
            case 0:
                return DEFAULT_COLOR;
            case 1:
                return c[0].getColor(row);
            default:
                return this.rest[0].getColor(row);
        }
    };
    ImpositionBoxPlotColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([ImpositionBoxPlotColumn_1.EVENT_MAPPING_CHANGED, ImpositionBoxPlotColumn_1.EVENT_COLOR_MAPPING_CHANGED]);
    };
    ImpositionBoxPlotColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    ImpositionBoxPlotColumn.prototype.getNumberFormat = function () {
        var w = this.wrapper;
        return w ? w.getNumberFormat() : DEFAULT_FORMATTER;
    };
    ImpositionBoxPlotColumn.prototype.getValue = function (row) {
        var w = this.wrapper;
        return w ? w.getValue(row) : null;
    };
    ImpositionBoxPlotColumn.prototype.getNumber = function (row) {
        var w = this.wrapper;
        return w ? w.getNumber(row) : NaN;
    };
    ImpositionBoxPlotColumn.prototype.getRawNumber = function (row) {
        var w = this.wrapper;
        return w ? w.getRawNumber(row) : NaN;
    };
    ImpositionBoxPlotColumn.prototype.iterNumber = function (row) {
        return [this.getNumber(row)];
    };
    ImpositionBoxPlotColumn.prototype.iterRawNumber = function (row) {
        return [this.getRawNumber(row)];
    };
    ImpositionBoxPlotColumn.prototype.getExportValue = function (row, format) {
        if (format === 'json') {
            var value = this.getRawNumber(row);
            if (Number.isNaN(value)) {
                return null;
            }
            return {
                label: this.getLabel(row),
                color: this.getColor(row),
                value: value,
            };
        }
        return _super.prototype.getExportValue.call(this, row, format);
    };
    ImpositionBoxPlotColumn.prototype.getBoxPlotData = function (row) {
        var w = this.wrapper;
        return w ? w.getBoxPlotData(row) : null;
    };
    ImpositionBoxPlotColumn.prototype.getRawBoxPlotData = function (row) {
        var w = this.wrapper;
        return w ? w.getRawBoxPlotData(row) : null;
    };
    ImpositionBoxPlotColumn.prototype.getMapping = function () {
        var w = this.wrapper;
        return w ? w.getMapping() : new ScaleMappingFunction();
    };
    ImpositionBoxPlotColumn.prototype.getOriginalMapping = function () {
        var w = this.wrapper;
        return w ? w.getOriginalMapping() : new ScaleMappingFunction();
    };
    ImpositionBoxPlotColumn.prototype.getSortMethod = function () {
        var w = this.wrapper;
        return w ? w.getSortMethod() : ESortMethod.min;
    };
    ImpositionBoxPlotColumn.prototype.setSortMethod = function (value) {
        var w = this.wrapper;
        return w ? w.setSortMethod(value) : undefined;
    };
    ImpositionBoxPlotColumn.prototype.setMapping = function (mapping) {
        var w = this.wrapper;
        return w ? w.setMapping(mapping) : undefined;
    };
    ImpositionBoxPlotColumn.prototype.getColorMapping = function () {
        var w = this.wrapper;
        return w ? w.getColorMapping() : DEFAULT_COLOR_FUNCTION;
    };
    ImpositionBoxPlotColumn.prototype.setColorMapping = function (mapping) {
        var w = this.wrapper;
        return w ? w.setColorMapping(mapping) : undefined;
    };
    ImpositionBoxPlotColumn.prototype.getFilter = function () {
        var w = this.wrapper;
        return w ? w.getFilter() : noNumberFilter();
    };
    ImpositionBoxPlotColumn.prototype.setFilter = function (value) {
        var w = this.wrapper;
        return w ? w.setFilter(value) : undefined;
    };
    ImpositionBoxPlotColumn.prototype.getRange = function () {
        var w = this.wrapper;
        return w ? w.getRange() : ['0', '1'];
    };
    ImpositionBoxPlotColumn.prototype.toCompareValue = function (row) {
        return BoxPlotColumn.prototype.toCompareValue.call(this, row);
    };
    ImpositionBoxPlotColumn.prototype.toCompareValueType = function () {
        return BoxPlotColumn.prototype.toCompareValueType.call(this);
    };
    ImpositionBoxPlotColumn.prototype.group = function (row) {
        return BoxPlotColumn.prototype.group.call(this, row);
    };
    ImpositionBoxPlotColumn.prototype.toCompareGroupValue = function (rows, group) {
        return BoxPlotColumn.prototype.toCompareGroupValue.call(this, rows, group);
    };
    ImpositionBoxPlotColumn.prototype.toCompareGroupValueType = function () {
        return BoxPlotColumn.prototype.toCompareGroupValueType.call(this);
    };
    ImpositionBoxPlotColumn.prototype.insert = function (col, index) {
        if (this._children.length === 1 && !this.wrapper && !isBoxPlotColumn(col)) {
            // at least one has to be a number column
            return null;
        }
        if (this._children.length >= 2) {
            // limit to two
            return null;
        }
        return _super.prototype.insert.call(this, col, index);
    };
    ImpositionBoxPlotColumn.prototype.insertImpl = function (col, index) {
        if (isBoxPlotColumn(col)) {
            this.forward.apply(this, __spreadArray([col], suffix('.impose', BoxPlotColumn.EVENT_MAPPING_CHANGED, BoxPlotColumn.EVENT_COLOR_MAPPING_CHANGED), false));
        }
        else if (isMapAbleColumn(col)) {
            this.forward.apply(this, __spreadArray([col], suffix('.impose', BoxPlotColumn.EVENT_COLOR_MAPPING_CHANGED), false));
        }
        return _super.prototype.insertImpl.call(this, col, index);
    };
    ImpositionBoxPlotColumn.prototype.removeImpl = function (child, index) {
        if (isBoxPlotColumn(child)) {
            this.unforward.apply(this, __spreadArray([child], suffix('.impose', BoxPlotColumn.EVENT_MAPPING_CHANGED, BoxPlotColumn.EVENT_COLOR_MAPPING_CHANGED), false));
        }
        else if (isMapAbleColumn(child)) {
            this.unforward.apply(this, __spreadArray([child], suffix('.impose', BoxPlotColumn.EVENT_COLOR_MAPPING_CHANGED), false));
        }
        return _super.prototype.removeImpl.call(this, child, index);
    };
    var ImpositionBoxPlotColumn_1;
    ImpositionBoxPlotColumn.EVENT_MAPPING_CHANGED = NumbersColumn.EVENT_MAPPING_CHANGED;
    ImpositionBoxPlotColumn.EVENT_COLOR_MAPPING_CHANGED = NumbersColumn.EVENT_COLOR_MAPPING_CHANGED;
    ImpositionBoxPlotColumn = ImpositionBoxPlotColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'filterNumber', 'colorMapped', 'editMapping'),
        dialogAddons('sort', 'sortBoxPlot'),
        SortByDefault('descending')
    ], ImpositionBoxPlotColumn);
    return ImpositionBoxPlotColumn;
}(CompositeColumn));
export default ImpositionBoxPlotColumn;
//# sourceMappingURL=ImpositionBoxPlotColumn.js.map