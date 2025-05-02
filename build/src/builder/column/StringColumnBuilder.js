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
var StringColumnBuilder = /** @class */ (function (_super) {
    __extends(StringColumnBuilder, _super);
    function StringColumnBuilder(column) {
        return _super.call(this, 'string', column) || this;
    }
    /**
     * makes the text editable within a cell and switches to the annotate type
     */
    StringColumnBuilder.prototype.editable = function () {
        this.desc.type = 'annotate';
        return this;
    };
    /**
     * changes the alignment of the column
     */
    StringColumnBuilder.prototype.alignment = function (align) {
        this.desc.alignment = align;
        return this;
    };
    /**
     * allow html text as values
     */
    StringColumnBuilder.prototype.html = function () {
        this.desc.escape = false;
        return this;
    };
    /**
     * provide a pattern with which the value will be wrapped, use `${value}` for the current and and `${item}` for the whole item
     * @param {string} pattern pattern to apply
     * @param {string[]} templates optional templates for patterns to provide in the edit pattern dialog
     */
    StringColumnBuilder.prototype.pattern = function (pattern, templates) {
        this.desc.type = 'link';
        this.desc.pattern = pattern;
        if (templates) {
            this.desc.patternTemplates = templates;
        }
        return this;
    };
    return StringColumnBuilder;
}(ColumnBuilder));
export default StringColumnBuilder;
/**
 * builds a string column builder
 * @param {string} column column which contains the associated data
 * @returns {StringColumnBuilder}
 */
export function buildStringColumn(column) {
    return new StringColumnBuilder(column);
}
//# sourceMappingURL=StringColumnBuilder.js.map