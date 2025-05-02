var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatesColumn_1;
import { timeFormat, timeParse } from 'd3-time-format';
import { median, min, max } from '../internal';
import { dialogAddons, toolbar } from './annotations';
import ArrayColumn, {} from './ArrayColumn';
import { ECompareValueType } from './interfaces';
import { isMissingValue } from './missing';
import DateColumn from './DateColumn';
import { noDateFilter, isDummyDateFilter, restoreDateFilter } from './internalDate';
import { chooseUIntByDataLength, integrateDefaults } from './internal';
export var EDateSort;
(function (EDateSort) {
    EDateSort["min"] = "min";
    EDateSort["max"] = "max";
    EDateSort["median"] = "median";
})(EDateSort || (EDateSort = {}));
let DatesColumn = DatesColumn_1 = class DatesColumn extends ArrayColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            renderer: 'datehistogram',
            groupRenderer: 'datehistogram',
            summaryRenderer: 'datehistogram',
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
        return super.createEventList().concat([DatesColumn_1.EVENT_SORTMETHOD_CHANGED, DatesColumn_1.EVENT_FILTER_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getValue(row) {
        const r = this.getDates(row);
        return r.every((d) => d == null) ? null : r;
    }
    getLabels(row) {
        return this.getDates(row).map((v) => (v instanceof Date ? this.format(v) : ''));
    }
    getDates(row) {
        return super.getValues(row).map((v) => {
            if (isMissingValue(v)) {
                return null;
            }
            if (v instanceof Date) {
                return v;
            }
            return this.parse(String(v));
        });
    }
    getDate(row) {
        const av = this.getDates(row).filter(Boolean);
        if (av.length === 0) {
            return null;
        }
        return new Date(compute(av, this.sort));
    }
    iterDate(row) {
        return this.getDates(row);
    }
    getSortMethod() {
        return this.sort;
    }
    setSortMethod(sort) {
        if (this.sort === sort) {
            return;
        }
        this.fire([DatesColumn_1.EVENT_SORTMETHOD_CHANGED], this.sort, (this.sort = sort));
        // sort by me if not already sorted by me
        if (!this.isSortedByMe().asc) {
            this.sortByMe();
        }
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
    toCompareValue(row) {
        const vs = this.getDates(row).filter(Boolean);
        if (!vs) {
            return [0, 0];
        }
        return [vs.length, compute(vs, this.sort)];
    }
    toCompareValueType() {
        return [chooseUIntByDataLength(this.dataLength), ECompareValueType.DOUBLE_ASC];
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
DatesColumn.EVENT_SORTMETHOD_CHANGED = 'sortMethodChanged';
DatesColumn.EVENT_FILTER_CHANGED = DateColumn.EVENT_FILTER_CHANGED;
DatesColumn = DatesColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'filterDate'),
    dialogAddons('sort', 'sortDates')
], DatesColumn);
export default DatesColumn;
function compute(arr, sort) {
    switch (sort) {
        case EDateSort.min:
            return min(arr, (d) => d.getTime());
        case EDateSort.max:
            return max(arr, (d) => d.getTime());
        case EDateSort.median:
            return median(arr, (d) => d.getTime());
    }
}
