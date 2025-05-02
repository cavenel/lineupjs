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
import { Category, toolbar, dialogAddons } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import { defaultGroup, ECompareValueType, othersGroup, } from './interfaces';
import { missingGroup, isMissingValue } from './missing';
import ValueColumn from './ValueColumn';
import { equal, isSeqEmpty } from '../internal';
import { integrateDefaults } from './internal';
export var EAlignment;
(function (EAlignment) {
    EAlignment["left"] = "left";
    EAlignment["center"] = "center";
    EAlignment["right"] = "right";
})(EAlignment || (EAlignment = {}));
export var EStringGroupCriteriaType;
(function (EStringGroupCriteriaType) {
    EStringGroupCriteriaType["value"] = "value";
    EStringGroupCriteriaType["startsWith"] = "startsWith";
    EStringGroupCriteriaType["regex"] = "regex";
})(EStringGroupCriteriaType || (EStringGroupCriteriaType = {}));
/**
 * a string column with optional alignment
 */
var StringColumn = /** @class */ (function (_super) {
    __extends(StringColumn, _super);
    function StringColumn(id, desc) {
        var _a;
        var _this = _super.call(this, id, integrateDefaults(desc, {
            width: 200,
        })) || this;
        _this.currentFilter = null;
        _this.currentGroupCriteria = {
            type: EStringGroupCriteriaType.startsWith,
            values: [],
        };
        _this.alignment = (_a = desc.alignment) !== null && _a !== void 0 ? _a : EAlignment.left;
        _this.escape = desc.escape !== false;
        return _this;
    }
    StringColumn_1 = StringColumn;
    StringColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([StringColumn_1.EVENT_GROUPING_CHANGED, StringColumn_1.EVENT_FILTER_CHANGED]);
    };
    StringColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    StringColumn.prototype.getValue = function (row) {
        var v = _super.prototype.getValue.call(this, row);
        return isMissingValue(v) ? null : String(v);
    };
    StringColumn.prototype.getLabel = function (row) {
        return this.getValue(row) || '';
    };
    StringColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        if (this.currentFilter instanceof RegExp) {
            r.filter = "REGEX:".concat(this.currentFilter.source);
        }
        else {
            r.filter = this.currentFilter;
        }
        if (this.currentGroupCriteria) {
            var _a = this.currentGroupCriteria, type_1 = _a.type, values = _a.values;
            r.groupCriteria = {
                type: type_1,
                values: values.map(function (value) {
                    return value instanceof RegExp && type_1 === EStringGroupCriteriaType.regex ? value.source : value;
                }),
            };
        }
        return r;
    };
    StringColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        if (dump.filter) {
            var filter = dump.filter;
            if (typeof filter === 'string') {
                // compatibility case
                if (filter.startsWith('REGEX:')) {
                    this.currentFilter = {
                        filter: new RegExp(filter.slice(6), 'm'),
                        filterMissing: false,
                    };
                }
                else if (filter === StringColumn_1.FILTER_MISSING) {
                    this.currentFilter = {
                        filter: null,
                        filterMissing: true,
                    };
                }
                else {
                    this.currentFilter = {
                        filter: filter,
                        filterMissing: false,
                    };
                }
            }
            else {
                this.currentFilter = {
                    filter: filter.filter && filter.filter.startsWith('REGEX:')
                        ? new RegExp(filter.slice(6), 'm')
                        : filter.filter || '',
                    filterMissing: filter.filterMissing === true,
                };
            }
        }
        else {
            this.currentFilter = null;
        }
        // tslint:disable-next-line: early-exit
        if (dump.groupCriteria) {
            var _a = dump.groupCriteria, type_2 = _a.type, values = _a.values;
            this.currentGroupCriteria = {
                type: type_2,
                values: values.map(function (value) {
                    return type_2 === EStringGroupCriteriaType.regex ? new RegExp(value, 'm') : value;
                }),
            };
        }
    };
    StringColumn.prototype.isFiltered = function () {
        return this.currentFilter != null;
    };
    StringColumn.prototype.filter = function (row) {
        if (!this.isFiltered()) {
            return true;
        }
        var r = this.getLabel(row);
        var filter = this.currentFilter;
        var ff = filter.filter;
        if (r == null || r.trim() === '') {
            return !filter.filterMissing;
        }
        if (!ff) {
            return true;
        }
        if (ff instanceof RegExp) {
            return r !== '' && r.match(ff) != null; // You can not use RegExp.test(), because of https://stackoverflow.com/a/6891667
        }
        return r !== '' && r.toLowerCase().includes(ff.toLowerCase());
    };
    StringColumn.prototype.getFilter = function () {
        return this.currentFilter;
    };
    StringColumn.prototype.setFilter = function (filter) {
        if (filter === this.currentFilter) {
            return;
        }
        var current = this.currentFilter || { filter: null, filterMissing: false };
        var target = filter || { filter: null, filterMissing: false };
        if (current.filterMissing === target.filterMissing &&
            (current.filter === target.filter ||
                (current.filter instanceof RegExp &&
                    target.filter instanceof RegExp &&
                    current.filter.source === target.filter.source))) {
            return;
        }
        this.fire([StringColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.currentFilter, (this.currentFilter = filter));
    };
    StringColumn.prototype.clearFilter = function () {
        var was = this.isFiltered();
        this.setFilter(null);
        return was;
    };
    StringColumn.prototype.getGroupCriteria = function () {
        return this.currentGroupCriteria;
    };
    StringColumn.prototype.setGroupCriteria = function (value) {
        if (equal(this.currentGroupCriteria, value) || value == null) {
            return;
        }
        var bak = this.getGroupCriteria();
        this.currentGroupCriteria = value;
        this.fire([StringColumn_1.EVENT_GROUPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, value);
    };
    StringColumn.prototype.group = function (row) {
        if (this.getValue(row) == null) {
            return Object.assign({}, missingGroup);
        }
        if (!this.currentGroupCriteria) {
            return Object.assign({}, othersGroup);
        }
        var value = this.getLabel(row);
        if (!value) {
            return Object.assign({}, missingGroup);
        }
        var _a = this.currentGroupCriteria, type = _a.type, values = _a.values;
        if (type === EStringGroupCriteriaType.value) {
            return {
                name: value,
                color: defaultGroup.color,
            };
        }
        if (type === EStringGroupCriteriaType.startsWith) {
            for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                var groupValue = values_1[_i];
                if (typeof groupValue !== 'string' || !value.startsWith(groupValue)) {
                    continue;
                }
                return {
                    name: groupValue,
                    color: defaultGroup.color,
                };
            }
            return Object.assign({}, othersGroup);
        }
        for (var _b = 0, values_2 = values; _b < values_2.length; _b++) {
            var groupValue = values_2[_b];
            if (!(groupValue instanceof RegExp) || !groupValue.test(value)) {
                continue;
            }
            return {
                name: groupValue.source,
                color: defaultGroup.color,
            };
        }
        return Object.assign({}, othersGroup);
    };
    StringColumn.prototype.toCompareValue = function (row) {
        var v = this.getValue(row);
        return v === '' || v == null ? null : v.toLowerCase();
    };
    StringColumn.prototype.toCompareValueType = function () {
        return ECompareValueType.STRING;
    };
    StringColumn.prototype.toCompareGroupValue = function (rows, _group, valueCache) {
        var _this = this;
        if (isSeqEmpty(rows)) {
            return null;
        }
        // take the smallest one
        if (valueCache) {
            return valueCache.reduce(function (acc, v) { return (acc == null || v < acc ? v : acc); }, null);
        }
        return rows.reduce(function (acc, d) {
            var v = _this.getValue(d);
            return acc == null || (v != null && v < acc) ? v : acc;
        }, null);
    };
    StringColumn.prototype.toCompareGroupValueType = function () {
        return ECompareValueType.STRING;
    };
    var StringColumn_1;
    StringColumn.EVENT_FILTER_CHANGED = 'filterChanged';
    StringColumn.EVENT_GROUPING_CHANGED = 'groupingChanged';
    //magic key for filtering missing ones
    StringColumn.FILTER_MISSING = '__FILTER_MISSING';
    StringColumn = StringColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'search', 'groupBy', 'sortGroupBy', 'filterString'),
        dialogAddons('group', 'groupString'),
        Category('string')
    ], StringColumn);
    return StringColumn;
}(ValueColumn));
export default StringColumn;
//# sourceMappingURL=StringColumn.js.map