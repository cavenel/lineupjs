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
var NumberMapColumn = /** @class */ (function (_super) {
    __extends(NumberMapColumn, _super);
    function NumberMapColumn(id, desc, factory) {
        var _this = _super.call(this, id, integrateDefaults(desc, {
            renderer: 'mapbars',
        })) || this;
        _this.numberFormat = DEFAULT_FORMATTER;
        /**
         * currently active filter
         * @type {{min: number, max: number}}
         * @private
         */
        _this.currentFilter = noNumberFilter();
        _this.mapping = restoreMapping(desc, factory);
        _this.original = _this.mapping.clone();
        _this.colorMapping = factory.colorMappingFunction(desc.colorMapping || desc.color);
        _this.sort = desc.sort || EAdvancedSortMethod.median;
        if (desc.numberFormat) {
            _this.numberFormat = format(desc.numberFormat);
        }
        return _this;
    }
    NumberMapColumn_1 = NumberMapColumn;
    NumberMapColumn.prototype.getNumberFormat = function () {
        return this.numberFormat;
    };
    NumberMapColumn.prototype.toCompareValue = function (row) {
        return toCompareBoxPlotValue(this, row);
    };
    NumberMapColumn.prototype.toCompareValueType = function () {
        return ECompareValueType.FLOAT;
    };
    NumberMapColumn.prototype.getBoxPlotData = function (row) {
        var data = this.getRawValue(row);
        if (data == null) {
            return null;
        }
        var b = boxplotBuilder();
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var d = data_1[_i];
            b.push(isMissingValue(d.value) ? NaN : this.mapping.apply(d.value));
        }
        return b.build();
    };
    NumberMapColumn.prototype.getRange = function () {
        return this.mapping.getRange(this.numberFormat);
    };
    NumberMapColumn.prototype.getRawBoxPlotData = function (row) {
        var data = this.getRawValue(row);
        if (data == null) {
            return null;
        }
        var b = boxplotBuilder();
        for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
            var d = data_2[_i];
            b.push(isMissingValue(d.value) ? NaN : d.value);
        }
        return b.build();
    };
    NumberMapColumn.prototype.getNumber = function (row) {
        return getBoxPlotNumber(this, row, 'normalized');
    };
    NumberMapColumn.prototype.getRawNumber = function (row) {
        return getBoxPlotNumber(this, row, 'raw');
    };
    NumberMapColumn.prototype.iterNumber = function (row) {
        var r = this.getValue(row);
        return r ? r.map(function (d) { return d.value; }) : [NaN];
    };
    NumberMapColumn.prototype.iterRawNumber = function (row) {
        var r = this.getRawValue(row);
        return r ? r.map(function (d) { return d.value; }) : [NaN];
    };
    NumberMapColumn.prototype.getValue = function (row) {
        var _this = this;
        var values = this.getRawValue(row);
        return values.length === 0
            ? null
            : values.map(function (_a) {
                var key = _a.key, value = _a.value;
                return ({ key: key, value: isMissingValue(value) ? NaN : _this.mapping.apply(value) });
            });
    };
    NumberMapColumn.prototype.getRawValue = function (row) {
        var r = _super.prototype.getValue.call(this, row);
        return r == null ? [] : r;
    };
    NumberMapColumn.prototype.getExportValue = function (row, format) {
        return format === 'json' ? this.getRawValue(row) : _super.prototype.getExportValue.call(this, row, format);
    };
    NumberMapColumn.prototype.getLabels = function (row) {
        var _this = this;
        var v = this.getRawValue(row);
        return v.map(function (_a) {
            var key = _a.key, value = _a.value;
            return ({ key: key, value: _this.numberFormat(value) });
        });
    };
    NumberMapColumn.prototype.getSortMethod = function () {
        return this.sort;
    };
    NumberMapColumn.prototype.setSortMethod = function (sort) {
        if (this.sort === sort) {
            return;
        }
        this.fire([NumberMapColumn_1.EVENT_SORTMETHOD_CHANGED], this.sort, (this.sort = sort));
        // sort by me if not already sorted by me
        if (!this.isSortedByMe().asc) {
            this.sortByMe();
        }
    };
    NumberMapColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.sortMethod = this.getSortMethod();
        r.filter = !isDummyNumberFilter(this.currentFilter) ? this.currentFilter : null;
        r.map = this.mapping.toJSON();
        r.colorMapping = this.colorMapping.toJSON();
        return r;
    };
    NumberMapColumn.prototype.restore = function (dump, factory) {
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
    NumberMapColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            NumberMapColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            NumberMapColumn_1.EVENT_MAPPING_CHANGED,
            NumberMapColumn_1.EVENT_SORTMETHOD_CHANGED,
            NumberMapColumn_1.EVENT_FILTER_CHANGED,
        ]);
    };
    NumberMapColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    NumberMapColumn.prototype.getOriginalMapping = function () {
        return this.original.clone();
    };
    NumberMapColumn.prototype.getMapping = function () {
        return this.mapping.clone();
    };
    NumberMapColumn.prototype.setMapping = function (mapping) {
        if (this.mapping.eq(mapping)) {
            return;
        }
        this.fire([NumberMapColumn_1.EVENT_MAPPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.mapping.clone(), (this.mapping = mapping));
    };
    NumberMapColumn.prototype.getColor = function (row) {
        return NumberColumn.prototype.getColor.call(this, row);
    };
    NumberMapColumn.prototype.getColorMapping = function () {
        return this.colorMapping.clone();
    };
    NumberMapColumn.prototype.setColorMapping = function (mapping) {
        if (this.colorMapping.eq(mapping)) {
            return;
        }
        this.fire([NumberMapColumn_1.EVENT_COLOR_MAPPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.colorMapping.clone(), (this.colorMapping = mapping));
    };
    NumberMapColumn.prototype.isFiltered = function () {
        return NumberColumn.prototype.isFiltered.call(this);
    };
    NumberMapColumn.prototype.getFilter = function () {
        return NumberColumn.prototype.getFilter.call(this);
    };
    NumberMapColumn.prototype.setFilter = function (value) {
        NumberColumn.prototype.setFilter.call(this, value);
    };
    NumberMapColumn.prototype.filter = function (row) {
        return NumberColumn.prototype.filter.call(this, row);
    };
    NumberMapColumn.prototype.clearFilter = function () {
        return NumberColumn.prototype.clearFilter.call(this);
    };
    var NumberMapColumn_1;
    NumberMapColumn.EVENT_MAPPING_CHANGED = NumberColumn.EVENT_MAPPING_CHANGED;
    NumberMapColumn.EVENT_COLOR_MAPPING_CHANGED = NumberColumn.EVENT_COLOR_MAPPING_CHANGED;
    NumberMapColumn.EVENT_SORTMETHOD_CHANGED = NumberColumn.EVENT_SORTMETHOD_CHANGED;
    NumberMapColumn.EVENT_FILTER_CHANGED = NumberColumn.EVENT_FILTER_CHANGED;
    NumberMapColumn = NumberMapColumn_1 = __decorate([
        toolbar('rename', 'filterNumber', 'colorMapped', 'editMapping'),
        dialogAddons('sort', 'sortNumbers'),
        SortByDefault('descending')
    ], NumberMapColumn);
    return NumberMapColumn;
}(MapColumn));
export default NumberMapColumn;
//# sourceMappingURL=NumberMapColumn.js.map