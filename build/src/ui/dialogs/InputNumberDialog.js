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
import APopup from './APopup';
/** @internal */
var InputNumberDialog = /** @class */ (function (_super) {
    __extends(InputNumberDialog, _super);
    function InputNumberDialog(dialog, callback, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, dialog) || this;
        _this.callback = callback;
        _this.ioptions = {
            min: NaN,
            max: NaN,
            step: 'any',
            value: NaN,
            label: null,
        };
        Object.assign(_this.ioptions, options);
        return _this;
    }
    InputNumberDialog.prototype.build = function (node) {
        var o = this.ioptions;
        node.insertAdjacentHTML('beforeend', "\n     <input type=\"number\" value=\"".concat(Number.isNaN(o.value) ? '' : String(o.value), "\" required autofocus placeholder=\"").concat(this.dialog.sanitize(o.label ? o.label : 'enter number'), "\" ").concat(Number.isNaN(o.min) ? '' : " min=\"".concat(o.min, "\""), " ").concat(Number.isNaN(o.max) ? '' : " max=\"".concat(o.max, "\""), " step=\"").concat(o.step, "\">\n    "));
        this.enableLivePreviews('input');
    };
    InputNumberDialog.prototype.submit = function () {
        this.callback(this.findInput('input[type=number]').valueAsNumber);
        return true;
    };
    return InputNumberDialog;
}(APopup));
export default InputNumberDialog;
//# sourceMappingURL=InputNumberDialog.js.map