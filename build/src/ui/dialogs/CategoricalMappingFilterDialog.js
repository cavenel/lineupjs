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
import { round } from '../../internal';
import { isCategoryIncluded } from '../../model/internalCategorical';
import { filterMissingMarkup, findFilterMissing } from '../missing';
import ADialog, {} from './ADialog';
import { forEach } from './utils';
import { cssClass } from '../../styles';
/** @internal */
var CategoricalMappingFilterDialog = /** @class */ (function (_super) {
    __extends(CategoricalMappingFilterDialog, _super);
    function CategoricalMappingFilterDialog(column, dialog) {
        var _this = _super.call(this, dialog, {
            livePreview: 'filter',
        }) || this;
        _this.column = column;
        _this.before = _this.column.getFilter() || {
            filter: _this.column.categories.map(function (d) { return d.name; }),
            filterMissing: false,
        };
        return _this;
    }
    CategoricalMappingFilterDialog.prototype.build = function (node) {
        var _this = this;
        var joint = this.column.categories.map(function (d) {
            return Object.assign({
                range: round(d.value * 100, 2),
            }, d);
        });
        joint.sort(function (a, b) { return a.label.localeCompare(b.label); });
        node.insertAdjacentHTML('beforeend', "<div class=\"".concat(cssClass('dialog-table'), "\">\n        <label class=\"").concat(cssClass('checkbox'), " ").concat(cssClass('dialog-filter-table-entry'), "\">\n          <input type=\"checkbox\" checked>\n          <span>\n            <div>Un/Select All</div>\n          </span>\n        </label>\n        ").concat(joint
            .map(function (cat) { return "\n          <label class=\"".concat(cssClass('checkbox'), " ").concat(cssClass('dialog-filter-table-entry'), "\">\n            <input data-cat=\"").concat(cat.name, "\" type=\"checkbox\"").concat(isCategoryIncluded(_this.before, cat) ? 'checked' : '', ">\n            <span>\n              <input type=\"number\" value=\"").concat(cat.range, "\" min=\"0\" max=\"100\" size=\"5\">\n              <div class=\"").concat(cssClass('dialog-filter-color-bar'), "\">\n                <span style=\"background-color: ").concat(cat.color, "; width: ").concat(cat.range, "%\"></span>\n              </div>\n              <div>").concat(cat.label, "</div>\n            </span>\n          </label>"); })
            .join(''), "\n    </div>"));
        // TODO sanitize
        // selectAll
        var selectAll = this.findInput('input[type=checkbox]:not([data-cat])');
        selectAll.onchange = function () {
            forEach(node, '[data-cat]', function (n) { return (n.checked = selectAll.checked); });
        };
        this.forEach('input[type=number]', function (d) {
            d.oninput = function () {
                d.nextElementSibling.firstElementChild.style.width = "".concat(d.value, "%");
            };
        });
        node.insertAdjacentHTML('beforeend', filterMissingMarkup(this.before.filterMissing));
        this.enableLivePreviews('input[type=checkbox], input[type=number]');
    };
    CategoricalMappingFilterDialog.prototype.updateFilter = function (filter, filterMissing) {
        var noFilter = filter == null && filterMissing === false;
        this.column.setFilter(noFilter ? null : { filter: filter, filterMissing: filterMissing });
    };
    CategoricalMappingFilterDialog.prototype.cancel = function () {
        this.updateFilter(this.before.filter, this.before.filterMissing);
    };
    CategoricalMappingFilterDialog.prototype.reset = function () {
        this.forEach('[data-cat]', function (n) {
            n.checked = false;
            n.nextElementSibling.value = '50';
        });
    };
    CategoricalMappingFilterDialog.prototype.submit = function () {
        var items = this.forEach('input[data-cat]', function (n) { return ({
            checked: n.checked,
            cat: n.dataset.cat,
            range: n.nextElementSibling.valueAsNumber,
        }); });
        var f = items.filter(function (d) { return d.checked; }).map(function (d) { return d.cat; });
        if (f.length === this.column.categories.length) {
            // all checked = no filter
            f = null;
        }
        var filterMissing = findFilterMissing(this.node).checked;
        this.updateFilter(f, filterMissing);
        this.column.setMapping(items.map(function (d) { return d.range / 100; }));
        return true;
    };
    return CategoricalMappingFilterDialog;
}(ADialog));
export default CategoricalMappingFilterDialog;
//# sourceMappingURL=CategoricalMappingFilterDialog.js.map