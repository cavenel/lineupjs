var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NumbersColumn_1;
import { format } from 'd3-format';
import { boxplotBuilder } from '../internal';
import { dialogAddons, SortByDefault, toolbar } from './annotations';
import ArrayColumn, {} from './ArrayColumn';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged, } from './Column';
import { ECompareValueType } from './interfaces';
import { DEFAULT_FORMATTER, getBoxPlotNumber, isDummyNumberFilter, noNumberFilter, restoreNumberFilter, toCompareBoxPlotValue, } from './internalNumber';
import { EAdvancedSortMethod, } from './INumberColumn';
import { restoreMapping } from './MappingFunction';
import { isMissingValue } from './missing';
import NumberColumn from './NumberColumn';
import { integrateDefaults } from './internal';
let NumbersColumn = NumbersColumn_1 = class NumbersColumn extends ArrayColumn {
    constructor(id, desc, factory) {
        super(id, integrateDefaults(desc, Object.assign({
            renderer: 'heatmap',
            groupRenderer: 'heatmap',
            summaryRenderer: 'histogram',
        }, desc.dataLength != null && !Number.isNaN(desc.dataLength)
            ? {
                // better initialize the default with based on the data length
                width: Math.min(Math.max(100, desc.dataLength * 10), 500),
            }
            : {})));
        this.numberFormat = DEFAULT_FORMATTER;
        /**
         * currently active filter
         * @type {{min: number, max: number}}
         * @private
         */
        this.currentFilter = noNumberFilter();
        this.mapping = restoreMapping(desc, factory);
        this.original = this.mapping.clone();
        this.deriveMapping = this.mapping.domain.map((d) => d == null || Number.isNaN(d));
        this.colorMapping = factory.colorMappingFunction(desc.colorMapping || desc.color);
        if (desc.numberFormat) {
            this.numberFormat = format(desc.numberFormat);
        }
        this.sort = desc.sort || EAdvancedSortMethod.median;
    }
    onDataUpdate(rows) {
        super.onDataUpdate(rows);
        if (!this.deriveMapping.some(Boolean)) {
            return;
        }
        // hook for listening to data updates
        const minMax = rows
            .map((row) => this.getRawValue(row))
            .reduce((acc, v) => {
            if (v == null || !Array.isArray(v)) {
                return acc;
            }
            for (const vi of v) {
                if (vi == null || Number.isNaN(vi)) {
                    continue;
                }
                if (vi < acc.min) {
                    acc.min = vi;
                }
                if (vi > acc.max) {
                    acc.max = vi;
                }
            }
            return acc;
        }, { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY });
        const domain = this.mapping.domain.slice();
        if (this.deriveMapping[0]) {
            domain[0] = minMax.min;
        }
        if (this.deriveMapping[this.deriveMapping.length - 1]) {
            domain[domain.length - 1] = minMax.max;
        }
        this.mapping.domain = domain;
        this.original.domain = domain;
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
    getRawNumbers(row) {
        return this.getRawValue(row);
    }
    getBoxPlotData(row) {
        const data = this.getRawValue(row);
        if (data == null) {
            return null;
        }
        const b = boxplotBuilder();
        for (const d of data) {
            b.push(isMissingValue(d) ? NaN : this.mapping.apply(d));
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
            b.push(isMissingValue(d) ? NaN : d);
        }
        return b.build();
    }
    getNumbers(row) {
        return this.getValues(row);
    }
    getNumber(row) {
        return getBoxPlotNumber(this, row, 'normalized');
    }
    getRawNumber(row) {
        return getBoxPlotNumber(this, row, 'raw');
    }
    getValue(row) {
        const v = this.getValues(row);
        return v.every(Number.isNaN) ? null : v;
    }
    getValues(row) {
        return this.getRawValue(row).map((d) => (Number.isNaN(d) ? NaN : this.mapping.apply(d)));
    }
    iterNumber(row) {
        const v = this.getNumbers(row);
        if (v.every(Number.isNaN)) {
            // missing row
            return [NaN];
        }
        return v;
    }
    iterRawNumber(row) {
        const v = this.getRawNumbers(row);
        if (v.every(Number.isNaN)) {
            // missing row
            return [NaN];
        }
        return v;
    }
    getRawValue(row) {
        const r = super.getRaw(row);
        return r == null ? [] : r.map((d) => (isMissingValue(d) ? NaN : +d));
    }
    getExportValue(row, format) {
        return format === 'json' ? this.getRawValue(row) : super.getExportValue(row, format);
    }
    getLabels(row) {
        return this.getRawValue(row).map(this.numberFormat);
    }
    getSortMethod() {
        return this.sort;
    }
    setSortMethod(sort) {
        if (this.sort === sort) {
            return;
        }
        this.fire([
            NumbersColumn_1.EVENT_SORTMETHOD_CHANGED,
            NumberColumn.EVENT_DIRTY_HEADER,
            NumberColumn.EVENT_DIRTY_VALUES,
            NumbersColumn_1.EVENT_DIRTY_CACHES,
            NumberColumn.EVENT_DIRTY,
        ], this.sort, (this.sort = sort));
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
            NumbersColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            NumbersColumn_1.EVENT_MAPPING_CHANGED,
            NumbersColumn_1.EVENT_SORTMETHOD_CHANGED,
            NumbersColumn_1.EVENT_FILTER_CHANGED,
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
        this.deriveMapping = [];
        this.fire([
            NumbersColumn_1.EVENT_MAPPING_CHANGED,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], this.mapping.clone(), (this.mapping = mapping));
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
        this.fire([
            NumbersColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], this.colorMapping.clone(), (this.colorMapping = mapping));
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
NumbersColumn.EVENT_MAPPING_CHANGED = NumberColumn.EVENT_MAPPING_CHANGED;
NumbersColumn.EVENT_COLOR_MAPPING_CHANGED = NumberColumn.EVENT_COLOR_MAPPING_CHANGED;
NumbersColumn.EVENT_SORTMETHOD_CHANGED = NumberColumn.EVENT_SORTMETHOD_CHANGED;
NumbersColumn.EVENT_FILTER_CHANGED = NumberColumn.EVENT_FILTER_CHANGED;
NumbersColumn.CENTER = 0;
NumbersColumn = NumbersColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'filterNumber', 'colorMapped', 'editMapping'),
    dialogAddons('sort', 'sortNumbers'),
    SortByDefault('descending')
], NumbersColumn);
export default NumbersColumn;
