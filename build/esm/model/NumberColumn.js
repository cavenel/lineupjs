var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NumberColumn_1;
import { format } from 'd3-format';
import { equalArrays } from '../internal';
import { Category, dialogAddons, SortByDefault, toolbar } from './annotations';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged, DEFAULT_COLOR, } from './Column';
import { ECompareValueType } from './interfaces';
import { EAdvancedSortMethod, } from './INumberColumn';
import { restoreMapping } from './MappingFunction';
import { isMissingValue, isUnknown, missingGroup } from './missing';
import ValueColumn from './ValueColumn';
import { noNumberFilter, isDummyNumberFilter, restoreNumberFilter, toCompareGroupValue, isEqualNumberFilter, isNumberIncluded, } from './internalNumber';
import { integrateDefaults } from './internal';
/**
 * a number column mapped from an original input scale to an output range
 */
let NumberColumn = NumberColumn_1 = class NumberColumn extends ValueColumn {
    constructor(id, desc, factory) {
        super(id, integrateDefaults(desc, {
            groupRenderer: 'boxplot',
            summaryRenderer: 'histogram',
        }));
        /**
         * currently active filter
         * @private
         */
        this.currentFilter = noNumberFilter();
        /**
         * The accuracy defines the deviation of values to the applied filter boundary.
         * Use an accuracy closer to 0 for columns with smaller numbers (e.g., 1e-9).
         * @private
         */
        this.filterAccuracy = 0.001;
        this.numberFormat = format('.2f');
        this.currentGroupThresholds = [];
        this.groupSortMethod = EAdvancedSortMethod.median;
        this.mapping = restoreMapping(desc, factory);
        this.original = this.mapping.clone();
        this.deriveMapping = this.mapping.domain.map((d) => d == null || Number.isNaN(d));
        this.colorMapping = factory.colorMappingFunction(desc.colorMapping || desc.color);
        if (desc.numberFormat) {
            this.numberFormat = format(desc.numberFormat);
        }
        if (desc.filterAccuracy) {
            this.filterAccuracy = desc.filterAccuracy;
        }
    }
    getNumberFormat() {
        return this.numberFormat;
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
            if (v == null || Number.isNaN(v)) {
                return acc;
            }
            if (v < acc.min) {
                acc.min = v;
            }
            if (v > acc.max) {
                acc.max = v;
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
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.map = this.mapping.toJSON();
        r.colorMapping = this.colorMapping.toJSON();
        r.filter = isDummyNumberFilter(this.currentFilter) ? null : this.currentFilter;
        r.groupSortMethod = this.groupSortMethod;
        if (this.currentGroupThresholds) {
            r.stratifyThresholds = this.currentGroupThresholds;
        }
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        if (dump.map || dump.domain) {
            this.mapping = restoreMapping(dump, factory);
        }
        if (dump.colorMapping) {
            this.colorMapping = factory.colorMappingFunction(dump.colorMapping);
        }
        if (dump.groupSortMethod) {
            this.groupSortMethod = dump.groupSortMethod;
        }
        if (dump.filter) {
            this.currentFilter = restoreNumberFilter(dump.filter);
        }
        if (dump.stratifyThresholds) {
            this.currentGroupThresholds = dump.stratifyThresholds;
        }
        if (dump.stratifyThreshholds) {
            this.currentGroupThresholds = dump.stratifyThreshholds;
        }
    }
    createEventList() {
        return super
            .createEventList()
            .concat([
            NumberColumn_1.EVENT_MAPPING_CHANGED,
            NumberColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            NumberColumn_1.EVENT_FILTER_CHANGED,
            NumberColumn_1.EVENT_SORTMETHOD_CHANGED,
            NumberColumn_1.EVENT_GROUPING_CHANGED,
        ]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getLabel(row) {
        if (this.desc.numberFormat) {
            const raw = this.getRawValue(row);
            //if a dedicated format and a number use the formatter in any case
            if (Number.isNaN(raw)) {
                return 'NaN';
            }
            if (!isFinite(raw)) {
                return raw.toString();
            }
            return this.numberFormat(raw);
        }
        const v = super.getValue(row);
        //keep non number if it is not a number else convert using formatter
        if (typeof v === 'number') {
            return this.numberFormat(+v);
        }
        return String(v);
    }
    getRange() {
        return this.mapping.getRange(this.numberFormat);
    }
    getRawValue(row) {
        const v = super.getValue(row);
        if (isMissingValue(v)) {
            return NaN;
        }
        return +v;
    }
    getExportValue(row, format) {
        return format === 'json' ? this.getRawValue(row) : super.getExportValue(row, format);
    }
    getValue(row) {
        const v = this.getNumber(row);
        if (Number.isNaN(v)) {
            return null;
        }
        return v;
    }
    getNumber(row) {
        const v = this.getRawValue(row);
        if (Number.isNaN(v)) {
            return NaN;
        }
        return this.mapping.apply(v);
    }
    iterNumber(row) {
        return [this.getNumber(row)];
    }
    iterRawNumber(row) {
        return [this.getRawNumber(row)];
    }
    getRawNumber(row) {
        return this.getRawValue(row);
    }
    toCompareValue(row, valueCache) {
        return valueCache != null ? valueCache : this.getNumber(row);
    }
    toCompareValueType() {
        return ECompareValueType.FLOAT;
    }
    toCompareGroupValue(rows, _group, valueCache) {
        return toCompareGroupValue(rows, this, this.groupSortMethod, valueCache);
    }
    toCompareGroupValueType() {
        return ECompareValueType.FLOAT;
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
            NumberColumn_1.EVENT_MAPPING_CHANGED,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY,
        ], this.mapping.clone(), (this.mapping = mapping));
    }
    getColor(row) {
        const v = this.getNumber(row);
        if (Number.isNaN(v)) {
            return DEFAULT_COLOR;
        }
        return this.colorMapping.apply(v);
    }
    getColorMapping() {
        return this.colorMapping.clone();
    }
    setColorMapping(mapping) {
        if (this.colorMapping.eq(mapping)) {
            return;
        }
        this.fire([
            NumberColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY,
        ], this.colorMapping.clone(), (this.colorMapping = mapping));
    }
    isFiltered() {
        return !isDummyNumberFilter(this.currentFilter);
    }
    getFilter() {
        return Object.assign({}, this.currentFilter);
    }
    setFilter(value) {
        value = value || { min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY, filterMissing: false };
        if (isEqualNumberFilter(value, this.currentFilter, this.filterAccuracy)) {
            return;
        }
        const bak = this.getFilter();
        this.currentFilter.min = isUnknown(value.min) ? Number.NEGATIVE_INFINITY : value.min;
        this.currentFilter.max = isUnknown(value.max) ? Number.POSITIVE_INFINITY : value.max;
        this.currentFilter.filterMissing = value.filterMissing;
        this.fire([NumberColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, this.getFilter());
    }
    /**
     * filter the current row if any filter is set
     * @param row
     * @returns {boolean}
     */
    filter(row) {
        return isNumberIncluded(this.currentFilter, this.getRawNumber(row));
    }
    clearFilter() {
        const was = this.isFiltered();
        this.setFilter(null);
        return was;
    }
    getGroupThresholds() {
        return this.currentGroupThresholds.slice();
    }
    setGroupThresholds(value) {
        if (equalArrays(this.currentGroupThresholds, value)) {
            return;
        }
        const bak = this.getGroupThresholds();
        this.currentGroupThresholds = value.slice();
        this.fire([NumberColumn_1.EVENT_GROUPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, value);
    }
    group(row) {
        const value = this.getRawNumber(row);
        if (Number.isNaN(value)) {
            return Object.assign({}, missingGroup);
        }
        let threshold = this.currentGroupThresholds;
        if (threshold.length === 0) {
            // default threshold
            const d = this.mapping.domain;
            threshold = [(d[1] - d[0]) / 2];
        }
        const thresholdIndex = threshold.findIndex((t) => value <= t);
        // group by thresholds / bins
        switch (thresholdIndex) {
            case -1:
                //bigger than the last threshold
                return {
                    name: `${this.label} > ${this.numberFormat(threshold[threshold.length - 1])}`,
                    color: this.colorMapping.apply(1),
                };
            case 0:
                //smallest
                return {
                    name: `${this.label} <= ${this.numberFormat(threshold[0])}`,
                    color: this.colorMapping.apply(0),
                };
            default:
                return {
                    name: `${this.numberFormat(threshold[thresholdIndex - 1])} <= ${this.label} <= ${this.numberFormat(threshold[thresholdIndex])}`,
                    color: this.colorMapping.apply(this.mapping.apply((threshold[thresholdIndex - 1] + threshold[thresholdIndex]) / 2)),
                };
        }
    }
    getSortMethod() {
        return this.groupSortMethod;
    }
    setSortMethod(sortMethod) {
        if (this.groupSortMethod === sortMethod) {
            return;
        }
        this.fire([NumberColumn_1.EVENT_SORTMETHOD_CHANGED], this.groupSortMethod, (this.groupSortMethod = sortMethod));
        // sort by me if not already sorted by me
        if (!this.isGroupSortedByMe().asc) {
            this.toggleMyGroupSorting();
        }
    }
};
NumberColumn.EVENT_MAPPING_CHANGED = 'mappingChanged';
NumberColumn.EVENT_COLOR_MAPPING_CHANGED = 'colorMappingChanged';
NumberColumn.EVENT_FILTER_CHANGED = 'filterChanged';
NumberColumn.EVENT_SORTMETHOD_CHANGED = 'sortMethodChanged';
NumberColumn.EVENT_GROUPING_CHANGED = 'groupingChanged';
NumberColumn = NumberColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'groupBy', 'sortGroupBy', 'filterNumber', 'colorMapped', 'editMapping'),
    dialogAddons('sortGroup', 'sortNumber'),
    dialogAddons('group', 'groupNumber'),
    Category('number'),
    SortByDefault('descending')
], NumberColumn);
export default NumberColumn;
