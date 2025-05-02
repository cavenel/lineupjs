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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { round, similar, dragHandle } from '../../internal';
import ADialog, {} from './ADialog';
import { cssClass } from '../../styles';
function clamp(v) {
    return Math.max(Math.min(v, 100), 0);
}
/** @internal */
var MappingLineDialog = /** @class */ (function (_super) {
    __extends(MappingLineDialog, _super);
    function MappingLineDialog(line, dialog, adapter) {
        var _this = _super.call(this, dialog, {
            livePreview: 'dataMapping',
        }) || this;
        _this.line = line;
        _this.adapter = adapter;
        _this.dialog.attachment.classList.add(cssClass('mapping-line-selected'));
        _this.before = {
            domain: _this.line.domain,
            range: _this.line.range,
        };
        return _this;
    }
    MappingLineDialog.prototype.build = function (node) {
        var _this = this;
        var domain = this.adapter.domain();
        node.insertAdjacentHTML('beforeend', "\n        <button class=\"".concat(cssClass('dialog-button'), " lu-action-remove\" title=\"Remove\" type=\"button\" ").concat(this.line.frozen ? 'style="display: none"' : '', " ><span style=\"margin-left: 3px\">Remove Mapping Line</span></button>\n        <strong>Input Domain Value (min ... max)</strong>\n        <input type=\"number\" value=\"").concat(this.adapter.formatter(this.adapter.unnormalizeRaw(this.line.domain)), "\" ").concat(this.line.frozen ? 'readonly disabled' : '', " autofocus required min=\"").concat(domain[0], "\" max=\"").concat(domain[1], "\" step=\"any\">\n        <strong>Output Normalized Value (0 ... 1)</strong>\n        <input type=\"number\" value=\"").concat(round(this.line.range / 100, 3), "\" required min=\"0\" max=\"1\" step=\"any\">\n      "));
        this.find('button').addEventListener('click', function () {
            _this.destroy('confirm');
            _this.line.destroy();
        }, {
            passive: true,
        });
        this.enableLivePreviews('input');
    };
    MappingLineDialog.prototype.cleanUp = function (action) {
        _super.prototype.cleanUp.call(this, action);
        this.dialog.attachment.classList.remove(cssClass('mapping-line-selected'));
    };
    MappingLineDialog.prototype.cancel = function () {
        this.line.update(this.before.domain, this.before.range, true);
    };
    MappingLineDialog.prototype.reset = function () {
        this.findInput('input[type=number]').value = round(this.adapter.unnormalizeRaw(this.before.domain), 3).toString();
        this.findInput('input[type=number]:last-of-type').value = round(this.before.range / 100, 3).toString();
    };
    MappingLineDialog.prototype.submit = function () {
        if (!this.node.checkValidity()) {
            return false;
        }
        var domain = this.adapter.normalizeRaw(this.findInput('input[type=number]').valueAsNumber);
        var range = this.findInput('input[type=number]:last-of-type').valueAsNumber * 100;
        this.line.update(domain, range, true);
        return true;
    };
    return MappingLineDialog;
}(ADialog));
export default MappingLineDialog;
/** @internal */
var MappingLine = /** @class */ (function () {
    function MappingLine(g, domain, range, adapter) {
        var _this = this;
        this.domain = domain;
        this.range = range;
        this.adapter = adapter;
        var h = 52;
        g.insertAdjacentHTML('beforeend', "<g class=\"".concat(cssClass('dialog-mapper-mapping'), "\" transform=\"translate(").concat(domain, ",0)\">\n      <line x1=\"0\" x2=\"").concat(range - domain, "\" y2=\"").concat(h, "\"></line>\n      <line x1=\"0\" x2=\"").concat(range - domain, "\" y2=\"").concat(h, "\"></line>\n      <circle r=\"2\"></circle>\n      <circle cx=\"").concat(range - domain, "\" cy=\"").concat(h, "\" r=\"2\"></circle>\n      <text class=\"").concat(cssClass('dialog-mapper-mapping-domain'), " ").concat(domain > 25 && domain < 75 ? cssClass('dialog-mapper-mapping-middle') : '').concat(domain > 75 ? cssClass('dialog-mapper-mapping-right') : '', "\" dy=\"-3\">\n        ").concat(this.adapter.formatter(this.adapter.unnormalizeRaw(domain)), "\n      </text>\n      <text class=\"").concat(cssClass('dialog-mapper-mapping-range'), " ").concat(range > 25 && range < 75 ? cssClass('dialog-mapper-mapping-middle') : '').concat(range > 50 ? cssClass('dialog-mapper-mapping-right') : '', "\" dy=\"3\" x=\"").concat(range - domain, "\" y=\"").concat(h, "\">\n        ").concat(round(range / 100, 3), "\n      </text>\n      <title>Drag the anchor circle to change the mapping, double click to edit</title>\n    </g>"));
        this.node = g.lastElementChild;
        // freeze 0 and 100 domain = raw domain ones
        this.node.classList.toggle(cssClass('frozen'), similar(0, domain) || similar(domain, 100));
        {
            var beforeDomain_1;
            var beforeRange_1;
            var shiftDomain_1;
            var shiftRange_1;
            var normalize_1 = function (x) { return (x * 100) / g.getBoundingClientRect().width; };
            var common = {
                container: g.parentElement,
                filter: function (evt) { return evt.button === 0 && !evt.shiftKey; },
                onStart: function (_, x) {
                    beforeDomain_1 = _this.domain;
                    beforeRange_1 = _this.range;
                    var normalized = normalize_1(x);
                    shiftDomain_1 = _this.domain - normalized;
                    shiftRange_1 = _this.range - normalized;
                },
                onEnd: function () {
                    if (!similar(beforeDomain_1, _this.domain) || !similar(beforeRange_1, _this.range)) {
                        _this.adapter.updated(_this);
                    }
                },
            };
            var line = this.node.querySelector('line:first-of-type');
            dragHandle(line, __assign(__assign({}, common), { onDrag: function (_, x) {
                    var normalized = normalize_1(x);
                    _this.update(clamp(normalized + shiftDomain_1), clamp(normalized + shiftRange_1));
                } }));
            var domainCircle = this.node.querySelector('circle:first-of-type');
            dragHandle(domainCircle, __assign(__assign({}, common), { onDrag: function (_, x) {
                    var normalized = normalize_1(x);
                    _this.update(clamp(normalized), _this.range);
                } }));
            var rangeCircle = this.node.querySelector('circle:last-of-type');
            dragHandle(rangeCircle, __assign(__assign({}, common), { onDrag: function (_, x) {
                    var normalized = normalize_1(x);
                    _this.update(_this.domain, clamp(normalized));
                } }));
        }
        this.node.onclick = function (evt) {
            if (!evt.shiftKey) {
                return;
            }
            _this.openDialog();
        };
        this.node.ondblclick = function () {
            _this.openDialog();
        };
    }
    MappingLine.prototype.openDialog = function () {
        var ctx = {
            manager: this.adapter.dialog.manager,
            level: this.adapter.dialog.level + 1,
            attachment: this.node,
            idPrefix: this.adapter.dialog.idPrefix,
            sanitize: this.adapter.dialog.sanitize,
        };
        var dialog = new MappingLineDialog(this, ctx, this.adapter);
        dialog.open();
    };
    Object.defineProperty(MappingLine.prototype, "frozen", {
        get: function () {
            return this.node.classList.contains(cssClass('frozen'));
        },
        enumerable: false,
        configurable: true
    });
    MappingLine.prototype.destroy = function (handled) {
        if (handled === void 0) { handled = false; }
        this.node.remove();
        if (!handled) {
            this.adapter.destroyed(this);
        }
    };
    MappingLine.prototype.update = function (domain, range, trigger) {
        if (trigger === void 0) { trigger = false; }
        if (similar(domain, 100)) {
            domain = 100;
        }
        if (similar(domain, 0)) {
            domain = 0;
        }
        if (similar(range, 100)) {
            range = 100;
        }
        if (similar(range, 0)) {
            range = 0;
        }
        if (similar(domain, this.domain) && similar(range, this.range)) {
            return;
        }
        if (this.frozen) {
            domain = this.domain;
        }
        this.domain = domain;
        this.range = range;
        this.node.setAttribute('transform', "translate(".concat(domain, ",0)"));
        var shift = range - domain;
        Array.from(this.node.querySelectorAll('line')).forEach(function (d) { return d.setAttribute('x2', String(shift)); });
        this.node.querySelector('circle[cx]').setAttribute('cx', String(shift));
        var t1 = this.node.querySelector('text');
        t1.textContent = this.adapter.formatter(this.adapter.unnormalizeRaw(domain));
        t1.classList.toggle(cssClass('dialog-mapper-mapping-right'), domain > 75);
        t1.classList.toggle(cssClass('dialog-mapper-mapping-middle'), domain >= 25 && domain <= 75);
        var t2 = this.node.querySelector('text[x]');
        t2.textContent = round(range / 100, 3).toString();
        t2.classList.toggle(cssClass('dialog-mapper-mapping-right'), range > 75);
        t2.classList.toggle(cssClass('dialog-mapper-mapping-middle'), range >= 25 && range <= 75);
        t2.setAttribute('x', String(shift));
        if (trigger) {
            this.adapter.updated(this);
        }
    };
    return MappingLine;
}());
export { MappingLine };
//# sourceMappingURL=MappingLineDialog.js.map