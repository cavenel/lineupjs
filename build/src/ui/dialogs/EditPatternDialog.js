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
import ADialog, {} from './ADialog';
/** @internal */
var EditPatternDialog = /** @class */ (function (_super) {
    __extends(EditPatternDialog, _super);
    function EditPatternDialog(column, dialog, ctx) {
        var _this = _super.call(this, dialog) || this;
        _this.column = column;
        _this.ctx = ctx;
        _this.before = _this.column.getPattern();
        return _this;
    }
    EditPatternDialog.prototype.build = function (node) {
        var templates = this.column.patternTemplates;
        var s = this.ctx.sanitize;
        node.insertAdjacentHTML('beforeend', "<strong>Edit Pattern (access via ${value}, ${item})</strong><input\n        type=\"text\"\n        size=\"30\"\n        value=\"".concat(s(this.before), "\"\n        required\n        autofocus\n        placeholder=\"pattern (access via ${value}, ${item})\"\n        ").concat(templates.length > 0 ? "list=\"ui".concat(this.ctx.idPrefix, "lineupPatternList\"") : '', "\n      >"));
        if (templates.length > 0) {
            node.insertAdjacentHTML('beforeend', "<datalist id=\"ui".concat(this.ctx.idPrefix, "lineupPatternList\">").concat(templates.map(function (t) { return "<option value=\"".concat(s(t), "\">"); }), "</datalist>"));
        }
        this.enableLivePreviews('input');
    };
    EditPatternDialog.prototype.cancel = function () {
        this.column.setPattern(this.before);
    };
    EditPatternDialog.prototype.reset = function () {
        this.node.querySelector('input').value = '';
    };
    EditPatternDialog.prototype.submit = function () {
        var newValue = this.node.querySelector('input').value;
        this.column.setPattern(newValue);
        return true;
    };
    return EditPatternDialog;
}(ADialog));
export default EditPatternDialog;
//# sourceMappingURL=EditPatternDialog.js.map