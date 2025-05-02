var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CategoricalColumn_1;
import { Category, toolbar } from './annotations';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged, DEFAULT_COLOR, } from './Column';
import { ECompareValueType } from './interfaces';
import { missingGroup } from './missing';
import ValueColumn from './ValueColumn';
import { toCategories, isCategoryIncluded, isEqualCategoricalFilter, toCompareCategoryValue, toGroupCompareCategoryValue, compareCategory, } from './internalCategorical';
/**
 * column for categorical values
 */
let CategoricalColumn = CategoricalColumn_1 = class CategoricalColumn extends ValueColumn {
    constructor(id, desc) {
        super(id, desc);
        this.lookup = new Map();
        /**
         * set of categories to show
         * @type {null}
         * @private
         */
        this.currentFilter = null;
        this.categories = toCategories(desc);
        this.categories.forEach((d) => this.lookup.set(d.name, d));
        this.categoryOrder = desc.categoryOrder || 'given';
        this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
    }
    onDataUpdate(rows) {
        super.onDataUpdate(rows);
        if (Array.isArray(this.desc.categories) && this.categoryOrder === 'given') {
            return;
        }
        // derive hist
        const categories = new Map();
        rows.forEach((row) => {
            const value = super.getValue(row);
            if (!value) {
                return;
            }
            const sValue = String(value);
            const entry = categories.get(sValue);
            if (!entry) {
                categories.set(sValue, { name: sValue, count: 1 });
            }
            else {
                entry.count++;
            }
        });
        if (!Array.isArray(this.desc.categories)) {
            // derive
            const categoryNames = Array.from(categories.keys());
            categoryNames.sort();
            this.categories.splice(0, this.categories.length, ...toCategories({ categories: categoryNames }));
            this.categories.forEach((d) => this.lookup.set(d.name, d));
        }
        this.sortCategories(categories);
    }
    sortCategories(hist) {
        var _a, _b;
        // patch values of categories
        for (const cat of this.categories) {
            cat.value = (_b = (_a = hist.get(cat.name)) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0;
        }
        // sort
        if (typeof this.categoryOrder === 'function') {
            this.categories.splice(0, this.categories.length, ...this.categoryOrder(this.categories));
        }
        else if (this.categoryOrder === 'large-to-small') {
            // revert order of value
            for (const cat of this.categories) {
                cat.value = -1 * cat.value;
            }
            this.categories.sort(compareCategory);
        }
        else if (this.categoryOrder === 'small-to-large') {
            this.categories.sort(compareCategory);
        }
        // patch the ICategory.value to match the new order
        this.categories.forEach((cat, i) => {
            cat.value = i / this.categories.length;
        });
    }
    createEventList() {
        return super
            .createEventList()
            .concat([CategoricalColumn_1.EVENT_FILTER_CHANGED, CategoricalColumn_1.EVENT_COLOR_MAPPING_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getValue(row) {
        const v = this.getCategory(row);
        return v ? v.name : null;
    }
    getCategory(row) {
        const v = super.getValue(row);
        if (!v) {
            return null;
        }
        const vs = String(v);
        return this.lookup.has(vs) ? this.lookup.get(vs) : null;
    }
    get dataLength() {
        return this.categories.length;
    }
    get labels() {
        return this.categories.map((d) => d.label);
    }
    getLabel(row) {
        const v = this.getCategory(row);
        return v ? v.label : '';
    }
    getCategories(row) {
        const v = this.getCategory(row);
        return [v];
    }
    getValues(row) {
        const v = this.getCategory(row);
        return this.categories.map((d) => d === v);
    }
    getLabels(row) {
        return this.getValues(row).map(String);
    }
    getMap(row) {
        const cats = this.categories;
        return this.getValues(row).map((value, i) => ({ key: cats[i].label, value }));
    }
    getMapLabel(row) {
        const cats = this.categories;
        return this.getLabels(row).map((value, i) => ({ key: cats[i].label, value }));
    }
    getSet(row) {
        const cat = this.getCategory(row);
        const r = new Set();
        if (cat) {
            r.add(cat);
        }
        return r;
    }
    iterCategory(row) {
        return [this.getCategory(row)];
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
        if (typeof dump.filter === 'undefined') {
            this.currentFilter = null;
            return;
        }
        const bak = dump.filter;
        if (typeof bak === 'string' || Array.isArray(bak)) {
            this.currentFilter = { filter: bak, filterMissing: false };
        }
        else {
            this.currentFilter = bak;
        }
    }
    getColor(row) {
        const v = this.getCategory(row);
        return v ? this.colorMapping.apply(v) : DEFAULT_COLOR;
    }
    getColorMapping() {
        return this.colorMapping.clone();
    }
    setColorMapping(mapping) {
        if (this.colorMapping.eq(mapping)) {
            return;
        }
        this.fire([
            CategoricalColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY,
        ], this.colorMapping.clone(), (this.colorMapping = mapping));
    }
    isFiltered() {
        return this.currentFilter != null;
    }
    filter(row, valueCache) {
        return isCategoryIncluded(this.currentFilter, valueCache !== undefined ? valueCache : this.getCategory(row));
    }
    getFilter() {
        return this.currentFilter == null ? null : Object.assign({}, this.currentFilter);
    }
    setFilter(filter) {
        if (isEqualCategoricalFilter(this.currentFilter, filter)) {
            return;
        }
        this.fire([CategoricalColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.currentFilter, (this.currentFilter = filter));
    }
    clearFilter() {
        const was = this.isFiltered();
        this.setFilter(null);
        return was;
    }
    toCompareValue(row, valueCache) {
        return toCompareCategoryValue(valueCache !== undefined ? valueCache : this.getCategory(row));
    }
    toCompareValueType() {
        return ECompareValueType.FLOAT_ASC;
    }
    group(row, valueCache) {
        const cat = valueCache !== undefined ? valueCache : this.getCategory(row);
        if (!cat) {
            return Object.assign({}, missingGroup);
        }
        return { name: cat.label, color: cat.color };
    }
    toCompareGroupValue(rows, _group, valueCache) {
        return toGroupCompareCategoryValue(rows, this, valueCache);
    }
    toCompareGroupValueType() {
        return [ECompareValueType.FLOAT, ECompareValueType.STRING];
    }
    getGroupRenderer() {
        const current = super.getGroupRenderer();
        if (current === this.desc.type && this.isGroupedBy() >= 0) {
            // still the default and the stratification criteria
            return 'catdistributionbar';
        }
        return current;
    }
};
CategoricalColumn.EVENT_FILTER_CHANGED = 'filterChanged';
CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED = 'colorMappingChanged';
CategoricalColumn = CategoricalColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'group', 'groupBy', 'sortGroupBy', 'filterCategorical', 'colorMappedCategorical'),
    Category('categorical')
], CategoricalColumn);
export default CategoricalColumn;
