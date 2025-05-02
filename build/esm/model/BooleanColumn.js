var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BooleanColumn_1;
import { Category, toolbar } from './annotations';
import CategoricalColumn from './CategoricalColumn';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import ValueColumn from './ValueColumn';
import { ECompareValueType } from './interfaces';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import { integrateDefaults } from './internal';
import { missingGroup } from './missing';
import { isCategoryIncluded, isEqualCategoricalFilter } from './internalCategorical';
/**
 * a string column with optional alignment
 */
let BooleanColumn = BooleanColumn_1 = class BooleanColumn extends ValueColumn {
    constructor(id, desc) {
        var _a, _b;
        super(id, integrateDefaults(desc, {
            width: 30,
            renderer: 'categorical',
            groupRenderer: 'categorical',
            summaryRenderer: 'categorical',
        }));
        this.currentFilter = null;
        this.categories = [
            {
                name: (_a = desc.trueMarker) !== null && _a !== void 0 ? _a : '✓',
                color: BooleanColumn_1.GROUP_TRUE.color,
                label: BooleanColumn_1.GROUP_TRUE.name,
                value: 0,
            },
            {
                name: (_b = desc.falseMarker) !== null && _b !== void 0 ? _b : '',
                color: BooleanColumn_1.GROUP_FALSE.color,
                label: BooleanColumn_1.GROUP_FALSE.name,
                value: 1,
            },
        ];
        this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
    }
    createEventList() {
        return super
            .createEventList()
            .concat([BooleanColumn_1.EVENT_COLOR_MAPPING_CHANGED, BooleanColumn_1.EVENT_FILTER_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    get dataLength() {
        return this.categories.length;
    }
    get labels() {
        return this.categories.map((d) => d.label);
    }
    getValue(row) {
        var _a;
        const v = super.getValue(row);
        if (typeof v === 'undefined' || v == null) {
            return null;
        }
        const trueValues = (_a = this.desc.trueValues) !== null && _a !== void 0 ? _a : BooleanColumn_1.DEFAULT_TRUE_VALUES;
        const vs = String(v).toLowerCase();
        return trueValues.some((d) => d === v || d === vs);
    }
    getCategoryOfBoolean(v) {
        return v == null ? null : this.categories[v ? 0 : 1];
    }
    getCategory(row) {
        const v = this.getValue(row);
        return v == null ? null : this.categories[v ? 0 : 1];
    }
    getCategories(row) {
        return [this.getCategory(row)];
    }
    iterCategory(row) {
        return [this.getCategory(row)];
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
        const v = this.getValue(row);
        const r = new Set();
        if (v != null) {
            r.add(this.categories[v ? 0 : 1]);
        }
        return r;
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.colorMapping = this.colorMapping.toJSON();
        if (this.currentFilter != null) {
            r.filter = this.currentFilter;
        }
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        this.colorMapping = factory.categoricalColorMappingFunction(dump.colorMapping, this.categories);
        if (typeof dump.filter === 'boolean') {
            this.currentFilter = {
                filter: [this.getCategoryOfBoolean(dump.filter).name],
                filterMissing: false,
            };
        }
        else if (typeof dump.filter !== 'undefined') {
            this.currentFilter = dump.filter;
        }
    }
    getColorMapping() {
        return this.colorMapping.clone();
    }
    setColorMapping(mapping) {
        if (this.colorMapping.eq(mapping)) {
            return;
        }
        this.fire([
            CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY,
        ], this.colorMapping.clone(), (this.colorMapping = mapping));
    }
    isFiltered() {
        return this.currentFilter != null;
    }
    filter(row) {
        return isCategoryIncluded(this.currentFilter, this.getCategory(row));
    }
    getFilter() {
        return this.currentFilter == null ? null : Object.assign({}, this.currentFilter);
    }
    setFilter(filter) {
        const f = typeof filter === 'boolean'
            ? { filter: [this.getCategoryOfBoolean(filter).name], filterMissing: false }
            : filter;
        if (isEqualCategoricalFilter(this.currentFilter, f)) {
            return;
        }
        this.fire([BooleanColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.currentFilter, (this.currentFilter = f));
    }
    clearFilter() {
        const was = this.isFiltered();
        this.setFilter(null);
        return was;
    }
    toCompareValue(row) {
        const v = this.getValue(row);
        if (v == null) {
            return NaN;
        }
        return v ? 1 : 0;
    }
    toCompareValueType() {
        return ECompareValueType.BINARY;
    }
    group(row) {
        const v = this.getValue(row);
        if (v == null) {
            return Object.assign({}, missingGroup);
        }
        return Object.assign({}, v ? BooleanColumn_1.GROUP_TRUE : BooleanColumn_1.GROUP_FALSE);
    }
};
BooleanColumn.EVENT_FILTER_CHANGED = 'filterChanged';
BooleanColumn.EVENT_COLOR_MAPPING_CHANGED = 'colorMappingChanged';
BooleanColumn.GROUP_TRUE = { name: 'True', color: '#444444' };
BooleanColumn.GROUP_FALSE = { name: 'False', color: '#dddddd' };
BooleanColumn.DEFAULT_TRUE_VALUES = ['y', 'yes', 'true', true, '1', '1.0', 1, 1.0, 'on'];
BooleanColumn = BooleanColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'group', 'groupBy', 'filterCategorical', 'colorMappedCategorical'),
    Category('categorical')
], BooleanColumn);
export default BooleanColumn;
