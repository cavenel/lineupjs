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
var ShowTopNDialog = /** @class */ (function (_super) {
    __extends(ShowTopNDialog, _super);
    function ShowTopNDialog(provider, dialog) {
        var _this = _super.call(this, dialog) || this;
        _this.provider = provider;
        _this.before = _this.provider.getShowTopN();
        return _this;
    }
    ShowTopNDialog.prototype.build = function (node) {
        node.classList.add(cssClass('dialog-rename'));
        node.insertAdjacentHTML('beforeend', "\n      <input type=\"number\" min=\"0\" step=\"1\" value=\"".concat(this.dialog.sanitize(String(this.before)), "\">"));
        this.enableLivePreviews('input');
    };
    ShowTopNDialog.prototype.cancel = function () {
        this.provider.setShowTopN(this.before);
    };
    ShowTopNDialog.prototype.submit = function () {
        var value = this.findInput('input').valueAsNumber;
        this.provider.setShowTopN(value);
        return true;
    };
    ShowTopNDialog.prototype.reset = function () {
        var defaultValue = 10;
        this.findInput('input').value = defaultValue.toString();
    };
    return ShowTopNDialog;
}(ADialog));
export default ShowTopNDialog;
//# sourceMappingURL=ShowTopNDialog.js.map