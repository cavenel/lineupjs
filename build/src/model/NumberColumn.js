var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var NumberColumn = /** @class */ (function (_super) {
    __extends(NumberColumn, _super);
    function NumberColumn(id, desc, factory) {
        var _this = _super.call(this, id, integrateDefaults(desc, {
            groupRenderer: 'boxplot',
            summaryRenderer: 'histogram',
        })) || this;
        /**
         * currently active filter
         * @private
         */
        _this.currentFilter = noNumberFilter();
        /**
         * The accuracy defines the deviation of values to the applied filter boundary.
         * Use an accuracy closer to 0 for columns with smaller numbers (e.g., 1e-9).
         * @private
         */
        _this.filterAccuracy = 0.001;
        _this.numberFormat = format('.2f');
        _this.currentGroupThresholds = [];
        _this.groupSortMethod = EAdvancedSortMethod.median;
        _this.mapping = restoreMapping(desc, factory);
        _this.original = _this.mapping.clone();
        _this.deriveMapping = _this.mapping.domain.map(function (d) { return d == null || Number.isNaN(d); });
        _this.colorMapping = factory.colorMappingFunction(desc.colorMapping || desc.color);
        if (desc.numberFormat) {
            _this.numberFormat = format(desc.numberFormat);
        }
        if (desc.filterAccuracy) {
            _this.filterAccuracy = desc.filterAccuracy;
        }
        return _this;
    }
    NumberColumn_1 = NumberColumn;
    NumberColumn.prototype.getNumberFormat = function () {
        return this.numberFormat;
    };
    NumberColumn.prototype.onDataUpdate = function (rows) {
        var _this = this;
        _super.prototype.onDataUpdate.call(this, rows);
        if (!this.deriveMapping.some(Boolean)) {
            return;
        }
        // hook for listening to data updates
        var minMax = rows
            .map(function (row) { return _this.getRawValue(row); })
            .reduce(function (acc, v) {
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
        var domain = this.mapping.domain.slice();
        if (this.deriveMapping[0]) {
            domain[0] = minMax.min;
        }
        if (this.deriveMapping[this.deriveMapping.length - 1]) {
            domain[domain.length - 1] = minMax.max;
        }
        this.mapping.domain = domain;
        this.original.domain = domain;
    };
    NumberColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.map = this.mapping.toJSON();
        r.colorMapping = this.colorMapping.toJSON();
        r.filter = isDummyNumberFilter(this.currentFilter) ? null : this.currentFilter;
        r.groupSortMethod = this.groupSortMethod;
        if (this.currentGroupThresholds) {
            r.stratifyThresholds = this.currentGroupThresholds;
        }
        return r;
    };
    NumberColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
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
    };
    NumberColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            NumberColumn_1.EVENT_MAPPING_CHANGED,
            NumberColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            NumberColumn_1.EVENT_FILTER_CHANGED,
            NumberColumn_1.EVENT_SORTMETHOD_CHANGED,
            NumberColumn_1.EVENT_GROUPING_CHANGED,
        ]);
    };
    NumberColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    NumberColumn.prototype.getLabel = function (row) {
        if (this.desc.numberFormat) {
            var raw = this.getRawValue(row);
            //if a dedicated format and a number use the formatter in any case
            if (Number.isNaN(raw)) {
                return 'NaN';
            }
            if (!isFinite(raw)) {
                return raw.toString();
            }
            return this.numberFormat(raw);
        }
        var v = _super.prototype.getValue.call(this, row);
        //keep non number if it is not a number else convert using formatter
        if (typeof v === 'number') {
            return this.numberFormat(+v);
        }
        return String(v);
    };
    NumberColumn.prototype.getRange = function () {
        return this.mapping.getRange(this.numberFormat);
    };
    NumberColumn.prototype.getRawValue = function (row) {
        var v = _super.prototype.getValue.call(this, row);
        if (isMissingValue(v)) {
            return NaN;
        }
        return +v;
    };
    NumberColumn.prototype.getExportValue = function (row, format) {
        return format === 'json' ? this.getRawValue(row) : _super.prototype.getExportValue.call(this, row, format);
    };
    NumberColumn.prototype.getValue = function (row) {
        var v = this.getNumber(row);
        if (Number.isNaN(v)) {
            return null;
        }
        return v;
    };
    NumberColumn.prototype.getNumber = function (row) {
        var v = this.getRawValue(row);
        if (Number.isNaN(v)) {
            return NaN;
        }
        return this.mapping.apply(v);
    };
    NumberColumn.prototype.iterNumber = function (row) {
        return [this.getNumber(row)];
    };
    NumberColumn.prototype.iterRawNumber = function (row) {
        return [this.getRawNumber(row)];
    };
    NumberColumn.prototype.getRawNumber = function (row) {
        return this.getRawValue(row);
    };
    NumberColumn.prototype.toCompareValue = function (row, valueCache) {
        return valueCache != null ? valueCache : this.getNumber(row);
    };
    NumberColumn.prototype.toCompareValueType = function () {
        return ECompareValueType.FLOAT;
    };
    NumberColumn.prototype.toCompareGroupValue = function (rows, _group, valueCache) {
        return toCompareGroupValue(rows, this, this.groupSortMethod, valueCache);
    };
    NumberColumn.prototype.toCompareGroupValueType = function () {
        return ECompareValueType.FLOAT;
    };
    NumberColumn.prototype.getOriginalMapping = function () {
        return this.original.clone();
    };
    NumberColumn.prototype.getMapping = function () {
        return this.mapping.clone();
    };
    NumberColumn.prototype.setMapping = function (mapping) {
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
    };
    NumberColumn.prototype.getColor = function (row) {
        var v = this.getNumber(row);
        if (Number.isNaN(v)) {
            return DEFAULT_COLOR;
        }
        return this.colorMapping.apply(v);
    };
    NumberColumn.prototype.getColorMapping = function () {
        return this.colorMapping.clone();
    };
    NumberColumn.prototype.setColorMapping = function (mapping) {
        if (this.colorMapping.eq(mapping)) {
            return;
        }
        this.fire([
            NumberColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY,
        ], this.colorMapping.clone(), (this.colorMapping = mapping));
    };
    NumberColumn.prototype.isFiltered = function () {
        return !isDummyNumberFilter(this.currentFilter);
    };
    NumberColumn.prototype.getFilter = function () {
        return Object.assign({}, this.currentFilter);
    };
    NumberColumn.prototype.setFilter = function (value) {
        value = value || { min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY, filterMissing: false };
        if (isEqualNumberFilter(value, this.currentFilter, this.filterAccuracy)) {
            return;
        }
        var bak = this.getFilter();
        this.currentFilter.min = isUnknown(value.min) ? Number.NEGATIVE_INFINITY : value.min;
        this.currentFilter.max = isUnknown(value.max) ? Number.POSITIVE_INFINITY : value.max;
        this.currentFilter.filterMissing = value.filterMissing;
        this.fire([NumberColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, this.getFilter());
    };
    /**
     * filter the current row if any filter is set
     * @param row
     * @returns {boolean}
     */
    NumberColumn.prototype.filter = function (row) {
        return isNumberIncluded(this.currentFilter, this.getRawNumber(row));
    };
    NumberColumn.prototype.clearFilter = function () {
        var was = this.isFiltered();
        this.setFilter(null);
        return was;
    };
    NumberColumn.prototype.getGroupThresholds = function () {
        return this.currentGroupThresholds.slice();
    };
    NumberColumn.prototype.setGroupThresholds = function (value) {
        if (equalArrays(this.currentGroupThresholds, value)) {
            return;
        }
        var bak = this.getGroupThresholds();
        this.currentGroupThresholds = value.slice();
        this.fire([NumberColumn_1.EVENT_GROUPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, value);
    };
    NumberColumn.prototype.group = function (row) {
        var value = this.getRawNumber(row);
        if (Number.isNaN(value)) {
            return Object.assign({}, missingGroup);
        }
        var threshold = this.currentGroupThresholds;
        if (threshold.length === 0) {
            // default threshold
            var d = this.mapping.domain;
            threshold = [(d[1] - d[0]) / 2];
        }
        var thresholdIndex = threshold.findIndex(function (t) { return value <= t; });
        // group by thresholds / bins
        switch (thresholdIndex) {
            case -1:
                //bigger than the last threshold
                return {
                    name: "".concat(this.label, " > ").concat(this.numberFormat(threshold[threshold.length - 1])),
                    color: this.colorMapping.apply(1),
                };
            case 0:
                //smallest
                return {
                    name: "".concat(this.label, " <= ").concat(this.numberFormat(threshold[0])),
                    color: this.colorMapping.apply(0),
                };
            default:
                return {
                    name: "".concat(this.numberFormat(threshold[thresholdIndex - 1]), " <= ").concat(this.label, " <= ").concat(this.numberFormat(threshold[thresholdIndex])),
                    color: this.colorMapping.apply(this.mapping.apply((threshold[thresholdIndex - 1] + threshold[thresholdIndex]) / 2)),
                };
        }
    };
    NumberColumn.prototype.getSortMethod = function () {
        return this.groupSortMethod;
    };
    NumberColumn.prototype.setSortMethod = function (sortMethod) {
        if (this.groupSortMethod === sortMethod) {
            return;
        }
        this.fire([NumberColumn_1.EVENT_SORTMETHOD_CHANGED], this.groupSortMethod, (this.groupSortMethod = sortMethod));
        // sort by me if not already sorted by me
        if (!this.isGroupSortedByMe().asc) {
            this.toggleMyGroupSorting();
        }
    };
    var NumberColumn_1;
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
    return NumberColumn;
}(ValueColumn));
export default NumberColumn;
//# sourceMappingURL=NumberColumn.js.map