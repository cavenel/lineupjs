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
import ColumnBuilder from './ColumnBuilder';
import { cleanCategories } from '../../provider/utils';
import { resolveValue } from '../../internal';
var CategoricalColumnBuilder = /** @class */ (function (_super) {
    __extends(CategoricalColumnBuilder, _super);
    function CategoricalColumnBuilder(column) {
        return _super.call(this, 'categorical', column) || this;
    }
    /**
     * converts this type to an ordinal column type, such that categories are mapped to numbers
     */
    CategoricalColumnBuilder.prototype.asOrdinal = function () {
        this.desc.type = 'ordinal';
        return this;
    };
    /**
     * specify the categories of this categorical column
     * @param {(string | Partial<ICategory>)[]} categories
     */
    CategoricalColumnBuilder.prototype.categories = function (categories) {
        this.desc.categories = categories;
        return this;
    };
    /**
     * converts this type to a set column, i.e. multiple unique category in a value
     * @param {string} separator optional separator separating a string value
     */
    CategoricalColumnBuilder.prototype.asSet = function (separator) {
        if (separator) {
            this.desc.separator = separator;
        }
        this.desc.type = 'set';
        return this;
    };
    CategoricalColumnBuilder.prototype.derive = function (data) {
        // derive categories
        var categories = new Set();
        var isSet = this.desc.type === 'set';
        var separator = this.desc.separator || ';';
        var val = function (vi) {
            if (typeof vi === 'string' && vi !== '') {
                return vi;
            }
            if (vi != null && typeof vi.value === 'string' && vi.value !== '') {
                return vi.value;
            }
            return null;
        };
        var col = this.desc.column;
        data.forEach(function (d) {
            var v = resolveValue(d, col);
            if (Array.isArray(v)) {
                v.forEach(function (vi) { return categories.add(val(vi)); });
            }
            else if (v != null && v !== '') {
                var vs = isSet ? [v.toString()] : v.toString().split(separator);
                vs.forEach(function (vi) { return categories.add(val(vi)); });
            }
        });
        this.categories(cleanCategories(categories));
    };
    CategoricalColumnBuilder.prototype.build = function (data) {
        if (!this.desc.categories) {
            this.derive(data);
        }
        return _super.prototype.build.call(this, data);
    };
    return CategoricalColumnBuilder;
}(ColumnBuilder));
export default CategoricalColumnBuilder;
/**
 * build a categorical column type
 * @param {string} column column which contains the associated data
 * @param {(string | Partial<ICategory>)[]} categories optional category definition
 * @returns {CategoricalColumnBuilder}
 */
export function buildCategoricalColumn(column, categories) {
    var r = new CategoricalColumnBuilder(column);
    if (categories) {
        r.categories(categories);
    }
    return r;
}
//# sourceMappingURL=CategoricalColumnBuilder.js.map