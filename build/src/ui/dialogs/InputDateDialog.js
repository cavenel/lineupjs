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
import { timeFormat } from 'd3-time-format';
import APopup from './APopup';
/** @internal */
var InputDateDialog = /** @class */ (function (_super) {
    __extends(InputDateDialog, _super);
    function InputDateDialog(dialog, callback, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, dialog) || this;
        _this.callback = callback;
        _this.ioptions = {
            value: null,
            label: null,
        };
        Object.assign(_this.ioptions, options);
        return _this;
    }
    InputDateDialog.prototype.build = function (node) {
        var _this = this;
        var o = this.ioptions;
        var f = timeFormat('%Y-%m-%d');
        node.insertAdjacentHTML('beforeend', "\n     <input type=\"date\" value=\"".concat(o.value ? f(o.value) : '', "\" required autofocus placeholder=\"").concat(this.dialog.sanitize(o.label ? o.label : 'enter date'), "\">\n    "));
        this.findInput('input[type=date]').addEventListener('keypress', function (evt) {
            if (evt.key === 'Enter') {
                _this.triggerSubmit();
            }
        });
        this.enableLivePreviews('input');
    };
    InputDateDialog.prototype.submit = function () {
        this.callback(this.findInput('input[type=date]').valueAsDate);
        return true;
    };
    return InputDateDialog;
}(APopup));
export default InputDateDialog;
//# sourceMappingURL=InputDateDialog.js.map