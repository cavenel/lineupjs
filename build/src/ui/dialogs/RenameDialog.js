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
import { cssClass } from '../../styles';
/** @internal */
var RenameDialog = /** @class */ (function (_super) {
    __extends(RenameDialog, _super);
    function RenameDialog(column, dialog) {
        var _this = _super.call(this, dialog) || this;
        _this.column = column;
        _this.before = column.getMetaData();
        return _this;
    }
    RenameDialog.prototype.build = function (node) {
        node.classList.add(cssClass('dialog-rename'));
        node.insertAdjacentHTML('beforeend', "\n      <input type=\"text\" required autofocus placeholder=\"name\">\n      <input type=\"text\" placeholder=\"summary\" name=\"summary\">\n      <textarea class=\"".concat(cssClass('textarea'), "\" rows=\"5\" placeholder=\"description\"></textarea>"));
        node.querySelector('input').value = this.column.label;
        node.querySelector('input:last-of-type').value = this.column.getMetaData().summary;
        node.querySelector('textarea').textContent = this.column.description;
    };
    RenameDialog.prototype.reset = function () {
        var desc = this.column.desc;
        var meta = {
            label: desc.label || this.column.id,
            summary: desc.summary || '',
            description: desc.description || '',
        };
        this.findInput('input[type="text"]').value = meta.label;
        this.findInput('input[name="summary"]').value = meta.summary;
        this.node.querySelector('textarea').value = meta.description;
    };
    RenameDialog.prototype.submit = function () {
        var label = this.findInput('input[type="text"]').value;
        var summary = this.findInput('input[name="summary"]').value.trim();
        var description = this.node.querySelector('textarea').value;
        this.column.setMetaData({ label: label, description: description, summary: summary });
        return true;
    };
    RenameDialog.prototype.cancel = function () {
        this.column.setMetaData(this.before);
    };
    return RenameDialog;
}(ADialog));
export default RenameDialog;
//# sourceMappingURL=RenameDialog.js.map