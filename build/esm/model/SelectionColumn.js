var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SelectionColumn_1;
import { Category, SupportType, toolbar } from './annotations';
import { ECompareValueType, } from './interfaces';
import Column from './Column';
import ValueColumn from './ValueColumn';
import { integrateDefaults } from './internal';
/**
 * factory for creating a description creating a rank column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createSelectionDesc(label = 'Selections') {
    return { type: 'selection', label };
}
/**
 * a checkbox column for selections
 */
let SelectionColumn = SelectionColumn_1 = class SelectionColumn extends ValueColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            width: 50,
        }));
        this.currentFilter = null;
    }
    get frozen() {
        return this.desc.frozen !== false;
    }
    createEventList() {
        return super.createEventList().concat([SelectionColumn_1.EVENT_SELECT, SelectionColumn_1.EVENT_FILTER_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    setValue(row, value) {
        const old = this.getValue(row);
        if (old === value) {
            return true;
        }
        return this.setImpl(row, value);
    }
    setValues(rows, value) {
        if (rows.length === 0) {
            return false;
        }
        if (this.desc.setterAll) {
            this.desc.setterAll(rows, value);
        }
        this.fire(SelectionColumn_1.EVENT_SELECT, rows[0], value, rows);
        return true;
    }
    setImpl(row, value) {
        if (this.desc.setter) {
            this.desc.setter(row.i, value);
        }
        this.fire(SelectionColumn_1.EVENT_SELECT, row.i, value);
        return true;
    }
    toggleValue(row) {
        const old = this.getValue(row);
        this.setImpl(row, !old);
        return !old;
    }
    toCompareValue(row) {
        const v = this.getValue(row) === true;
        return v ? 1 : 0;
    }
    toCompareValueType() {
        return ECompareValueType.BINARY;
    }
    group(row) {
        const isSelected = this.getValue(row);
        return Object.assign({}, isSelected ? SelectionColumn_1.SELECTED_GROUP : SelectionColumn_1.NOT_SELECTED_GROUP);
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.filter = this.currentFilter ? Array.from(this.currentFilter).sort((a, b) => a - b) : null;
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        if (dump.filter) {
            const filter = dump.filter;
            this.currentFilter = new Set(filter);
        }
        else {
            this.currentFilter = null;
        }
    }
    isFiltered() {
        return this.currentFilter != null;
    }
    filter(row) {
        if (!this.isFiltered()) {
            return true;
        }
        const filter = this.currentFilter;
        return filter.has(row.i);
    }
    getFilter() {
        return this.currentFilter == null ? null : Array.from(this.currentFilter);
    }
    setFilter(filter) {
        const newValue = filter ? new Set(filter) : null;
        if (areSameSets(newValue, this.currentFilter)) {
            return;
        }
        this.fire([SelectionColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.currentFilter, (this.currentFilter = newValue));
    }
    clearFilter() {
        const was = this.isFiltered();
        this.setFilter(null);
        return was;
    }
};
SelectionColumn.EVENT_FILTER_CHANGED = 'filterChanged';
SelectionColumn.EVENT_SELECT = 'select';
SelectionColumn.SELECTED_GROUP = {
    name: 'Selected',
    color: 'orange',
};
SelectionColumn.NOT_SELECTED_GROUP = {
    name: 'Unselected',
    color: 'gray',
};
SelectionColumn = SelectionColumn_1 = __decorate([
    SupportType(),
    toolbar('sort', 'sortBy', 'group', 'groupBy', 'clearSelection', 'invertSelection', 'filterSelection'),
    Category('support')
], SelectionColumn);
export default SelectionColumn;
function areSameSets(a, b) {
    const aL = a != null ? a.size : 0;
    const bL = b != null ? b.size : 0;
    if (aL !== bL) {
        return false;
    }
    if (aL === 0 || bL === 0) {
        return true;
    }
    return Array.from(a).every((d) => b.has(d));
}
