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
import Column, { labelChanged, metaDataChanged, dirty, widthChanged, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, DEFAULT_COLOR, } from './Column';
import { ECompareValueType } from './interfaces';
import ValueColumn from './ValueColumn';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import { toCategories, isCategoryIncluded, isEqualSetCategoricalFilter } from './internalCategorical';
import { chooseUIntByDataLength, integrateDefaults } from './internal';
/**
 * a string column with optional alignment
 */
var SetColumn = /** @class */ (function (_super) {
    __extends(SetColumn, _super);
    function SetColumn(id, desc) {
        var _this = _super.call(this, id, integrateDefaults(desc, {
            renderer: 'upset',
            groupRenderer: 'upset',
            summaryRenderer: 'categorical',
        })) || this;
        _this.lookup = new Map();
        /**
         * set of categories to show
         * @type {null}
         * @private
         */
        _this.currentFilter = null;
        _this.separator = new RegExp(desc.separator || ';');
        _this.categories = toCategories(desc);
        _this.categories.forEach(function (d) { return _this.lookup.set(d.name, d); });
        _this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
        return _this;
    }
    SetColumn_1 = SetColumn;
    SetColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([SetColumn_1.EVENT_COLOR_MAPPING_CHANGED, SetColumn_1.EVENT_FILTER_CHANGED]);
    };
    SetColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    Object.defineProperty(SetColumn.prototype, "labels", {
        get: function () {
            return this.categories.map(function (d) { return d.label; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SetColumn.prototype, "dataLength", {
        get: function () {
            return this.categories.length;
        },
        enumerable: false,
        configurable: true
    });
    SetColumn.prototype.getValue = function (row) {
        var v = this.getSortedSet(row);
        if (v.length === 0) {
            return null;
        }
        return v.map(function (d) { return d.name; });
    };
    SetColumn.prototype.getLabel = function (row) {
        return "(".concat(this.getSortedSet(row)
            .map(function (d) { return d.label; })
            .join(','), ")");
    };
    SetColumn.prototype.normalize = function (v) {
        if (typeof v === 'string') {
            return v.split(this.separator).map(function (s) { return s.trim(); });
        }
        if (Array.isArray(v)) {
            return v.map(function (v) { return String(v).trim(); });
        }
        if (v instanceof Set) {
            return Array.from(v).map(String);
        }
        return [];
    };
    SetColumn.prototype.getSet = function (row) {
        var _this = this;
        var sv = this.normalize(_super.prototype.getValue.call(this, row));
        var r = new Set();
        sv.forEach(function (n) {
            var cat = _this.lookup.get(n);
            if (cat) {
                r.add(cat);
            }
        });
        return r;
    };
    SetColumn.prototype.getSortedSet = function (row) {
        return Array.from(this.getSet(row)).sort(function (a, b) {
            return a.value === b.value ? a.label.localeCompare(b.label) : a.value - b.value;
        });
    };
    SetColumn.prototype.getCategories = function (row) {
        return this.getSortedSet(row);
    };
    SetColumn.prototype.getColors = function (row) {
        var _this = this;
        return this.getSortedSet(row).map(function (d) { return _this.colorMapping.apply(d); });
    };
    SetColumn.prototype.getColorMapping = function () {
        return this.colorMapping.clone();
    };
    SetColumn.prototype.setColorMapping = function (mapping) {
        return CategoricalColumn.prototype.setColorMapping.call(this, mapping);
    };
    SetColumn.prototype.getValues = function (row) {
        var s = this.getSet(row);
        return this.categories.map(function (d) { return s.has(d); });
    };
    SetColumn.prototype.getLabels = function (row) {
        return this.getValues(row).map(String);
    };
    SetColumn.prototype.getMap = function (row) {
        return this.getSortedSet(row).map(function (d) { return ({ key: d.label, value: true }); });
    };
    SetColumn.prototype.getMapLabel = function (row) {
        return this.getSortedSet(row).map(function (d) { return ({ key: d.label, value: 'true' }); });
    };
    SetColumn.prototype.iterCategory = function (row) {
        var r = this.getSet(row);
        if (r.size > 0) {
            return Array.from(r);
        }
        return [null];
    };
    SetColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.filter = this.currentFilter;
        r.colorMapping = this.colorMapping.toJSON();
        return r;
    };
    SetColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        this.colorMapping = factory.categoricalColorMappingFunction(dump.colorMapping, this.categories);
        if (!('filter' in dump)) {
            this.currentFilter = null;
            return;
        }
        var bak = dump.filter;
        if (typeof bak === 'string' || Array.isArray(bak)) {
            this.currentFilter = { filter: bak, filterMissing: false, mode: 'some' };
        }
        else {
            this.currentFilter = bak;
        }
    };
    SetColumn.prototype.isFiltered = function () {
        return this.currentFilter != null;
    };
    SetColumn.prototype.filter = function (row) {
        var _this = this;
        if (!this.currentFilter) {
            return true;
        }
        var v = Array.from(this.getSet(row));
        if (v.length === 0) {
            return isCategoryIncluded(this.currentFilter, null);
        }
        if (this.currentFilter.mode === 'every') {
            return v.every(function (s) { return isCategoryIncluded(_this.currentFilter, s); });
        }
        return v.some(function (s) { return isCategoryIncluded(_this.currentFilter, s); });
    };
    SetColumn.prototype.getFilter = function () {
        return this.currentFilter == null ? null : Object.assign({}, this.currentFilter);
    };
    SetColumn.prototype.setFilter = function (filter) {
        if (isEqualSetCategoricalFilter(this.currentFilter, filter)) {
            return;
        }
        this.fire([CategoricalColumn.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.currentFilter, (this.currentFilter = filter));
    };
    SetColumn.prototype.clearFilter = function () {
        return CategoricalColumn.prototype.clearFilter.call(this);
    };
    SetColumn.prototype.toCompareValue = function (row) {
        var v = this.getSet(row);
        var vs = [v.size];
        for (var _i = 0, _a = this.categories; _i < _a.length; _i++) {
            var cat = _a[_i];
            vs.push(v.has(cat) ? 1 : 0);
        }
        return vs;
    };
    SetColumn.prototype.toCompareValueType = function () {
        return [chooseUIntByDataLength(this.categories.length)].concat(this.categories.map(function () { return ECompareValueType.BINARY; }));
    };
    SetColumn.prototype.group = function (row) {
        var v = this.getSet(row);
        var cardinality = v.size;
        var categories = this.categories.filter(function (c) { return v.has(c); });
        // by cardinality and then by intersection
        var g = {
            name: categories.length === 0 ? 'None' : categories.map(function (d) { return d.name; }).join(', '),
            color: categories.length === 1 ? categories[0].color : DEFAULT_COLOR,
        };
        g.parent = {
            name: "#".concat(cardinality),
            color: DEFAULT_COLOR,
            subGroups: [g],
        };
        return g;
    };
    var SetColumn_1;
    SetColumn.EVENT_FILTER_CHANGED = CategoricalColumn.EVENT_FILTER_CHANGED;
    SetColumn.EVENT_COLOR_MAPPING_CHANGED = CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED;
    SetColumn = SetColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'filterCategorical', 'colorMappedCategorical', 'group', 'groupBy'),
        Category('categorical')
    ], SetColumn);
    return SetColumn;
}(ValueColumn));
export default SetColumn;
//# sourceMappingURL=SetColumn.js.map