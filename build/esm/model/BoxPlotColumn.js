var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BoxPlotColumn_1;
import { format } from 'd3-format';
import { Category, dialogAddons, SortByDefault, toolbar } from './annotations';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged, } from './Column';
import { ECompareValueType } from './interfaces';
import { ESortMethod, } from './INumberColumn';
import { restoreMapping } from './MappingFunction';
import NumberColumn from './NumberColumn';
import ValueColumn from './ValueColumn';
import { DEFAULT_FORMATTER, noNumberFilter, toCompareBoxPlotValue, getBoxPlotNumber, isDummyNumberFilter, restoreNumberFilter, } from './internalNumber';
let BoxPlotColumn = BoxPlotColumn_1 = class BoxPlotColumn extends ValueColumn {
    constructor(id, desc, factory) {
        super(id, desc);
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
        this.colorMapping = factory.colorMappingFunction(desc.colorMapping);
        if (desc.numberFormat) {
            this.numberFormat = format(desc.numberFormat);
        }
        this.sort = desc.sort || ESortMethod.min;
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
            if (v == null) {
                return acc;
            }
            if (v.min < acc.min) {
                acc.min = v.min;
            }
            if (v.max > acc.max) {
                acc.max = v.max;
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
    getBoxPlotData(row) {
        return this.getValue(row);
    }
    getRange() {
        return this.mapping.getRange(this.numberFormat);
    }
    getRawBoxPlotData(row) {
        return this.getRawValue(row);
    }
    getRawValue(row) {
        return super.getValue(row);
    }
    getExportValue(row, format) {
        return format === 'json' ? this.getRawValue(row) : super.getExportValue(row, format);
    }
    getValue(row) {
        const v = this.getRawValue(row);
        if (v == null) {
            return null;
        }
        const r = {
            min: this.mapping.apply(v.min),
            max: this.mapping.apply(v.max),
            median: this.mapping.apply(v.median),
            q1: this.mapping.apply(v.q1),
            q3: this.mapping.apply(v.q3),
        };
        if (v.outlier) {
            Object.assign(r, {
                outlier: v.outlier.map((d) => this.mapping.apply(d)),
            });
        }
        if (v.whiskerLow != null) {
            Object.assign(r, {
                whiskerLow: this.mapping.apply(v.whiskerLow),
            });
        }
        if (v.whiskerHigh != null) {
            Object.assign(r, {
                whiskerHigh: this.mapping.apply(v.whiskerHigh),
            });
        }
        return r;
    }
    getNumber(row) {
        return getBoxPlotNumber(this, row, 'normalized');
    }
    getRawNumber(row) {
        return getBoxPlotNumber(this, row, 'raw');
    }
    iterNumber(row) {
        return [this.getNumber(row)];
    }
    iterRawNumber(row) {
        return [this.getRawNumber(row)];
    }
    getLabel(row) {
        const v = this.getRawValue(row);
        if (v == null) {
            return '';
        }
        const f = this.numberFormat;
        return `BoxPlot(min = ${f(v.min)}, q1 = ${f(v.q1)}, median = ${f(v.median)}, q3 = ${f(v.q3)}, max = ${f(v.max)})`;
    }
    getSortMethod() {
        return this.sort;
    }
    setSortMethod(sort) {
        if (this.sort === sort) {
            return;
        }
        this.fire(BoxPlotColumn_1.EVENT_SORTMETHOD_CHANGED, this.sort, (this.sort = sort));
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
            BoxPlotColumn_1.EVENT_SORTMETHOD_CHANGED,
            BoxPlotColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            BoxPlotColumn_1.EVENT_MAPPING_CHANGED,
            BoxPlotColumn_1.EVENT_FILTER_CHANGED,
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
            BoxPlotColumn_1.EVENT_MAPPING_CHANGED,
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
            BoxPlotColumn_1.EVENT_COLOR_MAPPING_CHANGED,
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
BoxPlotColumn.EVENT_MAPPING_CHANGED = NumberColumn.EVENT_MAPPING_CHANGED;
BoxPlotColumn.EVENT_COLOR_MAPPING_CHANGED = NumberColumn.EVENT_COLOR_MAPPING_CHANGED;
BoxPlotColumn.EVENT_SORTMETHOD_CHANGED = NumberColumn.EVENT_SORTMETHOD_CHANGED;
BoxPlotColumn.EVENT_FILTER_CHANGED = NumberColumn.EVENT_FILTER_CHANGED;
BoxPlotColumn = BoxPlotColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'filterNumber', 'colorMapped', 'editMapping'),
    dialogAddons('sort', 'sortBoxPlot'),
    Category('array'),
    SortByDefault('descending')
], BoxPlotColumn);
export default BoxPlotColumn;
