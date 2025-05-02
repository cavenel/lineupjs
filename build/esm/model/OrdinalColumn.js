var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OrdinalColumn_1;
import { equalArrays, extent } from '../internal';
import { Category, toolbar } from './annotations';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import CategoricalColumn from './CategoricalColumn';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged, } from './Column';
import NumberColumn from './NumberColumn';
import ValueColumn from './ValueColumn';
import { toCategories } from './internalCategorical';
import { DEFAULT_FORMATTER } from './internalNumber';
import { integrateDefaults } from './internal';
/**
 * similar to a categorical column but the categories are mapped to numbers
 */
let OrdinalColumn = OrdinalColumn_1 = class OrdinalColumn extends ValueColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            renderer: 'number',
            groupRenderer: 'boxplot',
        }));
        this.lookup = new Map();
        this.currentFilter = null;
        this.categories = toCategories(desc);
        this.categories.forEach((d) => this.lookup.set(d.name, d));
        this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
    }
    onDataUpdate(rows) {
        super.onDataUpdate(rows);
        if (this.desc.categories) {
            return;
        }
        // derive
        const categories = new Set();
        rows.forEach((row) => {
            const value = super.getValue(row);
            if (!value) {
                return;
            }
            categories.add(String(value));
        });
        this.categories.splice(0, this.categories.length, ...toCategories({ categories: Array.from(categories) }));
        this.categories.forEach((d) => this.lookup.set(d.name, d));
    }
    createEventList() {
        return super
            .createEventList()
            .concat([
            OrdinalColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            OrdinalColumn_1.EVENT_MAPPING_CHANGED,
            OrdinalColumn_1.EVENT_FILTER_CHANGED,
        ]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getNumberFormat() {
        return DEFAULT_FORMATTER;
    }
    get dataLength() {
        return this.categories.length;
    }
    get labels() {
        return this.categories.map((d) => d.label);
    }
    getValue(row) {
        const v = this.getNumber(row);
        return Number.isNaN(v) ? null : v;
    }
    getCategory(row) {
        const v = super.getValue(row);
        if (!v) {
            return null;
        }
        const vs = String(v);
        return this.lookup.has(vs) ? this.lookup.get(vs) : null;
    }
    getCategories(row) {
        return [this.getCategory(row)];
    }
    iterCategory(row) {
        return [this.getCategory(row)];
    }
    iterNumber(row) {
        return [this.getNumber(row)];
    }
    iterRawNumber(row) {
        return [this.getRawNumber(row)];
    }
    getColor(row) {
        return CategoricalColumn.prototype.getColor.call(this, row);
    }
    getLabel(row) {
        return CategoricalColumn.prototype.getLabel.call(this, row);
    }
    getLabels(row) {
        return CategoricalColumn.prototype.getLabels.call(this, row);
    }
    getValues(row) {
        return CategoricalColumn.prototype.getValues.call(this, row);
    }
    getMap(row) {
        return CategoricalColumn.prototype.getMap.call(this, row);
    }
    getMapLabel(row) {
        return CategoricalColumn.prototype.getMapLabel.call(this, row);
    }
    getSet(row) {
        return CategoricalColumn.prototype.getSet.call(this, row);
    }
    getNumber(row) {
        const v = this.getCategory(row);
        return v ? v.value : NaN;
    }
    getRawNumber(row) {
        return this.getNumber(row);
    }
    getExportValue(row, format) {
        if (format === 'json') {
            const value = this.getNumber(row);
            if (Number.isNaN(value)) {
                return null;
            }
            return {
                name: this.getLabel(row),
                value,
            };
        }
        return super.getExportValue(row, format);
    }
    dump(toDescRef) {
        const r = CategoricalColumn.prototype.dump.call(this, toDescRef);
        r.mapping = this.getMapping();
        return r;
    }
    restore(dump, factory) {
        CategoricalColumn.prototype.restore.call(this, dump, factory);
        if (dump.mapping) {
            this.setMapping(dump.mapping);
        }
    }
    getMapping() {
        return this.categories.map((d) => d.value);
    }
    setMapping(mapping) {
        const r = extent(mapping);
        mapping = mapping.map((d) => (d - r[0]) / (r[1] - r[0]));
        const bak = this.getMapping();
        if (equalArrays(bak, mapping)) {
            return;
        }
        this.categories.forEach((d, i) => (d.value = mapping[i] || 0));
        this.fire([
            OrdinalColumn_1.EVENT_MAPPING_CHANGED,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], bak, this.getMapping());
    }
    getColorMapping() {
        return this.colorMapping.clone();
    }
    setColorMapping(mapping) {
        return CategoricalColumn.prototype.setColorMapping.call(this, mapping);
    }
    isFiltered() {
        return this.currentFilter != null;
    }
    filter(row) {
        return CategoricalColumn.prototype.filter.call(this, row);
    }
    group(row) {
        return CategoricalColumn.prototype.group.call(this, row);
    }
    getFilter() {
        return this.currentFilter;
    }
    setFilter(filter) {
        return CategoricalColumn.prototype.setFilter.call(this, filter);
    }
    clearFilter() {
        return CategoricalColumn.prototype.clearFilter.call(this);
    }
    toCompareValue(row) {
        return CategoricalColumn.prototype.toCompareValue.call(this, row);
    }
    toCompareValueType() {
        return CategoricalColumn.prototype.toCompareValueType.call(this);
    }
    getRenderer() {
        return NumberColumn.prototype.getRenderer.call(this);
    }
};
OrdinalColumn.EVENT_MAPPING_CHANGED = NumberColumn.EVENT_MAPPING_CHANGED;
OrdinalColumn.EVENT_FILTER_CHANGED = CategoricalColumn.EVENT_FILTER_CHANGED;
OrdinalColumn.EVENT_COLOR_MAPPING_CHANGED = CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED;
OrdinalColumn = OrdinalColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'group', 'filterOrdinal', 'colorMappedCategorical'),
    Category('categorical')
], OrdinalColumn);
export default OrdinalColumn;
