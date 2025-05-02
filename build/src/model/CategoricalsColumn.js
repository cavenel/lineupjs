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
import ArrayColumn, {} from './ArrayColumn';
import { toolbar } from './annotations';
import CategoricalColumn from './CategoricalColumn';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import { DEFAULT_COLOR, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, widthChanged, dirtyCaches, } from './Column';
import { toCategories } from './internalCategorical';
/**
 * a string column with optional alignment
 */
var CategoricalsColumn = /** @class */ (function (_super) {
    __extends(CategoricalsColumn, _super);
    function CategoricalsColumn(id, desc) {
        var _this = _super.call(this, id, desc) || this;
        _this.lookup = new Map();
        _this.categories = toCategories(desc);
        _this.categories.forEach(function (d) { return _this.lookup.set(d.name, d); });
        _this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
        return _this;
    }
    CategoricalsColumn_1 = CategoricalsColumn;
    CategoricalsColumn.prototype.onDataUpdate = function (rows) {
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
                if (!kv) {
                    continue;
                }
                categories.add(String(kv));
            }
        });
        (_a = this.categories).splice.apply(_a, __spreadArray([0, this.categories.length], toCategories({ categories: Array.from(categories) }), false));
        this.categories.forEach(function (d) { return _this.lookup.set(d.name, d); });
    };
    CategoricalsColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([CategoricalsColumn_1.EVENT_COLOR_MAPPING_CHANGED]);
    };
    CategoricalsColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    CategoricalsColumn.prototype.getCategories = function (row) {
        var _this = this;
        return _super.prototype.getValues.call(this, row).map(function (v) {
            if (!v) {
                return null;
            }
            var vs = String(v);
            return _this.lookup.has(vs) ? _this.lookup.get(vs) : null;
        });
    };
    CategoricalsColumn.prototype.getColors = function (row) {
        var _this = this;
        return this.getCategories(row).map(function (d) { return (d ? _this.colorMapping.apply(d) : DEFAULT_COLOR); });
    };
    CategoricalsColumn.prototype.iterCategory = function (row) {
        return this.getCategories(row);
    };
    CategoricalsColumn.prototype.getValues = function (row) {
        return this.getCategories(row).map(function (v) { return (v ? v.name : null); });
    };
    CategoricalsColumn.prototype.getLabels = function (row) {
        return this.getCategories(row).map(function (v) { return (v ? v.label : ''); });
    };
    CategoricalsColumn.prototype.getColorMapping = function () {
        return this.colorMapping.clone();
    };
    CategoricalsColumn.prototype.setColorMapping = function (mapping) {
        return CategoricalColumn.prototype.setColorMapping.call(this, mapping);
    };
    CategoricalsColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.colorMapping = this.colorMapping.toJSON();
        return r;
    };
    CategoricalsColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        this.colorMapping = factory.categoricalColorMappingFunction(dump.colorMapping, this.categories);
    };
    var CategoricalsColumn_1;
    CategoricalsColumn.EVENT_COLOR_MAPPING_CHANGED = CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED;
    CategoricalsColumn = CategoricalsColumn_1 = __decorate([
        toolbar('rename', 'colorMappedCategorical')
    ], CategoricalsColumn);
    return CategoricalsColumn;
}(ArrayColumn));
export default CategoricalsColumn;
//# sourceMappingURL=CategoricalsColumn.js.map