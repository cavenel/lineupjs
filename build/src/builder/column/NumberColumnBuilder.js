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
import { min, max, resolveValue } from '../../internal';
import ColumnBuilder from './ColumnBuilder';
var NumberColumnBuilder = /** @class */ (function (_super) {
    __extends(NumberColumnBuilder, _super);
    function NumberColumnBuilder(column) {
        return _super.call(this, 'number', column) || this;
    }
    /**
     * defines the mapping for this number column to normalize the data
     * @param {"linear" | "sqrt" | "pow1.1" | "pow2" | "pow3"} type mapping type
     * @param {[number | null, number | null]} domain input data domain [min, max]
     * @param {[number , number]} range optional output domain [0, 1]
     */
    NumberColumnBuilder.prototype.mapping = function (type, domain, range) {
        if (type === 'linear') {
            this.desc.domain = domain;
            if (range) {
                this.desc.range = range;
            }
            return this;
        }
        this.desc.map = {
            type: type,
            domain: domain,
            range: range !== null && range !== void 0 ? range : [0, 1],
        };
        return this;
    };
    /**
     * sets the column color in case of numerical columns
     * @deprecated use colorMapping instead
     */
    NumberColumnBuilder.prototype.color = function (color) {
        return this.colorMapping(color);
    };
    NumberColumnBuilder.prototype.colorMapping = function (type) {
        this.desc.colorMapping = type;
        return this;
    };
    /**
     * d3-format to use for formatting
     * @param format d3-format
     */
    NumberColumnBuilder.prototype.numberFormat = function (format) {
        this.desc.numberFormat = format;
        return this;
    };
    /**
     * defines a script to normalize the data, see ScriptedMappingFunction for details
     * @param {string} code the code to execute
     * @param {[number , number]} domain the input data domain [min, max]
     */
    NumberColumnBuilder.prototype.scripted = function (code, domain) {
        this.desc.map = { domain: domain, code: code, type: 'script' };
        return this;
    };
    /**
     * @inheritDoc
     * @param {string[] | number} labels labels to use for each array item or the expected length of an value
     * @param {EAdvancedSortMethod} sort sorting criteria when sorting by this column
     */
    NumberColumnBuilder.prototype.asArray = function (labels, sort) {
        if (sort) {
            this.desc.sort = sort;
        }
        return _super.prototype.asArray.call(this, labels);
    };
    /**
     * @inheritDoc
     * @param {EAdvancedSortMethod} sort sorting criteria when sorting by this column
     */
    NumberColumnBuilder.prototype.asMap = function (sort) {
        if (sort) {
            this.desc.sort = sort;
        }
        return _super.prototype.asMap.call(this);
    };
    /**
     * converts type to a boxplot column type
     * @param {ESortMethod} sort sorting criteria when sorting by this column
     */
    NumberColumnBuilder.prototype.asBoxPlot = function (sort) {
        if (sort) {
            this.desc.sort = sort;
        }
        this.desc.type = 'boxplot';
        return this;
    };
    NumberColumnBuilder.prototype.derive = function (data) {
        var col = this.desc.column;
        var asArray = function (v, extra) {
            var vs = [];
            (Array.isArray(v) ? v : [v]).forEach(function (vi) {
                if (typeof vi === 'number' && !Number.isNaN(vi)) {
                    vs.push(vi);
                }
                if (vi != null && typeof vi.value === 'number' && !Number.isNaN(vi.value)) {
                    vs.push(vi.value);
                }
                if (vi != null && typeof vi[extra] === 'number' && !Number.isNaN(vi[extra])) {
                    vs.push(vi[extra]);
                }
            });
            return vs;
        };
        var minValue = min(data, function (d) {
            var v = resolveValue(d, col);
            var vs = asArray(v, 'min');
            return vs.length === 0 ? Number.POSITIVE_INFINITY : min(vs);
        });
        var maxValue = max(data, function (d) {
            var v = resolveValue(d, col);
            var vs = asArray(v, 'max');
            return vs.length === 0 ? Number.NEGATIVE_INFINITY : max(vs);
        });
        return [minValue, maxValue];
    };
    NumberColumnBuilder.prototype.build = function (data) {
        if (!this.desc.map && !this.desc.domain) {
            // derive domain
            this.mapping('linear', this.derive(data));
        }
        else {
            var d = this.desc.domain || this.desc.map.domain;
            if (Number.isNaN(d[0]) || d[0] == null || Number.isNaN(d[1]) || d[1] == null) {
                var ext = this.derive(data);
                if (Number.isNaN(d[0]) || d[0] == null) {
                    d[0] = ext[0];
                }
                if (Number.isNaN(d[1]) || d[1] == null) {
                    d[1] = ext[1];
                }
            }
        }
        return _super.prototype.build.call(this, data);
    };
    return NumberColumnBuilder;
}(ColumnBuilder));
export default NumberColumnBuilder;
/**
 * builds numerical column builder
 * @param {string} column column which contains the associated data
 * @param {[number | null, number | null]} domain domain (min, max) of this column
 * @returns {NumberColumnBuilder}
 */
export function buildNumberColumn(column, domain) {
    var r = new NumberColumnBuilder(column);
    if (domain) {
        r.mapping('linear', domain);
    }
    return r;
}
//# sourceMappingURL=NumberColumnBuilder.js.map