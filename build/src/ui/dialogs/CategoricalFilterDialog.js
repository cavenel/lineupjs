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
import { SetColumn, CategoricalColumn, Ranking, BooleanColumn, } from '../../model';
import ADialog, {} from './ADialog';
import { forEach } from './utils';
import { cssClass, engineCssClass } from '../../styles';
import { isCategoryIncluded } from '../../model/internalCategorical';
/** @internal */
var CategoricalFilterDialog = /** @class */ (function (_super) {
    __extends(CategoricalFilterDialog, _super);
    function CategoricalFilterDialog(column, dialog, ctx) {
        var _this = _super.call(this, dialog, {
            livePreview: 'filter',
        }) || this;
        _this.column = column;
        _this.ctx = ctx;
        _this.before = _this.column.getFilter() || { filter: '', filterMissing: false };
        return _this;
    }
    CategoricalFilterDialog.prototype.build = function (node) {
        var _this = this;
        node.insertAdjacentHTML('beforeend', "<div class=\"".concat(cssClass('dialog-table'), "\">\n        <input type=\"text\" placeholder=\"Filter categories...\" class=\"").concat(cssClass('category-filter-input'), "\" data-filter=\"\">\n        <label class=\"").concat(cssClass('checkbox'), " ").concat(cssClass('dialog-filter-table-entry'), "\">\n          <input type=\"checkbox\" checked>\n          <span>\n            <span class=\"").concat(cssClass('dialog-filter-table-color'), "\"></span>\n            <div>Un/Select All</div>\n          </span>\n        </label>\n        ").concat(this.column.categories
            .map(function (c) { return "<label class=\"".concat(cssClass('checkbox'), " ").concat(cssClass('dialog-filter-table-entry'), "\" data-cat=\"\">\n          <input data-cat=\"\" type=\"checkbox\"").concat(isCategoryIncluded(_this.before, c) ? 'checked' : '', ">\n          <span>\n            <span class=\"").concat(cssClass('dialog-filter-table-color'), "\" style=\"background-color: ").concat(_this.ctx.sanitize(c.color), "\"></span>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-label'), "\"> </div>\n            <a href=\"#\" class=\"").concat(cssClass('dialog-filter-table-only'), "\" data-cat=\"").concat(c.name, "\">[Only]</a>&nbsp;\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-stats'), "\"></div>\n          </span>\n        </label>"); })
            .join(''), "\n        <label class=\"").concat(cssClass('checkbox'), " ").concat(cssClass('dialog-filter-table-entry'), "\" data-missing=\"\">\n          <input type=\"checkbox\" ").concat(!this.before.filterMissing ? 'checked="checked"' : '', " data-missing=\"\">\n          <span>\n            <span class=\"").concat(cssClass('dialog-filter-table-color'), " ").concat(cssClass('missing'), "\"></span>\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-label'), "\">missing value rows</div>\n            <a href=\"#\" class=\"").concat(cssClass('dialog-filter-table-only'), "\" data-cat=\"\">[Only]</a>&nbsp;\n            <div class=\"").concat(cssClass('dialog-filter-table-entry-stats'), "\">0</div>\n          </span>\n        </label>\n    </div>"));
        var filterInput = node.querySelector(".".concat(cssClass('category-filter-input')));
        var categoryLabels = node.querySelectorAll("label.".concat(cssClass('checkbox'), "[data-cat]"));
        // Focus the filter input when the dialog is shown
        setTimeout(function () { return filterInput.focus(); }, 10);
        filterInput.addEventListener('input', function () {
            var filterValue = filterInput.value.toLowerCase();
            categoryLabels.forEach(function (label) {
                var _a, _b;
                var categoryLabel = (_b = (_a = label.querySelector(".".concat(cssClass('dialog-filter-table-entry-label')))) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                if (categoryLabel && categoryLabel.includes(filterValue)) {
                    label.style.display = '';
                }
                else {
                    label.style.display = 'none';
                }
            });
        });
        node.querySelectorAll(".".concat(cssClass('dialog-filter-table-only'))).forEach(function (onlyLink) {
            onlyLink.addEventListener('click', function (event) {
                event.preventDefault();
                // Uncheck Select All checkbox
                var selectAll = _this.findInput('input:not([data-cat]):not([data-filter])');
                selectAll.checked = false;
                var catName = event.target.dataset.cat;
                // Uncheck all categories
                forEach(node, 'input[data-cat]', function (checkbox) {
                    checkbox.checked = false;
                });
                // Uncheck missing value rows if the category is not missing
                var missingCheckbox = _this.findInput('input[data-missing]');
                if (catName) {
                    missingCheckbox.checked = false;
                }
                else {
                    missingCheckbox.checked = true;
                }
                // Check only the clicked category
                var targetCheckbox = node.querySelector("input[data-cat][data-cat=\"".concat(catName, "\"]"));
                if (targetCheckbox) {
                    targetCheckbox.checked = true;
                }
                _this.submit(); // Ensures the filter is applied immediately
            });
        });
        var categories = this.column.categories;
        categoryLabels.forEach(function (n, i) {
            var cat = categories[i];
            n.firstElementChild.dataset.cat = cat.name;
            n.querySelector(".".concat(cssClass('dialog-filter-table-entry-label'))).textContent = cat.label;
        });
        Array.from(node.querySelectorAll("label.".concat(cssClass('checkbox'), "[data-cat]"))).forEach(function (n, i) {
            var cat = categories[i];
            n.firstElementChild.dataset.cat = cat.name;
            n.querySelector(".".concat(cssClass('dialog-filter-table-entry-label'))).textContent = cat.label;
        });
        // selectAll
        var selectAll = this.findInput('input:not([data-cat]):not([data-filter])');
        selectAll.onchange = function () {
            forEach(node, 'input[data-cat],input[data-missing]', function (n) { return (n.checked = selectAll.checked); });
        };
        if (this.column instanceof SetColumn) {
            var some = this.before.mode !== 'every';
            node.insertAdjacentHTML('beforeend', "<strong>Show rows where</strong>");
            node.insertAdjacentHTML('beforeend', "<label class=\"".concat(cssClass('checkbox'), "\">\n        <input type=\"radio\" ").concat(!some ? 'checked="checked"' : '', " name=\"mode\" value=\"every\">\n        <span>all are selected</span>\n      </label>"));
            node.insertAdjacentHTML('beforeend', "<label class=\"".concat(cssClass('checkbox'), "\" style=\"padding-bottom: 0.6em\">\n        <input type=\"radio\" ").concat(some ? 'checked="checked"' : '', " name=\"mode\" value=\"some\">\n        <span>some are selected</span>\n      </label>"));
        }
        this.enableLivePreviews('input[type=checkbox],input[type=radio]');
        var ranking = this.column.findMyRanker();
        if (ranking) {
            ranking.on("".concat(Ranking.EVENT_ORDER_CHANGED, ".catFilter"), function () { return _this.updateStats(); });
        }
        this.updateStats();
    };
    CategoricalFilterDialog.prototype.updateStats = function () {
        var _this = this;
        var ready = this.ctx.provider
            .getTaskExecutor()
            .summaryCategoricalStats(this.column)
            .then(function (r) {
            if (typeof r === 'symbol') {
                return;
            }
            var summary = r.summary, data = r.data;
            if (!summary || !data) {
                return;
            }
            var missingNode = _this.find("label[data-missing] .".concat(cssClass('dialog-filter-table-entry-stats')));
            missingNode.textContent = "".concat(summary.missing.toLocaleString(), "/").concat(data.count.toLocaleString());
            _this.forEach("label[data-cat] .".concat(cssClass('dialog-filter-table-entry-stats')), function (n, i) {
                var bin = summary.hist[i];
                var raw = data.hist[i];
                n.textContent = "".concat(bin.count.toLocaleString(), "/").concat(raw.count.toLocaleString());
            });
        });
        if (!ready) {
            return;
        }
        this.node.classList.add(engineCssClass('loading'));
        ready.then(function () {
            _this.node.classList.remove(engineCssClass('loading'));
        });
    };
    CategoricalFilterDialog.prototype.updateFilter = function (filter, filterMissing, someMode) {
        if (someMode === void 0) { someMode = false; }
        var noFilter = filter == null && filterMissing === false;
        var f = { filter: filter, filterMissing: filterMissing };
        if (this.column instanceof SetColumn) {
            f.mode = someMode ? 'some' : 'every';
        }
        this.column.setFilter(noFilter ? null : f);
    };
    CategoricalFilterDialog.prototype.reset = function () {
        this.forEach('input[data-cat]', function (n) { return (n.checked = true); });
        this.findInput('input[data-missing]').checked = true;
        var mode = this.findInput('input[value=every]');
        if (mode) {
            mode.checked = true;
        }
    };
    CategoricalFilterDialog.prototype.cancel = function () {
        this.updateFilter(this.before.filter === '' ? null : this.before.filter, this.before.filterMissing, this.before.mode === 'some');
    };
    CategoricalFilterDialog.prototype.submit = function () {
        var f = this.forEach('input[data-cat]:checked', function (n) { return n.dataset.cat; });
        if (f.length === this.column.categories.length) {
            // all checked = no filter
            f = null;
        }
        // TODO
        var filterMissing = !this.findInput('input[data-missing]').checked;
        var mode = this.findInput('input[value=some]');
        this.updateFilter(f, filterMissing, mode != null && mode.checked);
        return true;
    };
    CategoricalFilterDialog.prototype.cleanUp = function (action) {
        _super.prototype.cleanUp.call(this, action);
        var ranking = this.column.findMyRanker();
        if (ranking) {
            ranking.on("".concat(Ranking.EVENT_ORDER_CHANGED, ".catFilter"), null);
        }
    };
    return CategoricalFilterDialog;
}(ADialog));
export default CategoricalFilterDialog;
//# sourceMappingURL=CategoricalFilterDialog.js.map