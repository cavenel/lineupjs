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
var SelectionFilterDialog = /** @class */ (function (_super) {
    __extends(SelectionFilterDialog, _super);
    function SelectionFilterDialog(column, dialog, ctx) {
        var _this = _super.call(this, dialog, {
            livePreview: 'filter',
        }) || this;
        _this.column = column;
        _this.ctx = ctx;
        _this.before = _this.column.getFilter();
        return _this;
    }
    SelectionFilterDialog.prototype.updateFilter = function (filter) {
        this.column.setFilter(filter);
    };
    SelectionFilterDialog.prototype.reset = function () {
        this.findInput('input[value=none]').checked = true;
    };
    SelectionFilterDialog.prototype.cancel = function () {
        if (this.before) {
            this.updateFilter(this.before);
        }
        else {
            this.updateFilter(null);
        }
    };
    SelectionFilterDialog.prototype.submit = function () {
        var _a, _b;
        var chosen = (_b = (_a = this.findInput('input[name=mode]:checked')) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 'keep';
        if (chosen === 'none') {
            this.updateFilter(null);
        }
        else if (chosen === 'update') {
            this.updateFilter(this.ctx.provider.getSelection());
        }
        return true;
    };
    SelectionFilterDialog.prototype.guessRemoveFilter = function () {
        var _this = this;
        var total = this.ctx.provider.getTotalNumberOfRows();
        var ranking = this.column.findMyRanker();
        var hasOtherFilter = ranking.flatColumns.some(function (d) { return d.isFiltered() && d !== _this.column; });
        return hasOtherFilter ? '?' : total.toLocaleString();
    };
    SelectionFilterDialog.prototype.build = function (node) {
        var _a;
        var filtered = (_a = this.column.getFilter()) !== null && _a !== void 0 ? _a : [];
        var selected = this.ctx.provider.getSelection().length;
        var total = this.ctx.provider.getTotalNumberOfRows();
        var visible = this.column.findMyRanker().getOrderLength();
        if (selected === 0 && filtered.length === 0) {
            // no rows selected and no filter set
            node.insertAdjacentText('beforeend', 'Select rows to apply this filter');
        }
        else if (selected > 0 && filtered.length === 0) {
            // rows select but no filter yet
            node.insertAdjacentHTML('beforeend', "<div class=\"".concat(cssClass('dialog-table'), "\">\n        <label class=\"").concat(cssClass('checkbox'), " ").concat(cssClass('dialog-filter-table-entry'), " ").concat(cssClass('dialog-table-entry-wide'), "\">\n          <input type=\"radio\" checked=\"checked\" name=\"mode\" value=\"none\">\n          <span>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-label'), "\">No filter</div>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-stats'), "\">").concat(visible.toLocaleString(), "/").concat(total.toLocaleString(), "</div>\n          </span>\n        </label>\n        <label class=\"").concat(cssClass('checkbox'), " ").concat(cssClass('dialog-filter-table-entry'), " ").concat(cssClass('dialog-table-entry-wide'), "\">\n          <input type=\"radio\" name=\"mode\" value=\"update\">\n          <span>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-label'), "\">Set filter to current selection</div>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-stats'), "\">").concat(selected.toLocaleString(), "/").concat(total.toLocaleString(), "</div>\n          </span>\n        </label>\n      </div>"));
        }
        else {
            var guessedRemoved = this.guessRemoveFilter();
            node.insertAdjacentHTML('beforeend', "<div class=\"".concat(cssClass('dialog-table'), "\" >\n        <label class=\"").concat(cssClass('checkbox'), " ").concat(cssClass('dialog-filter-table-entry'), " ").concat(cssClass('dialog-table-entry-wide'), "\">\n          <input type=\"radio\" ").concat(filtered.length === 0 ? 'checked="checked"' : '', " name=\"mode\" value=\"none\">\n          <span>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-label'), "\">Remove filter</div>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-stats'), "\">").concat(guessedRemoved, "/").concat(total.toLocaleString(), "</div>\n          </span>\n        </label>\n        <label class=\"").concat(cssClass('checkbox'), " ").concat(cssClass('dialog-filter-table-entry'), " ").concat(cssClass('dialog-table-entry-wide'), "\">\n          <input type=\"radio\" ").concat(filtered.length > 0 ? 'checked="checked"' : '', " name=\"mode\" value=\"keep\">\n          <span>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-label'), "\">Keep current filter</div>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-stats'), "\">").concat(filtered.length.toLocaleString(), "/").concat(total.toLocaleString(), "</div>\n          </span>\n        </label>\n        <label class=\"").concat(cssClass('checkbox'), " ").concat(cssClass('dialog-filter-table-entry'), " ").concat(cssClass('dialog-table-entry-wide'), "\">\n          <input type=\"radio\" name=\"mode\" value=\"update\" ").concat(selected === 0 ? 'disabled="disabled"' : '', ">\n          <span>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-label'), "\">Set filter to current selection</div>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-stats'), "\">").concat(selected.toLocaleString(), "/").concat(total.toLocaleString(), "</div>\n          </span>\n        </label>\n      </div>"));
        }
        var inputs = Array.from(node.querySelectorAll('input'));
        this.enableLivePreviews(inputs);
    };
    return SelectionFilterDialog;
}(ADialog));
export default SelectionFilterDialog;
//# sourceMappingURL=SelectionFilterDialog.js.map