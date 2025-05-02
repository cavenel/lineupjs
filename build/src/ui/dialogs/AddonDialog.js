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
/** @internal */
var AddonDialog = /** @class */ (function (_super) {
    __extends(AddonDialog, _super);
    function AddonDialog(column, addons, dialog, ctx, onClick) {
        var _this = _super.call(this, dialog) || this;
        _this.column = column;
        _this.addons = addons;
        _this.ctx = ctx;
        _this.onClick = onClick;
        _this.handlers = [];
        return _this;
    }
    AddonDialog.prototype.build = function (node) {
        for (var _i = 0, _a = this.addons; _i < _a.length; _i++) {
            var addon = _a[_i];
            this.node.insertAdjacentHTML('beforeend', "<strong>".concat(this.ctx.sanitize(addon.title), "</strong>"));
            this.handlers.push(addon.append(this.column, node, this.dialog, this.ctx));
        }
    };
    AddonDialog.prototype.submit = function () {
        for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            if (handler.submit() === false) {
                return false;
            }
        }
        if (this.onClick) {
            this.onClick();
        }
        return true;
    };
    AddonDialog.prototype.cancel = function () {
        for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.cancel();
        }
    };
    AddonDialog.prototype.reset = function () {
        for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.reset();
        }
    };
    return AddonDialog;
}(ADialog));
export default AddonDialog;
//# sourceMappingURL=AddonDialog.js.map