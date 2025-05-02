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
import { isMissingValue, isMapAbleColumn } from '../../model';
import ADialog, {} from './ADialog';
import { MappingLine } from './MappingLineDialog';
import { cssClass } from '../../styles';
import { ScaleMappingFunction, ScriptMappingFunction } from '../../model/MappingFunction';
/** @internal */
var MappingDialog = /** @class */ (function (_super) {
    __extends(MappingDialog, _super);
    function MappingDialog(column, dialog, ctx) {
        var _this = _super.call(this, dialog, {
            livePreview: 'dataMapping',
            cancelSubDialogs: true,
        }) || this;
        _this.column = column;
        _this.mappingLines = [];
        _this.mappingAdapter = {
            destroyed: function (self) {
                _this.mappingLines.splice(_this.mappingLines.indexOf(self), 1);
                _this.updateLines(_this.computeScale());
            },
            updated: function () { return _this.updateLines(_this.computeScale()); },
            domain: function () { return _this.rawDomain; },
            normalizeRaw: _this.normalizeRaw.bind(_this),
            unnormalizeRaw: _this.unnormalizeRaw.bind(_this),
            dialog: _this.dialog,
            formatter: _this.column.getNumberFormat(),
        };
        _this.idPrefix = "me".concat(ctx.idPrefix);
        _this.before = _this.column.getMapping().clone();
        _this.scale = _this.column.getMapping().clone();
        var domain = _this.scale.domain;
        _this.rawDomain = [domain[0], domain[domain.length - 1]];
        _this.data = Promise.resolve(ctx.provider.mappingSample(column));
        return _this;
    }
    Object.defineProperty(MappingDialog.prototype, "scaleType", {
        get: function () {
            if (this.scale instanceof ScriptMappingFunction) {
                return 'script';
            }
            if (this.scale instanceof ScaleMappingFunction) {
                var base = this.scale.scaleType;
                if (base !== 'linear') {
                    return base;
                }
                // check if invert or absolute
                var r = this.scale.range;
                if (r.length === 2 && r[0] === 1 && r[1] === 0) {
                    return 'linear_invert';
                }
                if (r.length === 3 && r[0] === 1 && r[1] === 0 && r[2] === 1) {
                    return 'linear_abs';
                }
                return 'linear';
            }
            return 'unknown';
        },
        enumerable: false,
        configurable: true
    });
    MappingDialog.prototype.build = function (node) {
        var _this = this;
        node.classList.add(cssClass('dialog-mapper'));
        var r = this.column.findMyRanker();
        var others = !r ? [] : r.flatColumns.filter(function (d) { return isMapAbleColumn(d) && d !== _this.column; });
        node.insertAdjacentHTML('beforeend', "\n        <div><label for=\"".concat(this.idPrefix, "mapping_type\"><strong>Normalization Scaling:</strong></label><select id=\"").concat(this.idPrefix, "mapping_type\" class=\"browser-default\">\n        <option value=\"linear\">Linear</option>\n        <option value=\"linear_invert\">Invert</option>\n        <option value=\"linear_abs\">Absolute</option>\n        <option value=\"log\">Log</option>\n        <option value=\"pow1.1\">Pow 1.1</option>\n        <option value=\"pow2\">Pow 2</option>\n        <option value=\"pow3\">Pow 3</option>\n        <option value=\"sqrt\">Sqrt</option>\n        <option value=\"script\">Custom Script</option>\n        <option value=\"unknown\">Unknown</option>\n        ").concat(others.length > 0
            ? "<optgroup label=\"Copy From\">".concat(others
                .map(function (d) {
                return "<option value=\"copy_".concat(d.id, "\">").concat(_this.dialog.sanitize(d.label, d.desc.labelAsHTML === true), "</option>");
            })
                .join(''), "</optgroup>")
            : '', "\n      </select>\n      </div>\n        <div class=\"").concat(cssClass('dialog-mapper-warning'), "\">\n          Warning: All items with values outside of the input domain will be set to the min/max value of the input domain.\n        </div>\n        <div class=\"").concat(cssClass('dialog-mapper-domain'), "\">\n          <input id=\"").concat(this.idPrefix, "min\" required type=\"number\" value=\"").concat(round(this.rawDomain[0], 3), "\" step=\"any\">\n          <span>Input Domain (min - max)</span>\n          <input id=\"").concat(this.idPrefix, "max\" required type=\"number\" value=\"").concat(round(this.rawDomain[1], 3), "\" step=\"any\">\n        </div>\n        <svg class=\"").concat(cssClass('dialog-mapper-details'), "\" viewBox=\"0 0 106 66\">\n           <g transform=\"translate(3,7)\">\n              <rect y=\"-3\" width=\"100\" height=\"10\">\n                <title>Click to create a new mapping line</title>\n              </rect>\n              <rect y=\"49\" width=\"100\" height=\"10\">\n                <title>Click to create a new mapping line</title>\n              </rect>\n           </g>\n        </svg>\n        <div class=").concat(cssClass('dialog-mapper-range'), ">\n          <span>Output Normalized Domain (0 - 1)</span>\n        </div>\n        <div class=\"").concat(cssClass('dialog-mapper-script'), "\">\n          <strong>Custom Normalization Script</strong>\n          <textarea class=\"").concat(cssClass('textarea'), "\"></textarea>\n        </div>"));
        var g = node.querySelector(".".concat(cssClass('dialog-mapper-details'), " > g"));
        this.forEach(".".concat(cssClass('dialog-mapper-details'), " rect"), function (d) {
            return (d.onclick = function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                var bb = d.getBoundingClientRect();
                var x = round(((evt.x - bb.left) * 100) / bb.width, 2);
                var m = new MappingLine(g, x, x, _this.mappingAdapter);
                _this.mappingLines.push(m);
            });
        });
        {
            var select = this.find('select');
            var textarea_1 = this.find('textarea');
            select.onchange = function (evt) {
                var select = evt.currentTarget;
                switch (select.value) {
                    case 'linear_invert':
                        _this.scale = new ScaleMappingFunction(_this.rawDomain.slice(), 'linear', [1, 0]);
                        break;
                    case 'linear_abs':
                        _this.scale = new ScaleMappingFunction([_this.rawDomain[0], (_this.rawDomain[1] - _this.rawDomain[0]) / 2, _this.rawDomain[1]], 'linear', [1, 0, 1]);
                        break;
                    case 'script': {
                        var s = new ScriptMappingFunction(_this.rawDomain.slice());
                        _this.scale = s;
                        textarea_1.value = s.code;
                        break;
                    }
                    case 'unknown':
                        // clone original again
                        _this.scale = _this.column.getOriginalMapping().clone();
                        break;
                    default:
                        if (select.value.startsWith('copy_')) {
                            _this.copyMapping(select.value.slice('copy_'.length));
                            return;
                        }
                        _this.scale = new ScaleMappingFunction(_this.rawDomain.slice(), select.value, [0, 1]);
                        break;
                }
                _this.createMappings();
                node.dataset.scale = select.value;
                _this.updateLines();
            };
            var scaleType_1 = (node.dataset.scale = this.scaleType);
            select.selectedIndex = Array.from(select.options).findIndex(function (d) { return d.value === scaleType_1; });
            if (scaleType_1 === 'script') {
                textarea_1.value = this.scale.code;
            }
            this.createMappings();
        }
        this.forEach("#".concat(this.idPrefix, "min, #").concat(this.idPrefix, "max"), function (d, i) {
            d.onchange = function () {
                var v = d.valueAsNumber;
                if (v === _this.rawDomain[i]) {
                    d.setCustomValidity('');
                    return;
                }
                var other = _this.rawDomain[1 - i];
                if (Number.isNaN(v) || (i === 0 && v >= other) || (i === 1 && v <= other)) {
                    d.setCustomValidity("value has to be ".concat(i === 0 ? '<= max' : '>= min'));
                    return;
                }
                d.setCustomValidity('');
                _this.rawDomain[i] = v;
                _this.updateDomainWarning();
                _this.scale = _this.computeScale();
                var patchedDomain = _this.scale.domain.slice();
                patchedDomain[0] = _this.rawDomain[0];
                patchedDomain[patchedDomain.length - 1] = _this.rawDomain[1];
                _this.scale.domain = patchedDomain;
                _this.createMappings();
                _this.updateLines();
                if (_this.showLivePreviews()) {
                    _this.column.setMapping(_this.scale);
                }
            };
        });
        this.data.then(function (values) {
            values.forEach(function (v) {
                if (!isMissingValue(v)) {
                    g.insertAdjacentHTML('afterbegin', "<line data-v=\"".concat(v, "\" x1=\"").concat(round(_this.normalizeRaw(v), 2), "\" x2=\"").concat(round(_this.scale.apply(v) * 100, 2), "\" y2=\"52\"></line>"));
                }
            });
        });
        this.updateDomainWarning();
    };
    MappingDialog.prototype.updateDomainWarning = function () {
        var warningNode = this.node.querySelector(".".concat(cssClass('dialog-mapper-warning')));
        var originalDomain = this.column.getOriginalMapping().domain;
        var showWarning = this.rawDomain.some(function (d, i) { return originalDomain[i] !== d; });
        warningNode.style.display = showWarning ? '' : 'none';
    };
    MappingDialog.prototype.createMappings = function () {
        this.mappingLines.splice(0, this.mappingLines.length).forEach(function (d) { return d.destroy(true); });
        if (!(this.scale instanceof ScaleMappingFunction)) {
            return;
        }
        var g = this.node.querySelector(".".concat(cssClass('dialog-mapper-details'), " > g"));
        var domain = this.scale.domain;
        var range = this.scale.range;
        for (var i = 0; i < domain.length; ++i) {
            this.mappingLines.push(new MappingLine(g, this.normalizeRaw(domain[i]), range[i] * 100, this.mappingAdapter));
        }
    };
    MappingDialog.prototype.update = function () {
        var _this = this;
        var scaleType = (this.node.dataset.scale = this.scaleType);
        var select = this.find('select');
        select.selectedIndex = Array.from(select.options).findIndex(function (d) { return d.value === scaleType; });
        if (scaleType === 'script') {
            this.find('textarea').value = this.scale.code;
        }
        this.forEach("input[type=number]", function (d, i) {
            d.value = round(_this.rawDomain[i], 3).toString();
        });
    };
    MappingDialog.prototype.updateLines = function (scale) {
        var _this = this;
        if (scale === void 0) { scale = this.scale; }
        this.forEach(".".concat(cssClass('dialog-mapper-details'), "  > g > line[x1]"), function (d) {
            var v = Number.parseFloat(d.getAttribute('data-v'));
            d.setAttribute('x1', round(_this.normalizeRaw(v), 2).toString());
            d.setAttribute('x2', round(scale.apply(v) * 100, 2).toString());
        });
    };
    MappingDialog.prototype.reset = function () {
        this.scale = this.column.getOriginalMapping().clone();
        var domain = this.scale.domain;
        this.rawDomain = [domain[0], domain[domain.length - 1]];
        this.update();
        this.createMappings();
        this.updateLines();
        this.updateDomainWarning();
    };
    MappingDialog.prototype.copyMapping = function (columnId) {
        var r = this.column.findMyRanker();
        if (!r) {
            return;
        }
        var ref = r.find(columnId);
        this.scale = ref.getMapping().clone();
        this.rawDomain = this.scale.domain.slice();
        this.update();
        this.createMappings();
        this.updateLines();
    };
    MappingDialog.prototype.normalizeRaw = function (d) {
        var v = ((d - this.rawDomain[0]) * 100) / (this.rawDomain[1] - this.rawDomain[0]);
        return Math.max(Math.min(v, 100), 0); // clamp
    };
    MappingDialog.prototype.unnormalizeRaw = function (d) {
        return (d * (this.rawDomain[1] - this.rawDomain[0])) / 100 + this.rawDomain[0];
    };
    MappingDialog.prototype.computeScale = function () {
        var _this = this;
        var type = this.scaleType;
        if (type === 'script') {
            return new ScriptMappingFunction(this.rawDomain.slice(), this.node.querySelector('textarea').value);
        }
        this.mappingLines.sort(function (a, b) { return a.domain - b.domain; });
        var domain = this.mappingLines.map(function (d) { return _this.unnormalizeRaw(d.domain); });
        var range = this.mappingLines.map(function (d) { return d.range / 100; });
        return new ScaleMappingFunction(domain, type, range);
    };
    MappingDialog.prototype.submit = function () {
        if (!this.node.checkValidity()) {
            return false;
        }
        var scale = this.computeScale();
        this.column.setMapping(scale);
        return true;
    };
    MappingDialog.prototype.cancel = function () {
        this.column.setMapping(this.before);
    };
    return MappingDialog;
}(ADialog));
export default MappingDialog;
//# sourceMappingURL=MappingDialog.js.map