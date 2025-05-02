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
import { Column, BooleanColumn } from '../model';
import { DefaultCellRenderer } from './DefaultCellRenderer';
import { ERenderMode } from './interfaces';
import { cssClass } from '../styles';
var BooleanCellRenderer = /** @class */ (function (_super) {
    __extends(BooleanCellRenderer, _super);
    function BooleanCellRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.title = 'Default';
        return _this;
    }
    BooleanCellRenderer.prototype.canRender = function (col, mode) {
        return col instanceof BooleanColumn && mode === ERenderMode.CELL;
    };
    BooleanCellRenderer.prototype.create = function (col) {
        var r = _super.prototype.create.call(this, col);
        r.template = "<div class=\"".concat(cssClass('center'), "\"> </div>");
        return r;
    };
    return BooleanCellRenderer;
}(DefaultCellRenderer));
export default BooleanCellRenderer;
//# sourceMappingURL=BooleanCellRenderer.js.map