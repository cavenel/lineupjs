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
import { toolbar, SortByDefault } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, DEFAULT_COLOR, } from './Column';
import CompositeColumn, { addColumn, filterChanged, moveColumn, removeColumn } from './CompositeColumn';
import { isNumberColumn, isMapAbleColumn, } from './INumberColumn';
import NumberColumn from './NumberColumn';
import { DEFAULT_FORMATTER, noNumberFilter } from './internalNumber';
import { ScaleMappingFunction } from './MappingFunction';
import { DEFAULT_COLOR_FUNCTION } from './ColorMappingFunction';
import { integrateDefaults } from './internal';
/**
 *  factory for creating a description creating a max column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createImpositionDesc(label) {
    if (label === void 0) { label = 'Imposition'; }
    return { type: 'imposition', label: label };
}
/**
 * implementation of a combine column, standard operations how to select
 */
var ImpositionCompositeColumn = /** @class */ (function (_super) {
    __extends(ImpositionCompositeColumn, _super);
    function ImpositionCompositeColumn(id, desc) {
        return _super.call(this, id, integrateDefaults(desc, {
            renderer: 'number',
            groupRenderer: 'boxplot',
            summaryRenderer: 'histogram',
        })) || this;
    }
    ImpositionCompositeColumn_1 = ImpositionCompositeColumn;
    Object.defineProperty(ImpositionCompositeColumn.prototype, "label", {
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
    Object.defineProperty(ImpositionCompositeColumn.prototype, "wrapper", {
        get: function () {
            var _a;
            return (_a = this._children.find(isNumberColumn)) !== null && _a !== void 0 ? _a : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ImpositionCompositeColumn.prototype, "rest", {
        get: function () {
            var w = this.wrapper;
            return this._children.filter(function (d) { return d !== w; });
        },
        enumerable: false,
        configurable: true
    });
    ImpositionCompositeColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([ImpositionCompositeColumn_1.EVENT_MAPPING_CHANGED, ImpositionCompositeColumn_1.EVENT_COLOR_MAPPING_CHANGED]);
    };
    ImpositionCompositeColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    ImpositionCompositeColumn.prototype.getLabel = function (row) {
        var c = this._children;
        if (c.length === 0) {
            return '';
        }
        if (c.length === 1) {
            return c[0].getLabel(row);
        }
        var w = this.wrapper;
        var rest = this.rest;
        return "".concat(w ? w.getLabel(row) : '?', " (").concat(rest.map(function (c) { return "".concat(c.label, " = ").concat(c.getLabel(row)); }).join(', '), ")");
    };
    ImpositionCompositeColumn.prototype.getColor = function (row) {
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
    ImpositionCompositeColumn.prototype.getNumberFormat = function () {
        var w = this.wrapper;
        return w ? w.getNumberFormat() : DEFAULT_FORMATTER;
    };
    ImpositionCompositeColumn.prototype.getValue = function (row) {
        var w = this.wrapper;
        return w ? w.getValue(row) : NaN;
    };
    ImpositionCompositeColumn.prototype.getNumber = function (row) {
        var w = this.wrapper;
        return w ? w.getNumber(row) : NaN;
    };
    ImpositionCompositeColumn.prototype.getRawNumber = function (row) {
        var w = this.wrapper;
        return w ? w.getRawNumber(row) : NaN;
    };
    ImpositionCompositeColumn.prototype.iterNumber = function (row) {
        return [this.getNumber(row)];
    };
    ImpositionCompositeColumn.prototype.iterRawNumber = function (row) {
        return [this.getRawNumber(row)];
    };
    ImpositionCompositeColumn.prototype.getExportValue = function (row, format) {
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
    ImpositionCompositeColumn.prototype.getMapping = function () {
        var w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.getMapping() : new ScaleMappingFunction();
    };
    ImpositionCompositeColumn.prototype.getOriginalMapping = function () {
        var w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.getOriginalMapping() : new ScaleMappingFunction();
    };
    ImpositionCompositeColumn.prototype.setMapping = function (mapping) {
        var w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.setMapping(mapping) : undefined;
    };
    ImpositionCompositeColumn.prototype.getColorMapping = function () {
        var w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.getColorMapping() : DEFAULT_COLOR_FUNCTION;
    };
    ImpositionCompositeColumn.prototype.setColorMapping = function (mapping) {
        var w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.setColorMapping(mapping) : undefined;
    };
    ImpositionCompositeColumn.prototype.getFilter = function () {
        var w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.getFilter() : noNumberFilter();
    };
    ImpositionCompositeColumn.prototype.setFilter = function (value) {
        var w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.setFilter(value) : undefined;
    };
    ImpositionCompositeColumn.prototype.getRange = function () {
        var w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.getRange() : ['0', '1'];
    };
    ImpositionCompositeColumn.prototype.toCompareValue = function (row) {
        return NumberColumn.prototype.toCompareValue.call(this, row);
    };
    ImpositionCompositeColumn.prototype.toCompareValueType = function () {
        return NumberColumn.prototype.toCompareValueType.call(this);
    };
    ImpositionCompositeColumn.prototype.toCompareGroupValue = function (rows, group) {
        return NumberColumn.prototype.toCompareGroupValue.call(this, rows, group);
    };
    ImpositionCompositeColumn.prototype.toCompareGroupValueType = function () {
        return NumberColumn.prototype.toCompareGroupValueType.call(this);
    };
    ImpositionCompositeColumn.prototype.insert = function (col, index) {
        if (this._children.length === 1 && !this.wrapper && !isNumberColumn(col)) {
            // at least one has to be a number column
            return null;
        }
        if (this._children.length >= 2) {
            // limit to two
            return null;
        }
        return _super.prototype.insert.call(this, col, index);
    };
    ImpositionCompositeColumn.prototype.insertImpl = function (col, index) {
        if (isNumberColumn(col)) {
            this.forward.apply(this, __spreadArray([col], suffix('.impose', NumberColumn.EVENT_MAPPING_CHANGED), false));
        }
        if (isMapAbleColumn(col)) {
            this.forward.apply(this, __spreadArray([col], suffix('.impose', NumberColumn.EVENT_COLOR_MAPPING_CHANGED), false));
        }
        return _super.prototype.insertImpl.call(this, col, index);
    };
    ImpositionCompositeColumn.prototype.removeImpl = function (child, index) {
        if (isNumberColumn(child)) {
            this.unforward.apply(this, __spreadArray([child], suffix('.impose', NumberColumn.EVENT_MAPPING_CHANGED), false));
        }
        if (isMapAbleColumn(child)) {
            this.unforward.apply(this, __spreadArray([child], suffix('.impose', NumberColumn.EVENT_COLOR_MAPPING_CHANGED), false));
        }
        return _super.prototype.removeImpl.call(this, child, index);
    };
    var ImpositionCompositeColumn_1;
    ImpositionCompositeColumn.EVENT_MAPPING_CHANGED = NumberColumn.EVENT_MAPPING_CHANGED;
    ImpositionCompositeColumn.EVENT_COLOR_MAPPING_CHANGED = NumberColumn.EVENT_COLOR_MAPPING_CHANGED;
    ImpositionCompositeColumn = ImpositionCompositeColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'filterNumber', 'colorMapped', 'editMapping'),
        SortByDefault('descending')
    ], ImpositionCompositeColumn);
    return ImpositionCompositeColumn;
}(CompositeColumn));
export default ImpositionCompositeColumn;
//# sourceMappingURL=ImpositionCompositeColumn.js.map