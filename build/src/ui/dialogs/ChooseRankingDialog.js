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
import { cssClass } from '../../styles';
import APopup from './APopup';
/** @internal */
var ChooseRankingDialog = /** @class */ (function (_super) {
    __extends(ChooseRankingDialog, _super);
    function ChooseRankingDialog(items, dialog) {
        var _this = _super.call(this, dialog) || this;
        _this.items = items;
        return _this;
    }
    ChooseRankingDialog.prototype.build = function (node) {
        node.classList.add(cssClass('more-options'), cssClass('choose-options'));
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            node.appendChild(item);
        }
    };
    return ChooseRankingDialog;
}(APopup));
export default ChooseRankingDialog;
//# sourceMappingURL=ChooseRankingDialog.js.map