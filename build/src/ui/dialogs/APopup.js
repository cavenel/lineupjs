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
var APopup = /** @class */ (function (_super) {
    __extends(APopup, _super);
    function APopup(dialog, options) {
        if (options === void 0) { options = {}; }
        return _super.call(this, dialog, Object.assign({
            popup: true,
        }, options)) || this;
    }
    APopup.prototype.submit = function () {
        return true;
    };
    APopup.prototype.reset = function () {
        // dummy
    };
    APopup.prototype.cancel = function () {
        // dummy
    };
    return APopup;
}(ADialog));
export default APopup;
//# sourceMappingURL=APopup.js.map