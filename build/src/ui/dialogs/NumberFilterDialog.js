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
import { createNumberFilter } from '../../renderer/HistogramCellRenderer';
import { cssClass } from '../../styles';
import ADialog, {} from './ADialog';
/** @internal */
var NumberFilterDialog = /** @class */ (function (_super) {
    __extends(NumberFilterDialog, _super);
    function NumberFilterDialog(column, dialog, ctx) {
        var _this = _super.call(this, dialog, {
            livePreview: 'filter',
            cancelSubDialogs: true,
        }) || this;
        _this.column = column;
        _this.ctx = ctx;
        _this.handler = null;
        _this.before = column.getFilter();
        return _this;
    }
    NumberFilterDialog.prototype.build = function (node) {
        node.classList.add(cssClass('dialog-mapper'));
        this.handler = createNumberFilter(this.column, node, {
            dialogManager: this.ctx.dialogManager,
            idPrefix: this.ctx.idPrefix,
            tasks: this.ctx.provider.getTaskExecutor(),
            sanitize: this.ctx.sanitize,
        }, this.showLivePreviews());
    };
    NumberFilterDialog.prototype.cleanUp = function (action) {
        _super.prototype.cleanUp.call(this, action);
        this.handler.cleanUp();
    };
    NumberFilterDialog.prototype.reset = function () {
        this.handler.reset();
    };
    NumberFilterDialog.prototype.submit = function () {
        this.handler.submit();
        return true;
    };
    NumberFilterDialog.prototype.cancel = function () {
        this.column.setFilter(this.before);
    };
    return NumberFilterDialog;
}(ADialog));
export default NumberFilterDialog;
//# sourceMappingURL=NumberFilterDialog.js.map