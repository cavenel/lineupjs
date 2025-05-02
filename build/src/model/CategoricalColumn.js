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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Category, toolbar } from './annotations';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged, DEFAULT_COLOR, } from './Column';
import { ECompareValueType } from './interfaces';
import { missingGroup } from './missing';
import ValueColumn from './ValueColumn';
import { toCategories, isCategoryIncluded, isEqualCategoricalFilter, toCompareCategoryValue, toGroupCompareCategoryValue, compareCategory, } from './internalCategorical';
/**
 * column for categorical values
 */
var CategoricalColumn = /** @class */ (function (_super) {
    __extends(CategoricalColumn, _super);
    function CategoricalColumn(id, desc) {
        var _this = _super.call(this, id, desc) || this;
        _this.lookup = new Map();
        /**
         * set of categories to show
         * @type {null}
         * @private
         */
        _this.currentFilter = null;
        _this.categories = toCategories(desc);
        _this.categories.forEach(function (d) { return _this.lookup.set(d.name, d); });
        _this.categoryOrder = desc.categoryOrder || 'given';
        _this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
        return _this;
    }
    CategoricalColumn_1 = CategoricalColumn;
    CategoricalColumn.prototype.onDataUpdate = function (rows) {
        var _a;
        var _this = this;
        _super.prototype.onDataUpdate.call(this, rows);
        if (Array.isArray(this.desc.categories) && this.categoryOrder === 'given') {
            return;
        }
        // derive hist
        var categories = new Map();
        rows.forEach(function (row) {
            var value = _super.prototype.getValue.call(_this, row);
            if (!value) {
                return;
            }
            var sValue = String(value);
            var entry = categories.get(sValue);
            if (!entry) {
                categories.set(sValue, { name: sValue, count: 1 });
            }
            else {
                entry.count++;
            }
        });
        if (!Array.isArray(this.desc.categories)) {
            // derive
            var categoryNames = Array.from(categories.keys());
            categoryNames.sort();
            (_a = this.categories).splice.apply(_a, __spreadArray([0, this.categories.length], toCategories({ categories: categoryNames }), false));
            this.categories.forEach(function (d) { return _this.lookup.set(d.name, d); });
        }
        this.sortCategories(categories);
    };
    CategoricalColumn.prototype.sortCategories = function (hist) {
        var _a;
        var _this = this;
        var _b, _c;
        // patch values of categories
        for (var _i = 0, _d = this.categories; _i < _d.length; _i++) {
            var cat = _d[_i];
            cat.value = (_c = (_b = hist.get(cat.name)) === null || _b === void 0 ? void 0 : _b.count) !== null && _c !== void 0 ? _c : 0;
        }
        // sort
        if (typeof this.categoryOrder === 'function') {
            (_a = this.categories).splice.apply(_a, __spreadArray([0, this.categories.length], this.categoryOrder(this.categories), false));
        }
        else if (this.categoryOrder === 'large-to-small') {
            // revert order of value
            for (var _e = 0, _f = this.categories; _e < _f.length; _e++) {
                var cat = _f[_e];
                cat.value = -1 * cat.value;
            }
            this.categories.sort(compareCategory);
        }
        else if (this.categoryOrder === 'small-to-large') {
            this.categories.sort(compareCategory);
        }
        // patch the ICategory.value to match the new order
        this.categories.forEach(function (cat, i) {
            cat.value = i / _this.categories.length;
        });
    };
    CategoricalColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([CategoricalColumn_1.EVENT_FILTER_CHANGED, CategoricalColumn_1.EVENT_COLOR_MAPPING_CHANGED]);
    };
    CategoricalColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    CategoricalColumn.prototype.getValue = function (row) {
        var v = this.getCategory(row);
        return v ? v.name : null;
    };
    CategoricalColumn.prototype.getCategory = function (row) {
        var v = _super.prototype.getValue.call(this, row);
        if (!v) {
            return null;
        }
        var vs = String(v);
        return this.lookup.has(vs) ? this.lookup.get(vs) : null;
    };
    Object.defineProperty(CategoricalColumn.prototype, "dataLength", {
        get: function () {
            return this.categories.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoricalColumn.prototype, "labels", {
        get: function () {
            return this.categories.map(function (d) { return d.label; });
        },
        enumerable: false,
        configurable: true
    });
    CategoricalColumn.prototype.getLabel = function (row) {
        var v = this.getCategory(row);
        return v ? v.label : '';
    };
    CategoricalColumn.prototype.getCategories = function (row) {
        var v = this.getCategory(row);
        return [v];
    };
    CategoricalColumn.prototype.getValues = function (row) {
        var v = this.getCategory(row);
        return this.categories.map(function (d) { return d === v; });
    };
    CategoricalColumn.prototype.getLabels = function (row) {
        return this.getValues(row).map(String);
    };
    CategoricalColumn.prototype.getMap = function (row) {
        var cats = this.categories;
        return this.getValues(row).map(function (value, i) { return ({ key: cats[i].label, value: value }); });
    };
    CategoricalColumn.prototype.getMapLabel = function (row) {
        var cats = this.categories;
        return this.getLabels(row).map(function (value, i) { return ({ key: cats[i].label, value: value }); });
    };
    CategoricalColumn.prototype.getSet = function (row) {
        var cat = this.getCategory(row);
        var r = new Set();
        if (cat) {
            r.add(cat);
        }
        return r;
    };
    CategoricalColumn.prototype.iterCategory = function (row) {
        return [this.getCategory(row)];
    };
    CategoricalColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.filter = this.currentFilter;
        r.colorMapping = this.colorMapping.toJSON();
        return r;
    };
    CategoricalColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        this.colorMapping = factory.categoricalColorMappingFunction(dump.colorMapping, this.categories);
        if (typeof dump.filter === 'undefined') {
            this.currentFilter = null;
            return;
        }
        var bak = dump.filter;
        if (typeof bak === 'string' || Array.isArray(bak)) {
            this.currentFilter = { filter: bak, filterMissing: false };
        }
        else {
            this.currentFilter = bak;
        }
    };
    CategoricalColumn.prototype.getColor = function (row) {
        var v = this.getCategory(row);
        return v ? this.colorMapping.apply(v) : DEFAULT_COLOR;
    };
    CategoricalColumn.prototype.getColorMapping = function () {
        return this.colorMapping.clone();
    };
    CategoricalColumn.prototype.setColorMapping = function (mapping) {
        if (this.colorMapping.eq(mapping)) {
            return;
        }
        this.fire([
            CategoricalColumn_1.EVENT_COLOR_MAPPING_CHANGED,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY,
        ], this.colorMapping.clone(), (this.colorMapping = mapping));
    };
    CategoricalColumn.prototype.isFiltered = function () {
        return this.currentFilter != null;
    };
    CategoricalColumn.prototype.filter = function (row, valueCache) {
        return isCategoryIncluded(this.currentFilter, valueCache !== undefined ? valueCache : this.getCategory(row));
    };
    CategoricalColumn.prototype.getFilter = function () {
        return this.currentFilter == null ? null : Object.assign({}, this.currentFilter);
    };
    CategoricalColumn.prototype.setFilter = function (filter) {
        if (isEqualCategoricalFilter(this.currentFilter, filter)) {
            return;
        }
        this.fire([CategoricalColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.currentFilter, (this.currentFilter = filter));
    };
    CategoricalColumn.prototype.clearFilter = function () {
        var was = this.isFiltered();
        this.setFilter(null);
        return was;
    };
    CategoricalColumn.prototype.toCompareValue = function (row, valueCache) {
        return toCompareCategoryValue(valueCache !== undefined ? valueCache : this.getCategory(row));
    };
    CategoricalColumn.prototype.toCompareValueType = function () {
        return ECompareValueType.FLOAT_ASC;
    };
    CategoricalColumn.prototype.group = function (row, valueCache) {
        var cat = valueCache !== undefined ? valueCache : this.getCategory(row);
        if (!cat) {
            return Object.assign({}, missingGroup);
        }
        return { name: cat.label, color: cat.color };
    };
    CategoricalColumn.prototype.toCompareGroupValue = function (rows, _group, valueCache) {
        return toGroupCompareCategoryValue(rows, this, valueCache);
    };
    CategoricalColumn.prototype.toCompareGroupValueType = function () {
        return [ECompareValueType.FLOAT, ECompareValueType.STRING];
    };
    CategoricalColumn.prototype.getGroupRenderer = function () {
        var current = _super.prototype.getGroupRenderer.call(this);
        if (current === this.desc.type && this.isGroupedBy() >= 0) {
            // still the default and the stratification criteria
            return 'catdistributionbar';
        }
        return current;
    };
    var CategoricalColumn_1;
    CategoricalColumn.EVENT_FILTER_CHANGED = 'filterChanged';
    CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED = 'colorMappingChanged';
    CategoricalColumn = CategoricalColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'group', 'groupBy', 'sortGroupBy', 'filterCategorical', 'colorMappedCategorical'),
        Category('categorical')
    ], CategoricalColumn);
    return CategoricalColumn;
}(ValueColumn));
export default CategoricalColumn;
//# sourceMappingURL=CategoricalColumn.js.map