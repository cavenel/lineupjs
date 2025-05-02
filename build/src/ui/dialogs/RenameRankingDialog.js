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
var RenameRankingDialog = /** @class */ (function (_super) {
    __extends(RenameRankingDialog, _super);
    function RenameRankingDialog(ranking, dialog) {
        var _this = _super.call(this, dialog, {
            livePreview: 'rename',
        }) || this;
        _this.ranking = ranking;
        _this.before = ranking.getLabel();
        return _this;
    }
    RenameRankingDialog.prototype.build = function (node) {
        node.classList.add(cssClass('dialog-rename'));
        node.insertAdjacentHTML('beforeend', "\n      <input type=\"text\" value=\"".concat(this.dialog.sanitize(this.ranking.getLabel()), "\" required autofocus placeholder=\"name\">"));
    };
    RenameRankingDialog.prototype.reset = function () {
        this.findInput('input[type="text"]').value = this.before;
    };
    RenameRankingDialog.prototype.cancel = function () {
        this.ranking.setLabel(this.before);
    };
    RenameRankingDialog.prototype.submit = function () {
        var newValue = this.findInput('input[type="text"]').value;
        this.ranking.setLabel(newValue);
        return true;
    };
    return RenameRankingDialog;
}(ADialog));
export default RenameRankingDialog;
//# sourceMappingURL=RenameRankingDialog.js.map