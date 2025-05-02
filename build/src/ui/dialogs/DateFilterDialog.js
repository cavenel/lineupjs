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
import { noDateFilter } from '../../model/internalDate';
import { createDateFilter } from '../../renderer/DateHistogramCellRenderer';
import { cssClass } from '../../styles';
import ADialog, {} from './ADialog';
/** @internal */
var DateFilterDialog = /** @class */ (function (_super) {
    __extends(DateFilterDialog, _super);
    function DateFilterDialog(column, dialog, ctx) {
        var _a;
        var _this = _super.call(this, dialog, {
            livePreview: 'filter',
            cancelSubDialogs: true,
        }) || this;
        _this.column = column;
        _this.ctx = ctx;
        _this.handler = null;
        _this.before = (_a = _this.column.getFilter()) !== null && _a !== void 0 ? _a : noDateFilter();
        return _this;
    }
    DateFilterDialog.prototype.build = function (node) {
        node.classList.add(cssClass('dialog-mapper'));
        this.handler = createDateFilter(this.column, node, {
            dialogManager: this.ctx.dialogManager,
            idPrefix: this.ctx.idPrefix,
            tasks: this.ctx.provider.getTaskExecutor(),
            sanitize: this.ctx.sanitize,
        }, this.showLivePreviews());
    };
    DateFilterDialog.prototype.cleanUp = function (action) {
        _super.prototype.cleanUp.call(this, action);
        this.handler.cleanUp();
    };
    DateFilterDialog.prototype.reset = function () {
        this.handler.reset();
    };
    DateFilterDialog.prototype.submit = function () {
        this.handler.submit();
        return true;
    };
    DateFilterDialog.prototype.cancel = function () {
        this.column.setFilter(this.before);
    };
    return DateFilterDialog;
}(ADialog));
export default DateFilterDialog;
//# sourceMappingURL=DateFilterDialog.js.map