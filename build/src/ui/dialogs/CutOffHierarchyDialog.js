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
import { HierarchyColumn, resolveInnerNodes } from '../../model';
import ADialog, {} from './ADialog';
/** @internal */
var CutOffHierarchyDialog = /** @class */ (function (_super) {
    __extends(CutOffHierarchyDialog, _super);
    function CutOffHierarchyDialog(column, dialog, ctx) {
        var _this = _super.call(this, dialog, {
            livePreview: 'cutOff',
        }) || this;
        _this.column = column;
        _this.ctx = ctx;
        _this.innerNodes = resolveInnerNodes(_this.column.hierarchy);
        _this.innerNodePaths = _this.innerNodes.map(function (n) { return n.path; });
        _this.before = column.getCutOff();
        return _this;
    }
    CutOffHierarchyDialog.prototype.build = function (node) {
        var s = this.ctx.sanitize;
        node.insertAdjacentHTML('beforeend', "\n        <input type=\"text\" value=\"".concat(s(this.before.node.label), "\" required=\"required\" autofocus=\"autofocus\" list=\"ui").concat(this.ctx.idPrefix, "lineupHierarchyList\" placeholder=\"cut off node\">\n        <input type=\"number\" value=\"").concat(isFinite(this.before.maxDepth) ? this.before.maxDepth : '', "\" placeholder=\"max depth (&infin;)\">\n        <datalist id=\"ui").concat(this.ctx.idPrefix, "lineupHierarchyList\">").concat(this.innerNodes.map(function (node) { return "<option value=\"".concat(s(node.path), "\">").concat(s(node.label), "</option>"); }), "</datalist>"));
        //custom validation
        var innerNodePaths = this.innerNodePaths;
        this.findInput('input[type="text"]').addEventListener('change', function () {
            var value = this.value;
            if (innerNodePaths.indexOf(value) < 0) {
                this.setCustomValidity('invalid node');
            }
            else {
                this.setCustomValidity('');
            }
        }, {
            passive: true,
        });
        this.enableLivePreviews('input[type=text],input[type=number]');
    };
    CutOffHierarchyDialog.prototype.reset = function () {
        this.findInput('input[type="text"]').value = this.column.hierarchy.path;
        this.findInput('input[type="number"]').value = '';
    };
    CutOffHierarchyDialog.prototype.cancel = function () {
        this.column.setCutOff(this.before);
    };
    CutOffHierarchyDialog.prototype.submit = function () {
        var newNode = this.findInput('input[type="text"]').value;
        var newNodeIndex = this.innerNodePaths.indexOf(newNode);
        var node = this.innerNodes[newNodeIndex];
        var maxDepthText = this.findInput('input[type="number"]').value;
        var maxDepth = maxDepthText === '' ? Number.POSITIVE_INFINITY : Number.parseInt(maxDepthText, 10);
        this.column.setCutOff({ node: node, maxDepth: maxDepth });
        return true;
    };
    return CutOffHierarchyDialog;
}(ADialog));
export default CutOffHierarchyDialog;
//# sourceMappingURL=CutOffHierarchyDialog.js.map