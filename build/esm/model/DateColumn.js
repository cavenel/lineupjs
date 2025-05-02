var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DateColumn_1;
import { timeFormat, timeParse } from 'd3-time-format';
import { equal } from '../internal';
import { Category, dialogAddons, toolbar } from './annotations';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged, DEFAULT_COLOR, } from './Column';
import { defaultGroup, ECompareValueType, } from './interfaces';
import { isMissingValue, isUnknown, missingGroup } from './missing';
import ValueColumn from './ValueColumn';
import { noDateFilter, defaultDateGrouper, isDummyDateFilter, isDefaultDateGrouper, restoreDateFilter, isEqualDateFilter, isDateIncluded, toDateGroup, chooseAggregatedDate, } from './internalDate';
import { integrateDefaults } from './internal';
let DateColumn = DateColumn_1 = class DateColumn extends ValueColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            groupRenderer: 'datehistogram',
            summaryRenderer: 'datehistogram',
        }));
        /**
         * currently active filter
         * @type {{min: number, max: number}}
         * @private
         */
        this.currentFilter = noDateFilter();
        this.currentGrouper = defaultDateGrouper();
        const f = timeFormat(desc.dateFormat || DateColumn_1.DEFAULT_DATE_FORMAT);
        this.format = (v) => (v instanceof Date ? f(v) : '');
        this.parse = desc.dateParse
            ? timeParse(desc.dateParse)
            : timeParse(desc.dateFormat || DateColumn_1.DEFAULT_DATE_FORMAT);
    }
    getFormatter() {
        return this.format;
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.filter = isDummyDateFilter(this.currentFilter) ? null : this.currentFilter;
        if (this.currentGrouper && !isDefaultDateGrouper(this.currentGrouper)) {
            r.grouper = this.currentGrouper;
        }
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        if (dump.filter) {
            this.currentFilter = restoreDateFilter(dump.filter);
        }
        if (dump.grouper) {
            this.currentGrouper = dump.grouper;
        }
    }
    createEventList() {
        return super.createEventList().concat([DateColumn_1.EVENT_FILTER_CHANGED, DateColumn_1.EVENT_GROUPING_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getValue(row) {
        return this.getDate(row);
    }
    getDate(row) {
        const v = super.getValue(row);
        if (isMissingValue(v)) {
            return null;
        }
        if (v instanceof Date) {
            return v;
        }
        return this.parse(String(v));
    }
    iterDate(row) {
        return [this.getDate(row)];
    }
    getLabel(row) {
        const v = this.getValue(row);
        return this.format(v);
    }
    isFiltered() {
        return !isDummyDateFilter(this.currentFilter);
    }
    clearFilter() {
        const was = this.isFiltered();
        this.setFilter(null);
        return was;
    }
    getFilter() {
        return Object.assign({}, this.currentFilter);
    }
    setFilter(value) {
        value = value || { min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY, filterMissing: false };
        if (isEqualDateFilter(value, this.currentFilter)) {
            return;
        }
        const bak = this.getFilter();
        this.currentFilter.min = isUnknown(value.min) ? Number.NEGATIVE_INFINITY : value.min;
        this.currentFilter.max = isUnknown(value.max) ? Number.POSITIVE_INFINITY : value.max;
        this.currentFilter.filterMissing = value.filterMissing;
        this.fire([DateColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, this.getFilter());
    }
    /**
     * filter the current row if any filter is set
     * @param row
     * @returns {boolean}
     */
    filter(row, valueCache) {
        return isDateIncluded(this.currentFilter, valueCache !== undefined ? valueCache : this.getDate(row));
    }
    toCompareValue(row, valueCache) {
        const v = valueCache !== undefined ? valueCache : this.getValue(row);
        if (!(v instanceof Date)) {
            return NaN;
        }
        return v.getTime();
    }
    toCompareValueType() {
        return ECompareValueType.DOUBLE_ASC;
    }
    getDateGrouper() {
        return Object.assign({}, this.currentGrouper);
    }
    setDateGrouper(value) {
        if (equal(this.currentGrouper, value)) {
            return;
        }
        const bak = this.getDateGrouper();
        this.currentGrouper = Object.assign({}, value);
        this.fire([DateColumn_1.EVENT_GROUPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, value);
    }
    group(row, valueCache) {
        const v = valueCache !== undefined ? valueCache : this.getDate(row);
        if (!v || !(v instanceof Date)) {
            return Object.assign({}, missingGroup);
        }
        if (!this.currentGrouper) {
            return Object.assign({}, defaultGroup);
        }
        const g = toDateGroup(this.currentGrouper, v);
        return {
            name: g.name,
            color: DEFAULT_COLOR,
        };
    }
    toCompareGroupValue(rows, _group, valueCache) {
        const v = chooseAggregatedDate(rows, this.currentGrouper, this, valueCache).value;
        return v == null ? NaN : v;
    }
    toCompareGroupValueType() {
        return ECompareValueType.DOUBLE_ASC;
    }
};
DateColumn.EVENT_FILTER_CHANGED = 'filterChanged';
DateColumn.EVENT_GROUPING_CHANGED = 'groupingChanged';
DateColumn.DEFAULT_DATE_FORMAT = '%x';
DateColumn = DateColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'groupBy', 'sortGroupBy', 'filterDate'),
    dialogAddons('group', 'groupDate'),
    Category('date')
], DateColumn);
export default DateColumn;
