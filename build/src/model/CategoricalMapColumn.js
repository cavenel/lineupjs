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
import MapColumn, {} from './MapColumn';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import CategoricalColumn from './CategoricalColumn';
import { DEFAULT_COLOR, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, widthChanged, dirtyCaches, } from './Column';
import { toolbar } from './annotations';
import { toCategories } from './internalCategorical';
var CategoricalMapColumn = /** @class */ (function (_super) {
    __extends(CategoricalMapColumn, _super);
    function CategoricalMapColumn(id, desc) {
        var _this = _super.call(this, id, desc) || this;
        _this.lookup = new Map();
        _this.categories = toCategories(desc);
        _this.categories.forEach(function (d) { return _this.lookup.set(d.name, d); });
        _this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
        return _this;
    }
    CategoricalMapColumn_1 = CategoricalMapColumn;
    CategoricalMapColumn.prototype.onDataUpdate = function (rows) {
        var _a;
        var _this = this;
        _super.prototype.onDataUpdate.call(this, rows);
        if (this.desc.categories) {
            return;
        }
        // derive
        var categories = new Set();
        rows.forEach(function (row) {
            var value = _super.prototype.getValue.call(_this, row);
            if (!value || !Array.isArray(value) || value.length === 0) {
                return;
            }
            for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                var kv = value_1[_i];
                if (!kv || !kv.value) {
                    continue;
                }
                categories.add(String(kv.value));
            }
        });
        (_a = this.categories).splice.apply(_a, __spreadArray([0, this.categories.length], toCategories({ categories: Array.from(categories) }), false));
        this.categories.forEach(function (d) { return _this.lookup.set(d.name, d); });
    };
    CategoricalMapColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([CategoricalMapColumn_1.EVENT_COLOR_MAPPING_CHANGED]);
    };
    CategoricalMapColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    CategoricalMapColumn.prototype.parseValue = function (v) {
        if (!v) {
            return null;
        }
        var vs = String(v);
        return this.lookup.has(vs) ? this.lookup.get(vs) : null;
    };
    CategoricalMapColumn.prototype.getCategoryMap = function (row) {
        var _this = this;
        return _super.prototype.getMap.call(this, row).map(function (_a) {
            var key = _a.key, value = _a.value;
            return ({
                key: key,
                value: _this.parseValue(value),
            });
        });
    };
    CategoricalMapColumn.prototype.getCategories = function (row) {
        return this.getCategoryMap(row).map(function (d) { return d.value; });
    };
    CategoricalMapColumn.prototype.getColors = function (row) {
        var _this = this;
        return this.getCategoryMap(row).map(function (_a) {
            var key = _a.key, value = _a.value;
            return ({
                key: key,
                value: value ? _this.colorMapping.apply(value) : DEFAULT_COLOR,
            });
        });
    };
    CategoricalMapColumn.prototype.getValue = function (row) {
        var r = this.getCategoryMap(row);
        return r.length === 0
            ? null
            : r.map(function (_a) {
                var key = _a.key, value = _a.value;
                return ({
                    key: key,
                    value: value ? value.name : null,
                });
            });
    };
    CategoricalMapColumn.prototype.getLabels = function (row) {
        return this.getCategoryMap(row).map(function (_a) {
            var key = _a.key, value = _a.value;
            return ({
                key: key,
                value: value ? value.label : '',
            });
        });
    };
    CategoricalMapColumn.prototype.getColorMapping = function () {
        return this.colorMapping.clone();
    };
    CategoricalMapColumn.prototype.setColorMapping = function (mapping) {
        return CategoricalColumn.prototype.setColorMapping.call(this, mapping);
    };
    CategoricalMapColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.colorMapping = this.colorMapping.toJSON();
        return r;
    };
    CategoricalMapColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        this.colorMapping = factory.categoricalColorMappingFunction(dump.colorMapping, this.categories);
    };
    CategoricalMapColumn.prototype.iterCategory = function (row) {
        return this.getCategories(row);
    };
    var CategoricalMapColumn_1;
    CategoricalMapColumn.EVENT_COLOR_MAPPING_CHANGED = CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED;
    CategoricalMapColumn = CategoricalMapColumn_1 = __decorate([
        toolbar('rename', 'colorMappedCategorical')
    ], CategoricalMapColumn);
    return CategoricalMapColumn;
}(MapColumn));
export default CategoricalMapColumn;
//# sourceMappingURL=CategoricalMapColumn.js.map