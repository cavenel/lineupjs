var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SetColumn_1;
import { Category, toolbar } from './annotations';
import CategoricalColumn from './CategoricalColumn';
import Column, { labelChanged, metaDataChanged, dirty, widthChanged, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, DEFAULT_COLOR, } from './Column';
import { ECompareValueType } from './interfaces';
import ValueColumn from './ValueColumn';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import { toCategories, isCategoryIncluded, isEqualSetCategoricalFilter } from './internalCategorical';
import { chooseUIntByDataLength, integrateDefaults } from './internal';
/**
 * a string column with optional alignment
 */
let SetColumn = SetColumn_1 = class SetColumn extends ValueColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            renderer: 'upset',
            groupRenderer: 'upset',
            summaryRenderer: 'categorical',
        }));
        this.lookup = new Map();
        /**
         * set of categories to show
         * @type {null}
         * @private
         */
        this.currentFilter = null;
        this.separator = new RegExp(desc.separator || ';');
        this.categories = toCategories(desc);
        this.categories.forEach((d) => this.lookup.set(d.name, d));
        this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
    }
    createEventList() {
        return super.createEventList().concat([SetColumn_1.EVENT_COLOR_MAPPING_CHANGED, SetColumn_1.EVENT_FILTER_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    get labels() {
        return this.categories.map((d) => d.label);
    }
    get dataLength() {
        return this.categories.length;
    }
    getValue(row) {
        const v = this.getSortedSet(row);
        if (v.length === 0) {
            return null;
        }
        return v.map((d) => d.name);
    }
    getLabel(row) {
        return `(${this.getSortedSet(row)
            .map((d) => d.label)
            .join(',')})`;
    }
    normalize(v) {
        if (typeof v === 'string') {
            return v.split(this.separator).map((s) => s.trim());
        }
        if (Array.isArray(v)) {
            return v.map((v) => String(v).trim());
        }
        if (v instanceof Set) {
            return Array.from(v).map(String);
        }
        return [];
    }
    getSet(row) {
        const sv = this.normalize(super.getValue(row));
        const r = new Set();
        sv.forEach((n) => {
            const cat = this.lookup.get(n);
            if (cat) {
                r.add(cat);
            }
        });
        return r;
    }
    getSortedSet(row) {
        return Array.from(this.getSet(row)).sort((a, b) => a.value === b.value ? a.label.localeCompare(b.label) : a.value - b.value);
    }
    getCategories(row) {
        return this.getSortedSet(row);
    }
    getColors(row) {
        return this.getSortedSet(row).map((d) => this.colorMapping.apply(d));
    }
    getColorMapping() {
        return this.colorMapping.clone();
    }
    setColorMapping(mapping) {
        return CategoricalColumn.prototype.setColorMapping.call(this, mapping);
    }
    getValues(row) {
        const s = this.getSet(row);
        return this.categories.map((d) => s.has(d));
    }
    getLabels(row) {
        return this.getValues(row).map(String);
    }
    getMap(row) {
        return this.getSortedSet(row).map((d) => ({ key: d.label, value: true }));
    }
    getMapLabel(row) {
        return this.getSortedSet(row).map((d) => ({ key: d.label, value: 'true' }));
    }
    iterCategory(row) {
        const r = this.getSet(row);
        if (r.size > 0) {
            return Array.from(r);
        }
        return [null];
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.filter = this.currentFilter;
        r.colorMapping = this.colorMapping.toJSON();
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        this.colorMapping = factory.categoricalColorMappingFunction(dump.colorMapping, this.categories);
        if (!('filter' in dump)) {
            this.currentFilter = null;
            return;
        }
        const bak = dump.filter;
        if (typeof bak === 'string' || Array.isArray(bak)) {
            this.currentFilter = { filter: bak, filterMissing: false, mode: 'some' };
        }
        else {
            this.currentFilter = bak;
        }
    }
    isFiltered() {
        return this.currentFilter != null;
    }
    filter(row) {
        if (!this.currentFilter) {
            return true;
        }
        const v = Array.from(this.getSet(row));
        if (v.length === 0) {
            return isCategoryIncluded(this.currentFilter, null);
        }
        if (this.currentFilter.mode === 'every') {
            return v.every((s) => isCategoryIncluded(this.currentFilter, s));
        }
        return v.some((s) => isCategoryIncluded(this.currentFilter, s));
    }
    getFilter() {
        return this.currentFilter == null ? null : Object.assign({}, this.currentFilter);
    }
    setFilter(filter) {
        if (isEqualSetCategoricalFilter(this.currentFilter, filter)) {
            return;
        }
        this.fire([CategoricalColumn.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.currentFilter, (this.currentFilter = filter));
    }
    clearFilter() {
        return CategoricalColumn.prototype.clearFilter.call(this);
    }
    toCompareValue(row) {
        const v = this.getSet(row);
        const vs = [v.size];
        for (const cat of this.categories) {
            vs.push(v.has(cat) ? 1 : 0);
        }
        return vs;
    }
    toCompareValueType() {
        return [chooseUIntByDataLength(this.categories.length)].concat(this.categories.map(() => ECompareValueType.BINARY));
    }
    group(row) {
        const v = this.getSet(row);
        const cardinality = v.size;
        const categories = this.categories.filter((c) => v.has(c));
        // by cardinality and then by intersection
        const g = {
            name: categories.length === 0 ? 'None' : categories.map((d) => d.name).join(', '),
            color: categories.length === 1 ? categories[0].color : DEFAULT_COLOR,
        };
        g.parent = {
            name: `#${cardinality}`,
            color: DEFAULT_COLOR,
            subGroups: [g],
        };
        return g;
    }
};
SetColumn.EVENT_FILTER_CHANGED = CategoricalColumn.EVENT_FILTER_CHANGED;
SetColumn.EVENT_COLOR_MAPPING_CHANGED = CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED;
SetColumn = SetColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'filterCategorical', 'colorMappedCategorical', 'group', 'groupBy'),
    Category('categorical')
], SetColumn);
export default SetColumn;
