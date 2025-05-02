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
import { timeFormat, timeParse } from 'd3-time-format';
import { equal } from '../internal';
import { Category, dialogAddons, toolbar } from './annotations';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged, DEFAULT_COLOR, } from './Column';
import { defaultGroup, ECompareValueType, } from './interfaces';
import { isMissingValue, isUnknown, missingGroup } from './missing';
import ValueColumn from './ValueColumn';
import { noDateFilter, defaultDateGrouper, isDummyDateFilter, isDefaultDateGrouper, restoreDateFilter, isEqualDateFilter, isDateIncluded, toDateGroup, chooseAggregatedDate, } from './internalDate';
import { integrateDefaults } from './internal';
var DateColumn = /** @class */ (function (_super) {
    __extends(DateColumn, _super);
    function DateColumn(id, desc) {
        var _this = _super.call(this, id, integrateDefaults(desc, {
            groupRenderer: 'datehistogram',
            summaryRenderer: 'datehistogram',
        })) || this;
        /**
         * currently active filter
         * @type {{min: number, max: number}}
         * @private
         */
        _this.currentFilter = noDateFilter();
        _this.currentGrouper = defaultDateGrouper();
        var f = timeFormat(desc.dateFormat || DateColumn_1.DEFAULT_DATE_FORMAT);
        _this.format = function (v) { return (v instanceof Date ? f(v) : ''); };
        _this.parse = desc.dateParse
            ? timeParse(desc.dateParse)
            : timeParse(desc.dateFormat || DateColumn_1.DEFAULT_DATE_FORMAT);
        return _this;
    }
    DateColumn_1 = DateColumn;
    DateColumn.prototype.getFormatter = function () {
        return this.format;
    };
    DateColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.filter = isDummyDateFilter(this.currentFilter) ? null : this.currentFilter;
        if (this.currentGrouper && !isDefaultDateGrouper(this.currentGrouper)) {
            r.grouper = this.currentGrouper;
        }
        return r;
    };
    DateColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        if (dump.filter) {
            this.currentFilter = restoreDateFilter(dump.filter);
        }
        if (dump.grouper) {
            this.currentGrouper = dump.grouper;
        }
    };
    DateColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([DateColumn_1.EVENT_FILTER_CHANGED, DateColumn_1.EVENT_GROUPING_CHANGED]);
    };
    DateColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    DateColumn.prototype.getValue = function (row) {
        return this.getDate(row);
    };
    DateColumn.prototype.getDate = function (row) {
        var v = _super.prototype.getValue.call(this, row);
        if (isMissingValue(v)) {
            return null;
        }
        if (v instanceof Date) {
            return v;
        }
        return this.parse(String(v));
    };
    DateColumn.prototype.iterDate = function (row) {
        return [this.getDate(row)];
    };
    DateColumn.prototype.getLabel = function (row) {
        var v = this.getValue(row);
        return this.format(v);
    };
    DateColumn.prototype.isFiltered = function () {
        return !isDummyDateFilter(this.currentFilter);
    };
    DateColumn.prototype.clearFilter = function () {
        var was = this.isFiltered();
        this.setFilter(null);
        return was;
    };
    DateColumn.prototype.getFilter = function () {
        return Object.assign({}, this.currentFilter);
    };
    DateColumn.prototype.setFilter = function (value) {
        value = value || { min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY, filterMissing: false };
        if (isEqualDateFilter(value, this.currentFilter)) {
            return;
        }
        var bak = this.getFilter();
        this.currentFilter.min = isUnknown(value.min) ? Number.NEGATIVE_INFINITY : value.min;
        this.currentFilter.max = isUnknown(value.max) ? Number.POSITIVE_INFINITY : value.max;
        this.currentFilter.filterMissing = value.filterMissing;
        this.fire([DateColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, this.getFilter());
    };
    /**
     * filter the current row if any filter is set
     * @param row
     * @returns {boolean}
     */
    DateColumn.prototype.filter = function (row, valueCache) {
        return isDateIncluded(this.currentFilter, valueCache !== undefined ? valueCache : this.getDate(row));
    };
    DateColumn.prototype.toCompareValue = function (row, valueCache) {
        var v = valueCache !== undefined ? valueCache : this.getValue(row);
        if (!(v instanceof Date)) {
            return NaN;
        }
        return v.getTime();
    };
    DateColumn.prototype.toCompareValueType = function () {
        return ECompareValueType.DOUBLE_ASC;
    };
    DateColumn.prototype.getDateGrouper = function () {
        return Object.assign({}, this.currentGrouper);
    };
    DateColumn.prototype.setDateGrouper = function (value) {
        if (equal(this.currentGrouper, value)) {
            return;
        }
        var bak = this.getDateGrouper();
        this.currentGrouper = Object.assign({}, value);
        this.fire([DateColumn_1.EVENT_GROUPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, value);
    };
    DateColumn.prototype.group = function (row, valueCache) {
        var v = valueCache !== undefined ? valueCache : this.getDate(row);
        if (!v || !(v instanceof Date)) {
            return Object.assign({}, missingGroup);
        }
        if (!this.currentGrouper) {
            return Object.assign({}, defaultGroup);
        }
        var g = toDateGroup(this.currentGrouper, v);
        return {
            name: g.name,
            color: DEFAULT_COLOR,
        };
    };
    DateColumn.prototype.toCompareGroupValue = function (rows, _group, valueCache) {
        var v = chooseAggregatedDate(rows, this.currentGrouper, this, valueCache).value;
        return v == null ? NaN : v;
    };
    DateColumn.prototype.toCompareGroupValueType = function () {
        return ECompareValueType.DOUBLE_ASC;
    };
    var DateColumn_1;
    DateColumn.EVENT_FILTER_CHANGED = 'filterChanged';
    DateColumn.EVENT_GROUPING_CHANGED = 'groupingChanged';
    DateColumn.DEFAULT_DATE_FORMAT = '%x';
    DateColumn = DateColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'groupBy', 'sortGroupBy', 'filterDate'),
        dialogAddons('group', 'groupDate'),
        Category('date')
    ], DateColumn);
    return DateColumn;
}(ValueColumn));
export default DateColumn;
//# sourceMappingURL=DateColumn.js.map