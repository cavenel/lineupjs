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
import { ScriptColumn } from '../../model';
import ADialog, {} from './ADialog';
import { cssClass } from '../../styles';
/** @internal */
var ScriptEditDialog = /** @class */ (function (_super) {
    __extends(ScriptEditDialog, _super);
    function ScriptEditDialog(column, dialog) {
        var _this = _super.call(this, dialog) || this;
        _this.column = column;
        _this.before = column.getScript();
        return _this;
    }
    ScriptEditDialog.prototype.build = function (node) {
        node.insertAdjacentHTML('beforeend', "<textarea class=\"".concat(cssClass('textarea'), "\" autofocus=\"true\" rows=\"5\" autofocus=\"autofocus\" style=\"width: 95%;\">").concat(this.column.getScript(), "</textarea>"));
    };
    ScriptEditDialog.prototype.cancel = function () {
        this.column.setScript(this.before);
    };
    ScriptEditDialog.prototype.reset = function () {
        this.node.querySelector('textarea').value = this.column.desc.script || ScriptColumn.DEFAULT_SCRIPT;
    };
    ScriptEditDialog.prototype.submit = function () {
        this.column.setScript(this.node.querySelector('textarea').value);
        return true;
    };
    return ScriptEditDialog;
}(ADialog));
export default ScriptEditDialog;
//# sourceMappingURL=ScriptEditDialog.js.map