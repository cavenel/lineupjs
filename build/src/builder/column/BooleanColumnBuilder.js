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
var BooleanColumnBuilder = /** @class */ (function (_super) {
    __extends(BooleanColumnBuilder, _super);
    function BooleanColumnBuilder(column) {
        return _super.call(this, 'boolean', column) || this;
    }
    BooleanColumnBuilder.prototype.trueMarker = function (marker) {
        this.desc.trueMarker = marker;
        return this;
    };
    BooleanColumnBuilder.prototype.falseMarker = function (marker) {
        this.desc.falseMarker = marker;
        return this;
    };
    BooleanColumnBuilder.prototype.trueValues = function (values) {
        this.desc.trueValues = values;
        return this;
    };
    return BooleanColumnBuilder;
}(ColumnBuilder));
export default BooleanColumnBuilder;
/**
 * builds a boolean column builder
 * @param {string} column column which contains the associated data
 * @returns {BooleanColumnBuilder}
 */
export function buildBooleanColumn(column) {
    return new BooleanColumnBuilder(column);
}
//# sourceMappingURL=BooleanColumnBuilder.js.map