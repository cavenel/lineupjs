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
var ChangeRendererDialog = /** @class */ (function (_super) {
    __extends(ChangeRendererDialog, _super);
    function ChangeRendererDialog(column, dialog, ctx) {
        var _this = _super.call(this, dialog, {
            livePreview: 'vis',
        }) || this;
        _this.column = column;
        _this.ctx = ctx;
        _this.before = {
            renderer: column.getRenderer(),
            group: column.getGroupRenderer(),
            summary: column.getSummaryRenderer(),
        };
        return _this;
    }
    ChangeRendererDialog.prototype.build = function (node) {
        var current = this.column.getRenderer();
        var currentGroup = this.column.getGroupRenderer();
        var currentSummary = this.column.getSummaryRenderer();
        var _a = this.ctx.getPossibleRenderer(this.column), item = _a.item, group = _a.group, summary = _a.summary;
        console.assert(item.length > 1 || group.length > 1 || summary.length > 1); // otherwise no need to show this
        var byName = function (a, b) { return a.label.localeCompare(b.label); };
        var s = this.ctx.sanitize;
        node.insertAdjacentHTML('beforeend', "\n      <strong>Item Visualization</strong>\n      ".concat(item
            .sort(byName)
            .map(function (d) {
            return " <label class=\"".concat(cssClass('checkbox'), "\"><input type=\"radio\" name=\"renderer\" value=\"").concat(s(d.type), "\" ").concat(current === d.type ? 'checked' : '', "><span>").concat(s(d.label), "</span></label>");
        })
            .join(''), "\n      <strong>Group Visualization</strong>\n      ").concat(group
            .sort(byName)
            .map(function (d) {
            return " <label class=\"".concat(cssClass('checkbox'), "\"><input type=\"radio\" name=\"group\" value=\"").concat(s(d.type), "\" ").concat(currentGroup === d.type ? 'checked' : '', "><span>").concat(s(d.label), "</span></label>");
        })
            .join(''), "\n      <strong>Summary Visualization</strong>\n      ").concat(summary
            .sort(byName)
            .map(function (d) {
            return " <label class=\"".concat(cssClass('checkbox'), "\"><input type=\"radio\" name=\"summary\" value=\"").concat(s(d.type), "\" ").concat(currentSummary === d.type ? 'checked' : '', "><span>").concat(s(d.label), "</span></label>");
        })
            .join(''), "\n    "));
        this.enableLivePreviews('input[type=radio]');
    };
    ChangeRendererDialog.prototype.cancel = function () {
        this.column.setRenderer(this.before.renderer);
        this.column.setGroupRenderer(this.before.group);
        this.column.setSummaryRenderer(this.before.summary);
    };
    ChangeRendererDialog.prototype.reset = function () {
        var desc = this.column.desc;
        var r = this.findInput("input[name=renderer][value=\"".concat(desc.renderer || desc.type, "\"]"));
        if (r) {
            r.checked = true;
        }
        var g = this.findInput("input[name=group][value=\"".concat(desc.groupRenderer || desc.type, "\"]"));
        if (g) {
            g.checked = true;
        }
        var s = this.findInput("input[name=summary][value=\"".concat(desc.summaryRenderer || desc.type, "\"]"));
        if (s) {
            s.checked = true;
        }
    };
    ChangeRendererDialog.prototype.submit = function () {
        var renderer = this.findInput('input[name=renderer]:checked').value;
        var group = this.findInput('input[name=group]:checked').value;
        var summary = this.findInput('input[name=summary]:checked').value;
        this.column.setRenderer(renderer);
        this.column.setGroupRenderer(group);
        this.column.setSummaryRenderer(summary);
        return true;
    };
    return ChangeRendererDialog;
}(ADialog));
export default ChangeRendererDialog;
//# sourceMappingURL=ChangeRendererDialog.js.map