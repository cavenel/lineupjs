var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StringColumn_1;
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
let StringColumn = StringColumn_1 = class StringColumn extends ValueColumn {
    constructor(id, desc) {
        var _a;
        super(id, integrateDefaults(desc, {
            width: 200,
        }));
        this.currentFilter = null;
        this.currentGroupCriteria = {
            type: EStringGroupCriteriaType.startsWith,
            values: [],
        };
        this.alignment = (_a = desc.alignment) !== null && _a !== void 0 ? _a : EAlignment.left;
        this.escape = desc.escape !== false;
    }
    createEventList() {
        return super.createEventList().concat([StringColumn_1.EVENT_GROUPING_CHANGED, StringColumn_1.EVENT_FILTER_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getValue(row) {
        const v = super.getValue(row);
        return isMissingValue(v) ? null : String(v);
    }
    getLabel(row) {
        return this.getValue(row) || '';
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        if (this.currentFilter instanceof RegExp) {
            r.filter = `REGEX:${this.currentFilter.source}`;
        }
        else {
            r.filter = this.currentFilter;
        }
        if (this.currentGroupCriteria) {
            const { type, values } = this.currentGroupCriteria;
            r.groupCriteria = {
                type,
                values: values.map((value) => value instanceof RegExp && type === EStringGroupCriteriaType.regex ? value.source : value),
            };
        }
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        if (dump.filter) {
            const filter = dump.filter;
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
                        filter,
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
            const { type, values } = dump.groupCriteria;
            this.currentGroupCriteria = {
                type,
                values: values.map((value) => type === EStringGroupCriteriaType.regex ? new RegExp(value, 'm') : value),
            };
        }
    }
    isFiltered() {
        return this.currentFilter != null;
    }
    filter(row) {
        if (!this.isFiltered()) {
            return true;
        }
        const r = this.getLabel(row);
        const filter = this.currentFilter;
        const ff = filter.filter;
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
    }
    getFilter() {
        return this.currentFilter;
    }
    setFilter(filter) {
        if (filter === this.currentFilter) {
            return;
        }
        const current = this.currentFilter || { filter: null, filterMissing: false };
        const target = filter || { filter: null, filterMissing: false };
        if (current.filterMissing === target.filterMissing &&
            (current.filter === target.filter ||
                (current.filter instanceof RegExp &&
                    target.filter instanceof RegExp &&
                    current.filter.source === target.filter.source))) {
            return;
        }
        this.fire([StringColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.currentFilter, (this.currentFilter = filter));
    }
    clearFilter() {
        const was = this.isFiltered();
        this.setFilter(null);
        return was;
    }
    getGroupCriteria() {
        return this.currentGroupCriteria;
    }
    setGroupCriteria(value) {
        if (equal(this.currentGroupCriteria, value) || value == null) {
            return;
        }
        const bak = this.getGroupCriteria();
        this.currentGroupCriteria = value;
        this.fire([StringColumn_1.EVENT_GROUPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, value);
    }
    group(row) {
        if (this.getValue(row) == null) {
            return Object.assign({}, missingGroup);
        }
        if (!this.currentGroupCriteria) {
            return Object.assign({}, othersGroup);
        }
        const value = this.getLabel(row);
        if (!value) {
            return Object.assign({}, missingGroup);
        }
        const { type, values } = this.currentGroupCriteria;
        if (type === EStringGroupCriteriaType.value) {
            return {
                name: value,
                color: defaultGroup.color,
            };
        }
        if (type === EStringGroupCriteriaType.startsWith) {
            for (const groupValue of values) {
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
        for (const groupValue of values) {
            if (!(groupValue instanceof RegExp) || !groupValue.test(value)) {
                continue;
            }
            return {
                name: groupValue.source,
                color: defaultGroup.color,
            };
        }
        return Object.assign({}, othersGroup);
    }
    toCompareValue(row) {
        const v = this.getValue(row);
        return v === '' || v == null ? null : v.toLowerCase();
    }
    toCompareValueType() {
        return ECompareValueType.STRING;
    }
    toCompareGroupValue(rows, _group, valueCache) {
        if (isSeqEmpty(rows)) {
            return null;
        }
        // take the smallest one
        if (valueCache) {
            return valueCache.reduce((acc, v) => (acc == null || v < acc ? v : acc), null);
        }
        return rows.reduce((acc, d) => {
            const v = this.getValue(d);
            return acc == null || (v != null && v < acc) ? v : acc;
        }, null);
    }
    toCompareGroupValueType() {
        return ECompareValueType.STRING;
    }
};
StringColumn.EVENT_FILTER_CHANGED = 'filterChanged';
StringColumn.EVENT_GROUPING_CHANGED = 'groupingChanged';
//magic key for filtering missing ones
StringColumn.FILTER_MISSING = '__FILTER_MISSING';
StringColumn = StringColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'search', 'groupBy', 'sortGroupBy', 'filterString'),
    dialogAddons('group', 'groupString'),
    Category('string')
], StringColumn);
export default StringColumn;
