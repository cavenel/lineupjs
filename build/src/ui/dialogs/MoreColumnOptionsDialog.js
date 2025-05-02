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
import { createToolbarMenuItems, updateIconState } from '../headerTooltip';
import { cssClass } from '../../styles';
import APopup from './APopup';
/** @internal */
var MoreColumnOptionsDialog = /** @class */ (function (_super) {
    __extends(MoreColumnOptionsDialog, _super);
    function MoreColumnOptionsDialog(column, dialog, mode, ctx) {
        var _this = _super.call(this, dialog, {
            autoClose: true,
        }) || this;
        _this.column = column;
        _this.mode = mode;
        _this.ctx = ctx;
        return _this;
    }
    MoreColumnOptionsDialog.prototype.build = function (node) {
        node.classList.add(cssClass('more-options'));
        node.dataset.colId = this.column.id;
        createToolbarMenuItems(node, this.dialog.level + 1, this.column, this.ctx, this.mode);
        updateIconState(node, this.column);
    };
    return MoreColumnOptionsDialog;
}(APopup));
export default MoreColumnOptionsDialog;
//# sourceMappingURL=MoreColumnOptionsDialog.js.map