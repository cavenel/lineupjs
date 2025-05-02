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
var DatesColumn = /** @class */ (function (_super) {
    __extends(DatesColumn, _super);
    function DatesColumn(id, desc) {
        var _this = _super.call(this, id, integrateDefaults(desc, {
            renderer: 'datehistogram',
            groupRenderer: 'datehistogram',
            summaryRenderer: 'datehistogram',
        })) || this;
        _this.currentFilter = noDateFilter();
        var f = timeFormat(desc.dateFormat || DateColumn.DEFAULT_DATE_FORMAT);
        _this.format = function (v) { return (v instanceof Date ? f(v) : ''); };
        _this.parse = desc.dateParse
            ? timeParse(desc.dateParse)
            : timeParse(desc.dateFormat || DateColumn.DEFAULT_DATE_FORMAT);
        _this.sort = desc.sort || EDateSort.median;
        return _this;
    }
    DatesColumn_1 = DatesColumn;
    DatesColumn.prototype.getFormatter = function () {
        return this.format;
    };
    DatesColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([DatesColumn_1.EVENT_SORTMETHOD_CHANGED, DatesColumn_1.EVENT_FILTER_CHANGED]);
    };
    DatesColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    DatesColumn.prototype.getValue = function (row) {
        var r = this.getDates(row);
        return r.every(function (d) { return d == null; }) ? null : r;
    };
    DatesColumn.prototype.getLabels = function (row) {
        var _this = this;
        return this.getDates(row).map(function (v) { return (v instanceof Date ? _this.format(v) : ''); });
    };
    DatesColumn.prototype.getDates = function (row) {
        var _this = this;
        return _super.prototype.getValues.call(this, row).map(function (v) {
            if (isMissingValue(v)) {
                return null;
            }
            if (v instanceof Date) {
                return v;
            }
            return _this.parse(String(v));
        });
    };
    DatesColumn.prototype.getDate = function (row) {
        var av = this.getDates(row).filter(Boolean);
        if (av.length === 0) {
            return null;
        }
        return new Date(compute(av, this.sort));
    };
    DatesColumn.prototype.iterDate = function (row) {
        return this.getDates(row);
    };
    DatesColumn.prototype.getSortMethod = function () {
        return this.sort;
    };
    DatesColumn.prototype.setSortMethod = function (sort) {
        if (this.sort === sort) {
            return;
        }
        this.fire([DatesColumn_1.EVENT_SORTMETHOD_CHANGED], this.sort, (this.sort = sort));
        // sort by me if not already sorted by me
        if (!this.isSortedByMe().asc) {
            this.sortByMe();
        }
    };
    DatesColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.sortMethod = this.getSortMethod();
        r.filter = !isDummyDateFilter(this.currentFilter) ? this.currentFilter : null;
        return r;
    };
    DatesColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        if (dump.sortMethod) {
            this.sort = dump.sortMethod;
        }
        if (dump.filter) {
            this.currentFilter = restoreDateFilter(dump.filter);
        }
    };
    DatesColumn.prototype.toCompareValue = function (row) {
        var vs = this.getDates(row).filter(Boolean);
        if (!vs) {
            return [0, 0];
        }
        return [vs.length, compute(vs, this.sort)];
    };
    DatesColumn.prototype.toCompareValueType = function () {
        return [chooseUIntByDataLength(this.dataLength), ECompareValueType.DOUBLE_ASC];
    };
    DatesColumn.prototype.isFiltered = function () {
        return DateColumn.prototype.isFiltered.call(this);
    };
    DatesColumn.prototype.getFilter = function () {
        return DateColumn.prototype.getFilter.call(this);
    };
    DatesColumn.prototype.setFilter = function (value) {
        DateColumn.prototype.setFilter.call(this, value);
    };
    DatesColumn.prototype.filter = function (row) {
        return DateColumn.prototype.filter.call(this, row);
    };
    DatesColumn.prototype.clearFilter = function () {
        return DateColumn.prototype.clearFilter.call(this);
    };
    var DatesColumn_1;
    DatesColumn.EVENT_SORTMETHOD_CHANGED = 'sortMethodChanged';
    DatesColumn.EVENT_FILTER_CHANGED = DateColumn.EVENT_FILTER_CHANGED;
    DatesColumn = DatesColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'filterDate'),
        dialogAddons('sort', 'sortDates')
    ], DatesColumn);
    return DatesColumn;
}(ArrayColumn));
export default DatesColumn;
function compute(arr, sort) {
    switch (sort) {
        case EDateSort.min:
            return min(arr, function (d) { return d.getTime(); });
        case EDateSort.max:
            return max(arr, function (d) { return d.getTime(); });
        case EDateSort.median:
            return median(arr, function (d) { return d.getTime(); });
    }
}
//# sourceMappingURL=DatesColumn.js.map