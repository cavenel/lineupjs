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
import { filterMissingMarkup, findFilterMissing } from '../missing';
import ADialog, {} from './ADialog';
import { cssClass } from '../../styles';
import { debounce } from '../../internal';
import { filterToString, matchDataList } from '../../renderer/StringCellRenderer';
function toInput(text, isRegex) {
    var v = text.trim();
    if (v === '') {
        return null;
    }
    return isRegex ? new RegExp(v, 'm') : v;
}
/** @internal */
var StringFilterDialog = /** @class */ (function (_super) {
    __extends(StringFilterDialog, _super);
    function StringFilterDialog(column, dialog, ctx) {
        var _this = _super.call(this, dialog, {
            livePreview: 'filter',
        }) || this;
        _this.column = column;
        _this.ctx = ctx;
        _this.before = _this.column.getFilter();
        return _this;
    }
    StringFilterDialog.prototype.updateFilter = function (filter, filterMissing) {
        if (filter == null && !filterMissing) {
            this.column.setFilter(null);
        }
        else {
            this.column.setFilter({ filter: filter, filterMissing: filterMissing });
        }
    };
    StringFilterDialog.prototype.reset = function () {
        this.findInput('input[type="text"]').value = '';
        this.forEach('input[type=checkbox]', function (n) { return (n.checked = false); });
    };
    StringFilterDialog.prototype.cancel = function () {
        if (this.before) {
            this.updateFilter(this.before.filter === '' ? null : this.before.filter, this.before.filterMissing);
        }
        else {
            this.updateFilter(null, false);
        }
    };
    StringFilterDialog.prototype.submit = function () {
        var filterMissing = findFilterMissing(this.node).checked;
        var input = this.findInput('input[type="text"]').value;
        var isRegex = this.findInput('input[type="checkbox"]').checked;
        this.updateFilter(toInput(input, isRegex), filterMissing);
        return true;
    };
    StringFilterDialog.prototype.build = function (node) {
        var _this = this;
        var s = this.ctx.sanitize;
        var bak = this.column.getFilter() || { filter: '', filterMissing: false };
        node.insertAdjacentHTML('beforeend', "<input type=\"text\" placeholder=\"Filter ".concat(s(this.column.desc.label), " \u2026\" autofocus\n         value=\"").concat(filterToString(bak), "\" list=\"").concat(this.dialog.idPrefix, "_sdl\">\n    <label class=\"").concat(cssClass('checkbox'), "\">\n      <input type=\"checkbox\" ").concat(bak.filter instanceof RegExp ? 'checked="checked"' : '', ">\n      <span>Use regular expressions</span>\n    </label>\n    ").concat(filterMissingMarkup(bak.filterMissing), "\n    <datalist id=\"").concat(this.dialog.idPrefix, "_sdl\"></datalist>"));
        var filterMissing = findFilterMissing(node);
        var input = node.querySelector('input[type="text"]');
        var isRegex = node.querySelector('input[type="checkbox"]');
        var dl = node.querySelector('datalist');
        this.ctx.provider
            .getTaskExecutor()
            .summaryStringStats(this.column)
            .then(function (r) {
            if (typeof r === 'symbol') {
                return;
            }
            var summary = r.summary;
            matchDataList(dl, summary.topN);
        });
        this.enableLivePreviews([filterMissing, input, isRegex]);
        if (!this.showLivePreviews()) {
            return;
        }
        input.addEventListener('input', debounce(function () {
            var input = _this.findInput('input[type="text"]').value;
            if (input.length > 0 && !_this.before) {
                findFilterMissing(_this.node).checked = true;
            }
            _this.submit();
        }, 100), {
            passive: true,
        });
    };
    return StringFilterDialog;
}(ADialog));
export default StringFilterDialog;
//# sourceMappingURL=StringFilterDialog.js.map