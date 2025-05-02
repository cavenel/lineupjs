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
import { dialogContext } from './ADialog';
import RenameRankingDialog from './RenameRankingDialog';
import { cssClass } from '../../styles';
import { actionCSSClass } from '../header';
import APopup from './APopup';
/** @internal */
var MoreRankingOptionsDialog = /** @class */ (function (_super) {
    __extends(MoreRankingOptionsDialog, _super);
    function MoreRankingOptionsDialog(ranking, dialog, ctx) {
        var _this = _super.call(this, dialog, {
            autoClose: true,
        }) || this;
        _this.ranking = ranking;
        _this.ctx = ctx;
        return _this;
    }
    MoreRankingOptionsDialog.prototype.addIcon = function (node, title, onClick) {
        var sanitized = this.ctx.sanitize(title);
        node.insertAdjacentHTML('beforeend', "<i title=\"".concat(sanitized, "\" class=\"").concat(actionCSSClass(title), "\"><span>").concat(sanitized, "</span> </i>"));
        var i = node.lastElementChild;
        i.onclick = function (evt) {
            evt.stopPropagation();
            onClick(evt);
        };
    };
    MoreRankingOptionsDialog.prototype.build = function (node) {
        var _this = this;
        node.classList.add(cssClass('more-options'));
        this.addIcon(node, 'Rename', function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            var dialog = new RenameRankingDialog(_this.ranking, dialogContext(_this.ctx, _this.level + 1, evt));
            dialog.open();
        });
        this.addIcon(node, 'Remove', function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            _this.destroy('confirm');
            _this.ctx.provider.removeRanking(_this.ranking);
        });
    };
    return MoreRankingOptionsDialog;
}(APopup));
export default MoreRankingOptionsDialog;
//# sourceMappingURL=MoreRankingOptionsDialog.js.map