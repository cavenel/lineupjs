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
import { toolbar, dialogAddons, SortByDefault } from './annotations';
import { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, DEFAULT_COLOR, } from './Column';
import CompositeColumn, { addColumn, filterChanged, moveColumn, removeColumn } from './CompositeColumn';
import { EAdvancedSortMethod, isNumbersColumn, isMapAbleColumn, } from './INumberColumn';
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
export function createImpositionsDesc(label) {
    if (label === void 0) { label = 'Imposition'; }
    return { type: 'impositions', label: label };
}
/**
 * implementation of a combine column, standard operations how to select
 */
var ImpositionCompositesColumn = /** @class */ (function (_super) {
    __extends(ImpositionCompositesColumn, _super);
    function ImpositionCompositesColumn(id, desc) {
        return _super.call(this, id, integrateDefaults(desc, {
            renderer: 'numbers',
            groupRenderer: 'numbers',
            summaryRenderer: 'histogram',
        })) || this;
    }
    ImpositionCompositesColumn_1 = ImpositionCompositesColumn;
    Object.defineProperty(ImpositionCompositesColumn.prototype, "label", {
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
    Object.defineProperty(ImpositionCompositesColumn.prototype, "wrapper", {
        get: function () {
            return this._children.find(isNumbersColumn) || null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ImpositionCompositesColumn.prototype, "rest", {
        get: function () {
            var w = this.wrapper;
            return this._children.filter(function (d) { return d !== w; });
        },
        enumerable: false,
        configurable: true
    });
    ImpositionCompositesColumn.prototype.getLabel = function (row) {
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
    ImpositionCompositesColumn.prototype.getColor = function (row) {
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
    ImpositionCompositesColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            ImpositionCompositesColumn_1.EVENT_MAPPING_CHANGED,
            ImpositionCompositesColumn_1.EVENT_COLOR_MAPPING_CHANGED,
        ]);
    };
    ImpositionCompositesColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    Object.defineProperty(ImpositionCompositesColumn.prototype, "labels", {
        get: function () {
            var w = this.wrapper;
            return w ? w.labels : [];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ImpositionCompositesColumn.prototype, "dataLength", {
        get: function () {
            var w = this.wrapper;
            return w ? w.dataLength : null;
        },
        enumerable: false,
        configurable: true
    });
    ImpositionCompositesColumn.prototype.getNumberFormat = function () {
        var w = this.wrapper;
        return w ? w.getNumberFormat() : DEFAULT_FORMATTER;
    };
    ImpositionCompositesColumn.prototype.getValue = function (row) {
        var w = this.wrapper;
        return w ? w.getValue(row) : [];
    };
    ImpositionCompositesColumn.prototype.getNumber = function (row) {
        var w = this.wrapper;
        return w ? w.getNumber(row) : NaN;
    };
    ImpositionCompositesColumn.prototype.getRawNumber = function (row) {
        var w = this.wrapper;
        return w ? w.getRawNumber(row) : NaN;
    };
    ImpositionCompositesColumn.prototype.getExportValue = function (row, format) {
        if (format === 'json') {
            var value = this.getRawNumber(row);
            if (Number.isNaN(value)) {
                return null;
            }
            return {
                label: this.getLabels(row),
                color: this.getColor(row),
            };
        }
        return _super.prototype.getExportValue.call(this, row, format);
    };
    ImpositionCompositesColumn.prototype.getNumbers = function (row) {
        var w = this.wrapper;
        return w ? w.getNumbers(row) : [];
    };
    ImpositionCompositesColumn.prototype.getRawNumbers = function (row) {
        var w = this.wrapper;
        return w ? w.getRawNumbers(row) : [];
    };
    ImpositionCompositesColumn.prototype.iterNumber = function (row) {
        return this.getNumbers(row);
    };
    ImpositionCompositesColumn.prototype.iterRawNumber = function (row) {
        return this.getRawNumbers(row);
    };
    ImpositionCompositesColumn.prototype.getBoxPlotData = function (row) {
        var w = this.wrapper;
        return w ? w.getBoxPlotData(row) : null;
    };
    ImpositionCompositesColumn.prototype.getRawBoxPlotData = function (row) {
        var w = this.wrapper;
        return w ? w.getRawBoxPlotData(row) : null;
    };
    ImpositionCompositesColumn.prototype.getMapping = function () {
        var w = this.wrapper;
        return w ? w.getMapping() : new ScaleMappingFunction();
    };
    ImpositionCompositesColumn.prototype.getOriginalMapping = function () {
        var w = this.wrapper;
        return w ? w.getOriginalMapping() : new ScaleMappingFunction();
    };
    ImpositionCompositesColumn.prototype.getSortMethod = function () {
        var w = this.wrapper;
        return w ? w.getSortMethod() : EAdvancedSortMethod.min;
    };
    ImpositionCompositesColumn.prototype.setSortMethod = function (value) {
        var w = this.wrapper;
        return w ? w.setSortMethod(value) : undefined;
    };
    ImpositionCompositesColumn.prototype.setMapping = function (mapping) {
        var w = this.wrapper;
        return w ? w.setMapping(mapping) : undefined;
    };
    ImpositionCompositesColumn.prototype.getColorMapping = function () {
        var w = this.wrapper;
        return w ? w.getColorMapping() : DEFAULT_COLOR_FUNCTION;
    };
    ImpositionCompositesColumn.prototype.setColorMapping = function (mapping) {
        var w = this.wrapper;
        return w ? w.setColorMapping(mapping) : undefined;
    };
    ImpositionCompositesColumn.prototype.getFilter = function () {
        var w = this.wrapper;
        return w ? w.getFilter() : noNumberFilter();
    };
    ImpositionCompositesColumn.prototype.setFilter = function (value) {
        var w = this.wrapper;
        return w ? w.setFilter(value) : undefined;
    };
    ImpositionCompositesColumn.prototype.getRange = function () {
        var w = this.wrapper;
        return w ? w.getRange() : ['0', '1'];
    };
    ImpositionCompositesColumn.prototype.getMap = function (row) {
        var w = this.wrapper;
        return w ? w.getMap(row) : [];
    };
    ImpositionCompositesColumn.prototype.getMapLabel = function (row) {
        var w = this.wrapper;
        return w ? w.getMapLabel(row) : [];
    };
    ImpositionCompositesColumn.prototype.getLabels = function (row) {
        var w = this.wrapper;
        return w ? w.getLabels(row) : [];
    };
    ImpositionCompositesColumn.prototype.getValues = function (row) {
        var w = this.wrapper;
        return w ? w.getValues(row) : [];
    };
    ImpositionCompositesColumn.prototype.toCompareValue = function (row) {
        return NumbersColumn.prototype.toCompareValue.call(this, row);
    };
    ImpositionCompositesColumn.prototype.toCompareValueType = function () {
        return NumbersColumn.prototype.toCompareValueType.call(this);
    };
    ImpositionCompositesColumn.prototype.toCompareGroupValue = function (rows, group) {
        return NumbersColumn.prototype.toCompareGroupValue.call(this, rows, group);
    };
    ImpositionCompositesColumn.prototype.toCompareGroupValueType = function () {
        return NumbersColumn.prototype.toCompareGroupValueType.call(this);
    };
    ImpositionCompositesColumn.prototype.insert = function (col, index) {
        if (this._children.length === 1 && !this.wrapper && !isNumbersColumn(col)) {
            // at least one has to be a number column
            return null;
        }
        if (this._children.length >= 2) {
            // limit to two
            return null;
        }
        return _super.prototype.insert.call(this, col, index);
    };
    ImpositionCompositesColumn.prototype.insertImpl = function (col, index) {
        if (isNumbersColumn(col)) {
            this.forward.apply(this, __spreadArray([col], suffix('.impose', NumbersColumn.EVENT_MAPPING_CHANGED), false));
        }
        if (isMapAbleColumn(col)) {
            this.forward.apply(this, __spreadArray([col], suffix('.impose', NumbersColumn.EVENT_COLOR_MAPPING_CHANGED), false));
        }
        return _super.prototype.insertImpl.call(this, col, index);
    };
    ImpositionCompositesColumn.prototype.removeImpl = function (child, index) {
        if (isNumbersColumn(child)) {
            this.unforward.apply(this, __spreadArray([child], suffix('.impose', NumbersColumn.EVENT_MAPPING_CHANGED), false));
        }
        if (isMapAbleColumn(child)) {
            this.unforward.apply(this, __spreadArray([child], suffix('.impose', NumbersColumn.EVENT_COLOR_MAPPING_CHANGED), false));
        }
        return _super.prototype.removeImpl.call(this, child, index);
    };
    var ImpositionCompositesColumn_1;
    ImpositionCompositesColumn.EVENT_MAPPING_CHANGED = NumbersColumn.EVENT_MAPPING_CHANGED;
    ImpositionCompositesColumn.EVENT_COLOR_MAPPING_CHANGED = NumbersColumn.EVENT_COLOR_MAPPING_CHANGED;
    ImpositionCompositesColumn = ImpositionCompositesColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'filterNumber', 'colorMapped', 'editMapping'),
        dialogAddons('sort', 'sortNumbers'),
        SortByDefault('descending')
    ], ImpositionCompositesColumn);
    return ImpositionCompositesColumn;
}(CompositeColumn));
export default ImpositionCompositesColumn;
//# sourceMappingURL=ImpositionCompositesColumn.js.map