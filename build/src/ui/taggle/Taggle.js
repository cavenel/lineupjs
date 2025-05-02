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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { defaultOptions } from '../../config';
import { merge, suffix } from '../../internal';
import { cssClass, engineCssClass } from '../../styles';
import { ALineUp } from '../ALineUp';
import SidePanel from '../panel/SidePanel';
import { spaceFillingRule } from './rules';
import TaggleRenderer from './TaggleRenderer';
var Taggle = /** @class */ (function (_super) {
    __extends(Taggle, _super);
    function Taggle(node, data, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, node, data, options && options.ignoreUnsupportedBrowser === true) || this;
        _this.options = defaultOptions();
        merge(_this.options, options);
        merge(_this.options, {
            violationChanged: function (_rule, violation) { return _this.setViolation(violation); },
        });
        if (_this.options.copyableRows) {
            _this.addCopyListener();
        }
        _this.spaceFillingRule = spaceFillingRule(_this.options);
        if (!_this.isBrowserSupported) {
            _this.spaceFilling = null;
            _this.renderer = null;
            _this.panel = null;
            return _this;
        }
        _this.node.classList.add(cssClass(), cssClass('taggle'));
        _this.renderer = new TaggleRenderer(data, _this.node, _this.options);
        if (_this.options.sidePanel) {
            _this.panel = new SidePanel(_this.renderer.ctx, _this.node.ownerDocument, {
                collapseable: _this.options.sidePanelCollapsed ? 'collapsed' : true,
                hierarchy: _this.options.hierarchyIndicator && _this.options.flags.advancedRankingFeatures,
            });
            _this.renderer.pushUpdateAble(function (ctx) { return _this.panel.update(ctx); });
            _this.node.insertBefore(_this.panel.node, _this.node.firstChild);
            _this.panel.node.insertAdjacentHTML('afterbegin', "<div class=\"".concat(cssClass('rule-button-chooser'), " ").concat(cssClass('feature-advanced'), " ").concat(cssClass('feature-ui'), "\"><label>\n            <input type=\"checkbox\">\n            <span>Overview</span>\n            <div class=\"").concat(cssClass('rule-violation'), "\"></div>\n          </label></div>"));
            _this.spaceFilling = _this.panel.node.querySelector(".".concat(cssClass('rule-button-chooser')));
            var input = _this.spaceFilling.querySelector('input');
            input.onchange = function () {
                setTimeout(function () {
                    _this.setOverviewMode(!_this.isOverviewMode());
                });
            };
        }
        else {
            _this.panel = null;
            _this.spaceFilling = null;
        }
        if (_this.options.overviewMode) {
            _this.setOverviewMode(true);
        }
        _this.forward.apply(_this, __spreadArray([_this.renderer], suffix('.main', TaggleRenderer.EVENT_HIGHLIGHT_CHANGED, TaggleRenderer.EVENT_DIALOG_OPENED, TaggleRenderer.EVENT_DIALOG_CLOSED), false));
        return _this;
    }
    Taggle.prototype.isOverviewMode = function () {
        var _a;
        return ((_a = this.renderer) === null || _a === void 0 ? void 0 : _a.getRule()) === this.spaceFillingRule;
    };
    Taggle.prototype.setOverviewMode = function (overviewMode) {
        if (!this.renderer) {
            return;
        }
        this.updateLodRules(overviewMode);
        this.renderer.switchRule(overviewMode ? this.spaceFillingRule : null);
        if (this.spaceFilling) {
            this.spaceFilling.classList.toggle(cssClass('chosen'), overviewMode);
            this.spaceFilling.querySelector('input').checked = overviewMode;
        }
    };
    Taggle.prototype.updateLodRules = function (overviewMode) {
        if (!this.renderer) {
            return;
        }
        updateLodRules(this.renderer.style, overviewMode, this.options);
    };
    Taggle.prototype.setViolation = function (violation) {
        violation = violation || '';
        if (!this.spaceFilling) {
            return;
        }
        this.spaceFilling.classList.toggle(cssClass('violated'), Boolean(violation));
        var elem = this.spaceFilling.querySelector(".".concat(cssClass('rule-violation')));
        if (!violation) {
            elem.textContent = '';
        }
        else {
            elem.innerHTML = violation.replace(/\n/g, '<br>');
        }
    };
    Taggle.prototype.destroy = function () {
        this.node.classList.remove(cssClass(), cssClass('taggle'));
        if (this.renderer) {
            this.renderer.destroy();
        }
        if (this.panel) {
            this.panel.destroy();
        }
        _super.prototype.destroy.call(this);
    };
    Taggle.prototype.update = function () {
        if (this.renderer) {
            this.renderer.update();
        }
    };
    Taggle.prototype.setHighlight = function (dataIndex, scrollIntoView) {
        if (scrollIntoView === void 0) { scrollIntoView = true; }
        return this.renderer != null && this.renderer.setHighlight(dataIndex, scrollIntoView);
    };
    Taggle.prototype.getHighlight = function () {
        return this.renderer ? this.renderer.getHighlight() : -1;
    };
    Taggle.prototype.enableHighlightListening = function (enable) {
        if (this.renderer) {
            this.renderer.enableHighlightListening(enable);
        }
    };
    Taggle.prototype.setDataProvider = function (data, dump) {
        _super.prototype.setDataProvider.call(this, data, dump);
        if (!this.renderer) {
            return;
        }
        this.renderer.setDataProvider(data);
        this.update();
        this.panel.update(this.renderer.ctx);
    };
    Taggle.EVENT_SELECTION_CHANGED = ALineUp.EVENT_SELECTION_CHANGED;
    Taggle.EVENT_DIALOG_OPENED = ALineUp.EVENT_DIALOG_OPENED;
    Taggle.EVENT_DIALOG_CLOSED = ALineUp.EVENT_DIALOG_CLOSED;
    Taggle.EVENT_HIGHLIGHT_CHANGED = ALineUp.EVENT_HIGHLIGHT_CHANGED;
    return Taggle;
}(ALineUp));
export default Taggle;
export function updateLodRules(style, overviewMode, options) {
    if (!overviewMode) {
        style.deleteRule('taggle_lod_rule');
        style.deleteRule('lineup_rowPadding1');
        style.deleteRule('lineup_rowPadding2');
        return;
    }
    style.updateRule('taggle_lod_rule', "\n  .".concat(engineCssClass('tr'), ".").concat(cssClass('low'), "[data-agg=detail]:hover"), {
        /* show regular height for hovered rows in low + medium LOD */
        height: "".concat(options.rowHeight, "px !important"),
    });
    style.updateRule('lineup_rowPadding1', "\n  .".concat(engineCssClass('tr'), ".").concat(cssClass('low')), {
        marginTop: '0',
    });
    // no margin for hovered low level row otherwise everything will be shifted down and the hover is gone again
    // .${engineCssClass('tr')}.${cssClass('low')}:hover,
    // padding in general and for hovered low detail rows + their afterwards
    style.updateRule('lineup_rowPadding2', "\n  .".concat(engineCssClass('tr'), ".").concat(cssClass('low'), ".").concat(engineCssClass('highlighted'), ",\n  .").concat(engineCssClass('tr'), ".").concat(cssClass('selected'), ",\n  .").concat(engineCssClass('tr'), ".").concat(cssClass('low'), ":hover + .").concat(engineCssClass('tr'), ".").concat(cssClass('low'), ",\n  .").concat(engineCssClass('tr'), ".").concat(cssClass('low'), ".").concat(engineCssClass('highlighted'), " + .").concat(engineCssClass('tr'), ".").concat(cssClass('low'), ",\n  .").concat(engineCssClass('tr'), ".").concat(cssClass('selected'), " + .").concat(engineCssClass('tr'), ".").concat(cssClass('low')), {
        marginTop: "".concat(options.rowPadding, "px !important"),
    });
}
//# sourceMappingURL=Taggle.js.map