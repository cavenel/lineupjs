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
import { uniqueId } from './utils';
import { cssClass } from '../../styles';
import { color } from 'd3-color';
import { schemeCategory10, schemeAccent, schemeDark2, schemePastel1, schemePastel2, schemeSet1, schemeSet2, schemeSet3, } from 'd3-scale-chromatic';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION, ReplacementColorMappingFunction, } from '../../model/CategoricalColorMappingFunction';
var sets = {
    schemeCategory10: schemeCategory10,
    schemeAccent: schemeAccent,
    schemeDark2: schemeDark2,
    schemePastel1: schemePastel1,
    schemePastel2: schemePastel2,
    schemeSet1: schemeSet1,
    schemeSet2: schemeSet2,
    schemeSet3: schemeSet3,
};
/** @internal */
var CategoricalColorMappingDialog = /** @class */ (function (_super) {
    __extends(CategoricalColorMappingDialog, _super);
    function CategoricalColorMappingDialog(column, dialog) {
        var _this = _super.call(this, dialog, {
            livePreview: 'colorMapping',
        }) || this;
        _this.column = column;
        _this.before = column.getColorMapping().clone();
        return _this;
    }
    CategoricalColorMappingDialog.prototype.build = function (node) {
        var _this = this;
        var id = uniqueId(this.dialog.idPrefix);
        var mapping = this.column.getColorMapping();
        node.insertAdjacentHTML('beforeend', "<div class=\"".concat(cssClass('dialog-table'), "\">\n      <div class=\"").concat(cssClass('dialog-color-table-entry'), "\">\n        <select id=\"").concat(id, "Chooser\">\n          <option value=\"\">Apply Color Scheme...</option>\n          <option value=\"schemeCategory10\">D3 Category 10 (").concat(schemeCategory10.length, ")</option>\n          <option value=\"schemeSet1\">Set 1 (").concat(schemeSet1.length, ")</option>\n          <option value=\"schemeSet2\">Set 2 (").concat(schemeSet2.length, ")</option>\n          <option value=\"schemeSet3\">Set 3 (").concat(schemeSet3.length, ")</option>\n          <option value=\"schemeAccent\">Accent (").concat(schemeAccent.length, ")</option>\n          <option value=\"schemeDark2\">Dark2 (").concat(schemeDark2.length, ")</option>\n          <option value=\"schemePastel1\">Pastel 1 (").concat(schemePastel1.length, ")</option>\n          <option value=\"schemePastel2\">Pastel 2 (").concat(schemePastel2.length, ")</option>\n        </select>\n      </div>\n      ").concat(this.column.categories
            .map(function () { return "\n        <label class=\"".concat(cssClass('checkbox'), " ").concat(cssClass('dialog-color-table-entry'), "\">\n          <input data-cat=\"\" type=\"color\" value=\"\">\n          <span> </span>\n        </label>"); })
            .join(''), "\n    </div>"));
        var categories = this.column.categories;
        Array.from(node.querySelectorAll("label.".concat(cssClass('checkbox'), ".").concat(cssClass('dialog-color-table-entry')))).forEach(function (n, i) {
            var cat = categories[i];
            n.firstElementChild.dataset.cat = cat.name;
            n.firstElementChild.value = color(mapping.apply(cat)).formatHex();
            n.lastElementChild.textContent = cat.label;
        });
        this.findInput('select').onchange = function (evt) {
            var scheme = sets[evt.currentTarget.value];
            if (!scheme) {
                return;
            }
            _this.forEach('[data-cat]', function (n, i) {
                n.value = scheme[i % scheme.length];
            });
            if (_this.showLivePreviews()) {
                _this.submit();
            }
        };
        this.enableLivePreviews('input[type=color]');
    };
    CategoricalColorMappingDialog.prototype.reset = function () {
        var cats = this.column.categories;
        this.forEach('[data-cat]', function (n, i) {
            n.value = color(cats[i].color).formatHex();
        });
    };
    CategoricalColorMappingDialog.prototype.submit = function () {
        var cats = this.column.categories;
        var map = new Map();
        this.forEach('input[data-cat]', function (n, i) {
            var cat = cats[i];
            if (color(cat.color).formatHex() !== n.value) {
                map.set(cat, n.value);
            }
        });
        if (map.size === 0) {
            this.column.setColorMapping(DEFAULT_CATEGORICAL_COLOR_FUNCTION);
        }
        else {
            this.column.setColorMapping(new ReplacementColorMappingFunction(map));
        }
        return true;
    };
    CategoricalColorMappingDialog.prototype.cancel = function () {
        this.column.setColorMapping(this.before);
    };
    return CategoricalColorMappingDialog;
}(ADialog));
export default CategoricalColorMappingDialog;
//# sourceMappingURL=CategoricalColorMappingDialog.js.map