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
var NumbersColumn = /** @class */ (function (_super) {
    __extends(NumbersColumn, _super);
    function NumbersColumn(id, desc, factory) {
        var _this = _super.call(this, id, integrateDefaults(desc, Object.assign({
            renderer: 'heatmap',
            groupRenderer: 'heatmap',
            summaryRenderer: 'histogram',
        }, desc.dataLength != null && !Number.isNaN(desc.dataLength)
            ? {
                // better initialize the default with based on the data length
                width: Math.min(Math.max(100, desc.dataLength * 10), 500),
            }
            : {}))) || this;
        _this.numberFormat = DEFAULT_FORMATTER;
        /**
         * currently active filter
         * @type {{min: number, max: number}}
         * @private
         */
        _this.currentFilter = noNumberFilter();
        _this.mapping = restoreMapping(desc, factory);
        _this.original = _this.mapping.clone();
        _this.deriveMapping = _this.mapping.domain.map(function (d) { return d == null || Number.isNaN(d); });
        _this.colorMapping = factory.colorMappingFunction(desc.colorMapping || desc.color);
        if (desc.numberFormat) {
            _this.numberFormat = format(desc.numberFormat);
        }
        _this.sort = desc.sort || EAdvancedSortMethod.median;
        return _this;
    }
    NumbersColumn_1 = NumbersColumn;
    NumbersColumn.prototype.onDataUpdate = function (rows) {
        var _this = this;
        _super.prototype.onDataUpdate.call(this, rows);
        if (!this.deriveMapping.some(Boolean)) {
            return;
        }
        // hook for listening to data updates
        var minMax = rows
            .map(function (row) { return _this.getRawValue(row); })
            .reduce(function (acc, v) {
            if (v == null || !Array.isArray(v)) {
                return acc;
            }
            for (var _i = 0, v_1 = v; _i < v_1.length; _i++) {
                var vi = v_1[_i];
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
    NumbersColumn.prototype.getNumberFormat = function () {
        return this.numberFormat;
    };
    NumbersColumn.prototype.toCompareValue = function (row) {
        return toCompareBoxPlotValue(this, row);
    };
    NumbersColumn.prototype.toCompareValueType = function () {
        return ECompareValueType.FLOAT;
    };
    NumbersColumn.prototype.getRawNumbers = function (row) {
        return this.getRawValue(row);
    };
    NumbersColumn.prototype.getBoxPlotData = function (row) {
        var data = this.getRawValue(row);
        if (data == null) {
            return null;
        }
        var b = boxplotBuilder();
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var d = data_1[_i];
            b.push(isMissingValue(d) ? NaN : this.mapping.apply(d));
        }
        return b.build();
    };
    NumbersColumn.prototype.getRange = function () {
        return this.mapping.getRange(this.numberFormat);
    };
    NumbersColumn.prototype.getRawBoxPlotData = function (row) {
        var data = this.getRawValue(row);
        if (data == null) {
            return null;
        }
        var b = boxplotBuilder();
        for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
            var d = data_2[_i];
            b.push(isMissingValue(d) ? NaN : d);
        }
        return b.build();
    };
    NumbersColumn.prototype.getNumbers = function (row) {
        return this.getValues(row);
    };
    NumbersColumn.prototype.getNumber = function (row) {
        return getBoxPlotNumber(this, row, 'normalized');
    };
    NumbersColumn.prototype.getRawNumber = function (row) {
        return getBoxPlotNumber(this, row, 'raw');
    };
    NumbersColumn.prototype.getValue = function (row) {
        var v = this.getValues(row);
        return v.every(Number.isNaN) ? null : v;
    };
    NumbersColumn.prototype.getValues = function (row) {
        var _this = this;
        return this.getRawValue(row).map(function (d) { return (Number.isNaN(d) ? NaN : _this.mapping.apply(d)); });
    };
    NumbersColumn.prototype.iterNumber = function (row) {
        var v = this.getNumbers(row);
        if (v.every(Number.isNaN)) {
            // missing row
            return [NaN];
        }
        return v;
    };
    NumbersColumn.prototype.iterRawNumber = function (row) {
        var v = this.getRawNumbers(row);
        if (v.every(Number.isNaN)) {
            // missing row
            return [NaN];
        }
        return v;
    };
    NumbersColumn.prototype.getRawValue = function (row) {
        var r = _super.prototype.getRaw.call(this, row);
        return r == null ? [] : r.map(function (d) { return (isMissingValue(d) ? NaN : +d); });
    };
    NumbersColumn.prototype.getExportValue = function (row, format) {
        return format === 'json' ? this.getRawValue(row) : _super.prototype.getExportValue.call(this, row, format);
    };
    NumbersColumn.prototype.getLabels = function (row) {
        return this.getRawValue(row).map(this.numberFormat);
    };
    NumbersColumn.prototype.getSortMethod = function () {
        return this.sort;
    };
    NumbersColumn.prototype.setSortMethod = function (sort) {
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
    };
    NumbersColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.sortMethod = this.getSortMethod();
        r.filter = !isDummyNumberFilter(this.currentFilter) ? this.currentFilter : null;
        r.map = this.mapping.toJSON();
        r.colorMapping = this.colorMapping.toJSON();
        return r;
    };
    NumbersColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
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
    };
    NumbersColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            NumbersColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            NumbersColumn_1.EVENT_MAPPING_CHANGED,
            NumbersColumn_1.EVENT_SORTMETHOD_CHANGED,
            NumbersColumn_1.EVENT_FILTER_CHANGED,
        ]);
    };
    NumbersColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    NumbersColumn.prototype.getOriginalMapping = function () {
        return this.original.clone();
    };
    NumbersColumn.prototype.getMapping = function () {
        return this.mapping.clone();
    };
    NumbersColumn.prototype.setMapping = function (mapping) {
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
    };
    NumbersColumn.prototype.getColor = function (row) {
        return NumberColumn.prototype.getColor.call(this, row);
    };
    NumbersColumn.prototype.getColorMapping = function () {
        return this.colorMapping.clone();
    };
    NumbersColumn.prototype.setColorMapping = function (mapping) {
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
    };
    NumbersColumn.prototype.isFiltered = function () {
        return NumberColumn.prototype.isFiltered.call(this);
    };
    NumbersColumn.prototype.getFilter = function () {
        return NumberColumn.prototype.getFilter.call(this);
    };
    NumbersColumn.prototype.setFilter = function (value) {
        NumberColumn.prototype.setFilter.call(this, value);
    };
    NumbersColumn.prototype.filter = function (row) {
        return NumberColumn.prototype.filter.call(this, row);
    };
    NumbersColumn.prototype.clearFilter = function () {
        return NumberColumn.prototype.clearFilter.call(this);
    };
    var NumbersColumn_1;
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
    return NumbersColumn;
}(ArrayColumn));
export default NumbersColumn;
//# sourceMappingURL=NumbersColumn.js.map