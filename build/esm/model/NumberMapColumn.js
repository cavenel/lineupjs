var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NumberMapColumn_1;
import { toolbar, SortByDefault, dialogAddons } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import { ECompareValueType } from './interfaces';
import { EAdvancedSortMethod, } from './INumberColumn';
import MapColumn, {} from './MapColumn';
import { restoreMapping } from './MappingFunction';
import { isMissingValue } from './missing';
import NumberColumn from './NumberColumn';
import { boxplotBuilder } from '../internal';
import { format } from 'd3-format';
import { DEFAULT_FORMATTER, noNumberFilter, toCompareBoxPlotValue, getBoxPlotNumber, isDummyNumberFilter, restoreNumberFilter, } from './internalNumber';
import { integrateDefaults } from './internal';
let NumberMapColumn = NumberMapColumn_1 = class NumberMapColumn extends MapColumn {
    constructor(id, desc, factory) {
        super(id, integrateDefaults(desc, {
            renderer: 'mapbars',
        }));
        this.numberFormat = DEFAULT_FORMATTER;
        /**
         * currently active filter
         * @type {{min: number, max: number}}
         * @private
         */
        this.currentFilter = noNumberFilter();
        this.mapping = restoreMapping(desc, factory);
        this.original = this.mapping.clone();
        this.colorMapping = factory.colorMappingFunction(desc.colorMapping || desc.color);
        this.sort = desc.sort || EAdvancedSortMethod.median;
        if (desc.numberFormat) {
            this.numberFormat = format(desc.numberFormat);
        }
    }
    getNumberFormat() {
        return this.numberFormat;
    }
    toCompareValue(row) {
        return toCompareBoxPlotValue(this, row);
    }
    toCompareValueType() {
        return ECompareValueType.FLOAT;
    }
    getBoxPlotData(row) {
        const data = this.getRawValue(row);
        if (data == null) {
            return null;
        }
        const b = boxplotBuilder();
        for (const d of data) {
            b.push(isMissingValue(d.value) ? NaN : this.mapping.apply(d.value));
        }
        return b.build();
    }
    getRange() {
        return this.mapping.getRange(this.numberFormat);
    }
    getRawBoxPlotData(row) {
        const data = this.getRawValue(row);
        if (data == null) {
            return null;
        }
        const b = boxplotBuilder();
        for (const d of data) {
            b.push(isMissingValue(d.value) ? NaN : d.value);
        }
        return b.build();
    }
    getNumber(row) {
        return getBoxPlotNumber(this, row, 'normalized');
    }
    getRawNumber(row) {
        return getBoxPlotNumber(this, row, 'raw');
    }
    iterNumber(row) {
        const r = this.getValue(row);
        return r ? r.map((d) => d.value) : [NaN];
    }
    iterRawNumber(row) {
        const r = this.getRawValue(row);
        return r ? r.map((d) => d.value) : [NaN];
    }
    getValue(row) {
        const values = this.getRawValue(row);
        return values.length === 0
            ? null
            : values.map(({ key, value }) => ({ key, value: isMissingValue(value) ? NaN : this.mapping.apply(value) }));
    }
    getRawValue(row) {
        const r = super.getValue(row);
        return r == null ? [] : r;
    }
    getExportValue(row, format) {
        return format === 'json' ? this.getRawValue(row) : super.getExportValue(row, format);
    }
    getLabels(row) {
        const v = this.getRawValue(row);
        return v.map(({ key, value }) => ({ key, value: this.numberFormat(value) }));
    }
    getSortMethod() {
        return this.sort;
    }
    setSortMethod(sort) {
        if (this.sort === sort) {
            return;
        }
        this.fire([NumberMapColumn_1.EVENT_SORTMETHOD_CHANGED], this.sort, (this.sort = sort));
        // sort by me if not already sorted by me
        if (!this.isSortedByMe().asc) {
            this.sortByMe();
        }
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.sortMethod = this.getSortMethod();
        r.filter = !isDummyNumberFilter(this.currentFilter) ? this.currentFilter : null;
        r.map = this.mapping.toJSON();
        r.colorMapping = this.colorMapping.toJSON();
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        if (dump.sortMethod) {
            this.sort = dump.sortMethod;
        }
        if (dump.filter) {
            this.currentFilter = restoreNumberFilter(dump.filter);
        }
        if (dump.map || dump.domain) {
            this.mapping = restoreMapping(dump, factory);
        }
        if (dump.colorMapping) {
            this.colorMapping = factory.colorMappingFunction(dump.colorMapping);
        }
    }
    createEventList() {
        return super
            .createEventList()
            .concat([
            NumberMapColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            NumberMapColumn_1.EVENT_MAPPING_CHANGED,
            NumberMapColumn_1.EVENT_SORTMETHOD_CHANGED,
            NumberMapColumn_1.EVENT_FILTER_CHANGED,
        ]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getOriginalMapping() {
        return this.original.clone();
    }
    getMapping() {
        return this.mapping.clone();
    }
    setMapping(mapping) {
        if (this.mapping.eq(mapping)) {
            return;
        }
        this.fire([NumberMapColumn_1.EVENT_MAPPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.mapping.clone(), (this.mapping = mapping));
    }
    getColor(row) {
        return NumberColumn.prototype.getColor.call(this, row);
    }
    getColorMapping() {
        return this.colorMapping.clone();
    }
    setColorMapping(mapping) {
        if (this.colorMapping.eq(mapping)) {
            return;
        }
        this.fire([NumberMapColumn_1.EVENT_COLOR_MAPPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.colorMapping.clone(), (this.colorMapping = mapping));
    }
    isFiltered() {
        return NumberColumn.prototype.isFiltered.call(this);
    }
    getFilter() {
        return NumberColumn.prototype.getFilter.call(this);
    }
    setFilter(value) {
        NumberColumn.prototype.setFilter.call(this, value);
    }
    filter(row) {
        return NumberColumn.prototype.filter.call(this, row);
    }
    clearFilter() {
        return NumberColumn.prototype.clearFilter.call(this);
    }
};
NumberMapColumn.EVENT_MAPPING_CHANGED = NumberColumn.EVENT_MAPPING_CHANGED;
NumberMapColumn.EVENT_COLOR_MAPPING_CHANGED = NumberColumn.EVENT_COLOR_MAPPING_CHANGED;
NumberMapColumn.EVENT_SORTMETHOD_CHANGED = NumberColumn.EVENT_SORTMETHOD_CHANGED;
NumberMapColumn.EVENT_FILTER_CHANGED = NumberColumn.EVENT_FILTER_CHANGED;
NumberMapColumn = NumberMapColumn_1 = __decorate([
    toolbar('rename', 'filterNumber', 'colorMapped', 'editMapping'),
    dialogAddons('sort', 'sortNumbers'),
    SortByDefault('descending')
], NumberMapColumn);
export default NumberMapColumn;
