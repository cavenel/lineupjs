var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatesMapColumn_1;
import { timeFormat, timeParse } from 'd3-time-format';
import MapColumn, {} from './MapColumn';
import { isMissingValue } from './missing';
import DatesColumn, { EDateSort } from './DatesColumn';
import DateColumn from './DateColumn';
import { dialogAddons, toolbar } from './annotations';
import { noDateFilter, isDummyDateFilter, restoreDateFilter } from './internalDate';
import { integrateDefaults } from './internal';
let DatesMapColumn = DatesMapColumn_1 = class DatesMapColumn extends MapColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            renderer: 'default',
        }));
        this.currentFilter = noDateFilter();
        const f = timeFormat(desc.dateFormat || DateColumn.DEFAULT_DATE_FORMAT);
        this.format = (v) => (v instanceof Date ? f(v) : '');
        this.parse = desc.dateParse
            ? timeParse(desc.dateParse)
            : timeParse(desc.dateFormat || DateColumn.DEFAULT_DATE_FORMAT);
        this.sort = desc.sort || EDateSort.median;
    }
    getFormatter() {
        return this.format;
    }
    createEventList() {
        return super
            .createEventList()
            .concat([DatesMapColumn_1.EVENT_SORTMETHOD_CHANGED, DatesMapColumn_1.EVENT_FILTER_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    parseValue(v) {
        if (isMissingValue(v)) {
            return null;
        }
        if (v instanceof Date) {
            return v;
        }
        return this.parse(String(v));
    }
    getDateMap(row) {
        return super.getMap(row).map(({ key, value }) => ({
            key,
            value: this.parseValue(value),
        }));
    }
    iterDate(row) {
        return this.getDates(row);
    }
    getValue(row) {
        const r = this.getDateMap(row);
        return r.every((d) => d == null) ? null : r;
    }
    getLabels(row) {
        return this.getDateMap(row).map(({ key, value }) => ({
            key,
            value: value instanceof Date ? this.format(value) : '',
        }));
    }
    getDates(row) {
        return this.getDateMap(row).map((v) => v.value);
    }
    getDate(row) {
        return DatesColumn.prototype.getDate.call(this, row);
    }
    getSortMethod() {
        return this.sort;
    }
    setSortMethod(sort) {
        return DatesColumn.prototype.setSortMethod.call(this, sort);
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.sortMethod = this.getSortMethod();
        r.filter = !isDummyDateFilter(this.currentFilter) ? this.currentFilter : null;
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        if (dump.sortMethod) {
            this.sort = dump.sortMethod;
        }
        if (dump.filter) {
            this.currentFilter = restoreDateFilter(dump.filter);
        }
    }
    isFiltered() {
        return DateColumn.prototype.isFiltered.call(this);
    }
    getFilter() {
        return DateColumn.prototype.getFilter.call(this);
    }
    setFilter(value) {
        DateColumn.prototype.setFilter.call(this, value);
    }
    filter(row) {
        return DateColumn.prototype.filter.call(this, row);
    }
    clearFilter() {
        return DateColumn.prototype.clearFilter.call(this);
    }
};
DatesMapColumn.EVENT_SORTMETHOD_CHANGED = DatesColumn.EVENT_SORTMETHOD_CHANGED;
DatesMapColumn.EVENT_FILTER_CHANGED = DateColumn.EVENT_FILTER_CHANGED;
DatesMapColumn = DatesMapColumn_1 = __decorate([
    toolbar('rename', 'filterDate'),
    dialogAddons('sort', 'sortDates')
], DatesMapColumn);
export default DatesMapColumn;
