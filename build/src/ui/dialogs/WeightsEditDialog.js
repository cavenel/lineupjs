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
import ADialog, {} from './ADialog';
import { forEach, colorOf } from './utils';
import { cssClass } from '../../styles';
/** @internal */
var WeightsEditDialog = /** @class */ (function (_super) {
    __extends(WeightsEditDialog, _super);
    function WeightsEditDialog(column, dialog) {
        var _this = _super.call(this, dialog) || this;
        _this.column = column;
        _this.weights = _this.column.getWeights();
        return _this;
    }
    WeightsEditDialog.prototype.cancel = function () {
        this.column.setWeights(this.weights.slice());
    };
    WeightsEditDialog.prototype.reset = function () {
        var weight = 100 / this.weights.length;
        forEach(this.node, 'input[type=number]', function (n) {
            var v = round(weight, 2);
            n.value = String(v);
            n.nextElementSibling.firstElementChild.style.width = "".concat(v, "%");
        });
    };
    WeightsEditDialog.prototype.build = function (node) {
        var _this = this;
        var children = this.column.children;
        node.insertAdjacentHTML('beforeend', "<div class=\"".concat(cssClass('dialog-table'), "\">\n        ").concat(this.weights
            .map(function (weight, i) { return "<div class=\"".concat(cssClass('dialog-weights-table-entry'), "\">\n          <input type=\"number\" value=\"").concat(round(weight * 100, 2), "\" min=\"0\" max=\"100\" step=\"any\" required>\n          <span class=\"").concat(cssClass('dialog-filter-color-bar'), "\">\n            <span style=\"background-color: ").concat(colorOf(children[i]), "; width: ").concat(round(weight * 100, 2), "%\"></span>\n          </span>\n          ").concat(_this.dialog.sanitize(children[i].label), "\n        </div>"); })
            .join(''), "\n    </div>"));
        var inputs = Array.from(this.node.querySelectorAll('input[type=number]'));
        inputs.forEach(function (d, i) {
            d.oninput = function () {
                var weight = d.valueAsNumber;
                if (weight <= 0) {
                    d.setCustomValidity('weight cannot be zero');
                }
                else {
                    d.setCustomValidity('');
                }
                _this.updateBar(d);
                if (inputs.length !== 2) {
                    return;
                }
                // corner case auto decrease the other
                var rest = 100 - weight;
                if (rest <= 0) {
                    d.setCustomValidity('weight cannot be 100 in case of two elements');
                }
                else {
                    d.setCustomValidity('');
                }
                var other = inputs[1 - i];
                other.value = round(rest, 2).toString();
                _this.updateBar(other);
            };
        });
    };
    WeightsEditDialog.prototype.updateBar = function (input) {
        input.nextElementSibling.firstElementChild.style.width = "".concat(input.value, "%");
    };
    WeightsEditDialog.prototype.distributeWeights = function () {
        var inputs = Array.from(this.node.querySelectorAll('input[type=number]')).map(function (d) { return ({
            input: d,
            weight: d.value ? d.valueAsNumber : NaN,
        }); });
        var hasMissing = inputs.some(function (d) { return Number.isNaN(d.weight); });
        if (hasMissing) {
            // compute missing ones
            var missingIndices = inputs.filter(function (d) { return Number.isNaN(d.weight); });
            var correct = inputs.filter(function (d) { return !Number.isNaN(d.weight); });
            var sum_1 = correct.reduce(function (a, b) { return a + b.weight; }, 0);
            if (sum_1 < 100) {
                // compute rest
                var rest = (100 - sum_1) / missingIndices.length;
                for (var _i = 0, missingIndices_1 = missingIndices; _i < missingIndices_1.length; _i++) {
                    var input = missingIndices_1[_i];
                    input.input.value = round(rest, 2).toString();
                    this.updateBar(input.input);
                }
                return;
            }
            // already above 100, set missing to 0 and do a regular normalization (user has to deal with it)
            for (var _a = 0, missingIndices_2 = missingIndices; _a < missingIndices_2.length; _a++) {
                var input = missingIndices_2[_a];
                input.input.value = '0';
                this.updateBar(input.input);
            }
        }
        var weights = inputs.map(function (d) { return d.weight; });
        if (validWeights(weights)) {
            return; // nothing to do
        }
        // pure distribute the sum
        var sum = weights.reduce(function (a, b) { return a + b; }, 0);
        for (var _b = 0, inputs_1 = inputs; _b < inputs_1.length; _b++) {
            var input = inputs_1[_b];
            input.input.value = round((input.weight * 100) / sum, 2).toString();
            this.updateBar(input.input);
        }
    };
    WeightsEditDialog.prototype.appendDialogButtons = function () {
        var _this = this;
        _super.prototype.appendDialogButtons.call(this);
        var buttons = this.node.querySelector(".".concat(cssClass('dialog-buttons')));
        buttons.insertAdjacentHTML('beforeend', "<button class=\"".concat(cssClass('dialog-button'), " ").concat(cssClass('dialog-weights-distribute-button'), "\" type=\"button\" title=\"distribute weights\"></button>"));
        var last = buttons.lastElementChild;
        last.onclick = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            _this.distributeWeights();
        };
    };
    WeightsEditDialog.prototype.submit = function () {
        var inputs = Array.from(this.node.querySelectorAll('input[type=number]')).map(function (d) { return ({
            input: d,
            weight: d.valueAsNumber,
        }); });
        var invalid = false;
        for (var _i = 0, inputs_2 = inputs; _i < inputs_2.length; _i++) {
            var input = inputs_2[_i];
            if (input.weight <= 0) {
                input.input.setCustomValidity('weight cannot be zero');
                invalid = true;
            }
            else {
                input.input.setCustomValidity('');
            }
        }
        var weights = inputs.map(function (d) { return d.weight; });
        if (!invalid && !validWeights(weights)) {
            inputs[inputs.length - 1].input.setCustomValidity('sum of weights has to be 100, change weights or use the redistribute button to fix');
            invalid = true;
        }
        if (invalid) {
            if (typeof this.node.reportValidity === 'function') {
                this.node.reportValidity();
            }
            return false;
        }
        this.column.setWeights(weights.map(function (d) { return d / 100; }));
        return true;
    };
    return WeightsEditDialog;
}(ADialog));
export default WeightsEditDialog;
function validWeights(weights) {
    return Math.abs(weights.reduce(function (a, b) { return a + b; }, 0) - 100) < 3;
}
//# sourceMappingURL=WeightsEditDialog.js.map