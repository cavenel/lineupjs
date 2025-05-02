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
import { format } from 'd3-format';
import CompositeColumn from './CompositeColumn';
import { isMissingValue } from './missing';
import NumberColumn from './NumberColumn';
import { SortByDefault, toolbar } from './annotations';
/**
 * implementation of a combine column, standard operations how to select
 */
var CompositeNumberColumn = /** @class */ (function (_super) {
    __extends(CompositeNumberColumn, _super);
    function CompositeNumberColumn(id, desc) {
        var _this = _super.call(this, id, desc) || this;
        _this.numberFormat = format('.3n');
        if (desc.numberFormat) {
            _this.numberFormat = format(desc.numberFormat);
        }
        return _this;
    }
    CompositeNumberColumn.prototype.getNumberFormat = function () {
        return this.numberFormat;
    };
    CompositeNumberColumn.prototype.getLabel = function (row) {
        if (!this.isLoaded()) {
            return '';
        }
        var v = this.getValue(row);
        //keep non number if it is not a number else convert using formatter
        return String(typeof v === 'number' && !Number.isNaN(v) && isFinite(v) ? this.numberFormat(v) : v);
    };
    CompositeNumberColumn.prototype.getValue = function (row) {
        if (!this.isLoaded()) {
            return null;
        }
        //weighted sum
        var v = this.compute(row);
        if (isMissingValue(v)) {
            return null;
        }
        return v;
    };
    CompositeNumberColumn.prototype.compute = function (_row) {
        return NaN;
    };
    CompositeNumberColumn.prototype.getNumber = function (row) {
        var r = this.getValue(row);
        return r == null ? NaN : r;
    };
    CompositeNumberColumn.prototype.getRawNumber = function (row) {
        return this.getNumber(row);
    };
    CompositeNumberColumn.prototype.iterNumber = function (row) {
        return [this.getNumber(row)];
    };
    CompositeNumberColumn.prototype.iterRawNumber = function (row) {
        return [this.getRawNumber(row)];
    };
    CompositeNumberColumn.prototype.getExportValue = function (row, format) {
        if (format === 'json') {
            return {
                value: this.getRawNumber(row),
                children: this.children.map(function (d) { return d.getExportValue(row, format); }),
            };
        }
        return _super.prototype.getExportValue.call(this, row, format);
    };
    CompositeNumberColumn.prototype.toCompareValue = function (row) {
        return NumberColumn.prototype.toCompareValue.call(this, row);
    };
    CompositeNumberColumn.prototype.toCompareValueType = function () {
        return NumberColumn.prototype.toCompareValueType.call(this);
    };
    CompositeNumberColumn.prototype.toCompareGroupValue = function (rows, group) {
        return NumberColumn.prototype.toCompareGroupValue.call(this, rows, group);
    };
    CompositeNumberColumn.prototype.toCompareGroupValueType = function () {
        return NumberColumn.prototype.toCompareGroupValueType.call(this);
    };
    CompositeNumberColumn.prototype.getRenderer = function () {
        return NumberColumn.prototype.getRenderer.call(this);
    };
    CompositeNumberColumn = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'group', 'groupBy'),
        SortByDefault('descending')
    ], CompositeNumberColumn);
    return CompositeNumberColumn;
}(CompositeColumn));
export default CompositeNumberColumn;
//# sourceMappingURL=CompositeNumberColumn.js.map