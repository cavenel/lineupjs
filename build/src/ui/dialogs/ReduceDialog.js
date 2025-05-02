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
import { EAdvancedSortMethod, ReduceColumn } from '../../model';
import ADialog, {} from './ADialog';
import { sortMethods } from './utils';
/** @internal */
var ReduceDialog = /** @class */ (function (_super) {
    __extends(ReduceDialog, _super);
    function ReduceDialog(column, dialog) {
        var _this = _super.call(this, dialog, {
            livePreview: 'reduce',
        }) || this;
        _this.column = column;
        _this.handler = null;
        return _this;
    }
    ReduceDialog.prototype.build = function (node) {
        var _this = this;
        var wrapper = {
            getSortMethod: function () { return _this.column.getReduce(); },
            setSortMethod: function (s) { return _this.column.setReduce(s); },
        };
        this.handler = sortMethods(node, wrapper, Object.keys(EAdvancedSortMethod));
        this.enableLivePreviews(this.handler.elems);
    };
    ReduceDialog.prototype.submit = function () {
        return this.handler.submit();
    };
    ReduceDialog.prototype.reset = function () {
        this.handler.reset();
    };
    ReduceDialog.prototype.cancel = function () {
        this.handler.cancel();
    };
    return ReduceDialog;
}(ADialog));
export default ReduceDialog;
//# sourceMappingURL=ReduceDialog.js.map