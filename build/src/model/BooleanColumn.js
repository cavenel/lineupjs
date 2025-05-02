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
var BooleanColumn = /** @class */ (function (_super) {
    __extends(BooleanColumn, _super);
    function BooleanColumn(id, desc) {
        var _a, _b;
        var _this = _super.call(this, id, integrateDefaults(desc, {
            width: 30,
            renderer: 'categorical',
            groupRenderer: 'categorical',
            summaryRenderer: 'categorical',
        })) || this;
        _this.currentFilter = null;
        _this.categories = [
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
        _this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
        return _this;
    }
    BooleanColumn_1 = BooleanColumn;
    BooleanColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([BooleanColumn_1.EVENT_COLOR_MAPPING_CHANGED, BooleanColumn_1.EVENT_FILTER_CHANGED]);
    };
    BooleanColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    Object.defineProperty(BooleanColumn.prototype, "dataLength", {
        get: function () {
            return this.categories.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BooleanColumn.prototype, "labels", {
        get: function () {
            return this.categories.map(function (d) { return d.label; });
        },
        enumerable: false,
        configurable: true
    });
    BooleanColumn.prototype.getValue = function (row) {
        var _a;
        var v = _super.prototype.getValue.call(this, row);
        if (typeof v === 'undefined' || v == null) {
            return null;
        }
        var trueValues = (_a = this.desc.trueValues) !== null && _a !== void 0 ? _a : BooleanColumn_1.DEFAULT_TRUE_VALUES;
        var vs = String(v).toLowerCase();
        return trueValues.some(function (d) { return d === v || d === vs; });
    };
    BooleanColumn.prototype.getCategoryOfBoolean = function (v) {
        return v == null ? null : this.categories[v ? 0 : 1];
    };
    BooleanColumn.prototype.getCategory = function (row) {
        var v = this.getValue(row);
        return v == null ? null : this.categories[v ? 0 : 1];
    };
    BooleanColumn.prototype.getCategories = function (row) {
        return [this.getCategory(row)];
    };
    BooleanColumn.prototype.iterCategory = function (row) {
        return [this.getCategory(row)];
    };
    BooleanColumn.prototype.getColor = function (row) {
        return CategoricalColumn.prototype.getColor.call(this, row);
    };
    BooleanColumn.prototype.getLabel = function (row) {
        return CategoricalColumn.prototype.getLabel.call(this, row);
    };
    BooleanColumn.prototype.getLabels = function (row) {
        return CategoricalColumn.prototype.getLabels.call(this, row);
    };
    BooleanColumn.prototype.getValues = function (row) {
        return CategoricalColumn.prototype.getValues.call(this, row);
    };
    BooleanColumn.prototype.getMap = function (row) {
        return CategoricalColumn.prototype.getMap.call(this, row);
    };
    BooleanColumn.prototype.getMapLabel = function (row) {
        return CategoricalColumn.prototype.getMapLabel.call(this, row);
    };
    BooleanColumn.prototype.getSet = function (row) {
        var v = this.getValue(row);
        var r = new Set();
        if (v != null) {
            r.add(this.categories[v ? 0 : 1]);
        }
        return r;
    };
    BooleanColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.colorMapping = this.colorMapping.toJSON();
        if (this.currentFilter != null) {
            r.filter = this.currentFilter;
        }
        return r;
    };
    BooleanColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
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
    };
    BooleanColumn.prototype.getColorMapping = function () {
        return this.colorMapping.clone();
    };
    BooleanColumn.prototype.setColorMapping = function (mapping) {
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
    };
    BooleanColumn.prototype.isFiltered = function () {
        return this.currentFilter != null;
    };
    BooleanColumn.prototype.filter = function (row) {
        return isCategoryIncluded(this.currentFilter, this.getCategory(row));
    };
    BooleanColumn.prototype.getFilter = function () {
        return this.currentFilter == null ? null : Object.assign({}, this.currentFilter);
    };
    BooleanColumn.prototype.setFilter = function (filter) {
        var f = typeof filter === 'boolean'
            ? { filter: [this.getCategoryOfBoolean(filter).name], filterMissing: false }
            : filter;
        if (isEqualCategoricalFilter(this.currentFilter, f)) {
            return;
        }
        this.fire([BooleanColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.currentFilter, (this.currentFilter = f));
    };
    BooleanColumn.prototype.clearFilter = function () {
        var was = this.isFiltered();
        this.setFilter(null);
        return was;
    };
    BooleanColumn.prototype.toCompareValue = function (row) {
        var v = this.getValue(row);
        if (v == null) {
            return NaN;
        }
        return v ? 1 : 0;
    };
    BooleanColumn.prototype.toCompareValueType = function () {
        return ECompareValueType.BINARY;
    };
    BooleanColumn.prototype.group = function (row) {
        var v = this.getValue(row);
        if (v == null) {
            return Object.assign({}, missingGroup);
        }
        return Object.assign({}, v ? BooleanColumn_1.GROUP_TRUE : BooleanColumn_1.GROUP_FALSE);
    };
    var BooleanColumn_1;
    BooleanColumn.EVENT_FILTER_CHANGED = 'filterChanged';
    BooleanColumn.EVENT_COLOR_MAPPING_CHANGED = 'colorMappingChanged';
    BooleanColumn.GROUP_TRUE = { name: 'True', color: '#444444' };
    BooleanColumn.GROUP_FALSE = { name: 'False', color: '#dddddd' };
    BooleanColumn.DEFAULT_TRUE_VALUES = ['y', 'yes', 'true', true, '1', '1.0', 1, 1.0, 'on'];
    BooleanColumn = BooleanColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'group', 'groupBy', 'filterCategorical', 'colorMappedCategorical'),
        Category('categorical')
    ], BooleanColumn);
    return BooleanColumn;
}(ValueColumn));
export default BooleanColumn;
//# sourceMappingURL=BooleanColumn.js.map