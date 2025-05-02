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
import { abortAbleAll, isAsyncUpdate, StyleManager } from 'lineupengine';
import { round } from '../internal';
import { multiLevelGridCSSClass } from '../renderer/utils';
import { COLUMN_PADDING, cssClass } from '../styles';
import { createHeader, updateHeader } from './header';
import RenderColumn from './RenderColumn';
/** @internal */
var MultiLevelRenderColumn = /** @class */ (function (_super) {
    __extends(MultiLevelRenderColumn, _super);
    function MultiLevelRenderColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.summaries = [];
        return _this;
    }
    Object.defineProperty(MultiLevelRenderColumn.prototype, "mc", {
        get: function () {
            return this.c;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MultiLevelRenderColumn.prototype, "width", {
        get: function () {
            return this.c.getWidth() + COLUMN_PADDING * this.mc.length;
        },
        enumerable: false,
        configurable: true
    });
    MultiLevelRenderColumn.prototype.createHeader = function () {
        var r = _super.prototype.createHeader.call(this);
        var wrapper = this.ctx.document.createElement('div');
        wrapper.classList.add(cssClass('nested'));
        wrapper.classList.add(multiLevelGridCSSClass(this.ctx.idPrefix, this.c));
        if (isAsyncUpdate(r)) {
            r.item.appendChild(wrapper);
        }
        else {
            r.appendChild(wrapper);
        }
        return this.updateNested(wrapper, r);
    };
    MultiLevelRenderColumn.prototype.matchChildren = function (wrapper, children) {
        var _this = this;
        function matches(col, i) {
            //do both match?
            var n = wrapper.children[i];
            return n != null && n.dataset.colId === col.id;
        }
        if (children.every(matches) && children.length === wrapper.childElementCount) {
            // 1:1 match
            return;
        }
        var lookup = new Map(Array.from(wrapper.children).map(function (n, i) {
            return [n.dataset.colId, { node: n, summary: _this.summaries[i] }];
        }));
        // reset summaries array
        this.summaries = [];
        children.forEach(function (cc, i) {
            var existing = lookup.get(cc.id);
            if (existing) {
                // reuse existing
                lookup.delete(cc.id);
                var n_1 = existing.node;
                n_1.style.gridColumnStart = (i + 1).toString();
                wrapper.appendChild(n_1);
                _this.summaries[i] = existing.summary;
                return;
            }
            var n = createHeader(cc, _this.ctx, {
                extraPrefix: 'th',
                mergeDropAble: false,
                dragAble: _this.flags.advancedModelFeatures,
                rearrangeAble: _this.flags.advancedModelFeatures,
                resizeable: _this.flags.advancedModelFeatures,
            });
            n.classList.add(cssClass('header'), cssClass('nested-th'));
            n.style.gridColumnStart = (i + 1).toString();
            wrapper.appendChild(n);
            if (!_this.renderers || !_this.renderers.summary) {
                return;
            }
            var summary = _this.ctx.summaryRenderer(cc, false);
            var summaryNode = _this.ctx.asElement(summary.template);
            summaryNode.classList.add(cssClass('summary'), cssClass('th-summary'), cssClass("renderer-".concat(cc.getSummaryRenderer())));
            summaryNode.dataset.renderer = cc.getSummaryRenderer();
            n.appendChild(summaryNode);
            _this.summaries[i] = summary;
            summary.update(summaryNode);
        });
        // delete not used ones anymore
        lookup.forEach(function (v) { return v.node.remove(); });
    };
    MultiLevelRenderColumn.prototype.updateHeader = function (node) {
        var r = _super.prototype.updateHeader.call(this, node);
        node = isAsyncUpdate(r) ? r.item : r;
        var wrapper = node.getElementsByClassName(cssClass('nested'))[0];
        if (!wrapper) {
            return r; // too early
        }
        node.appendChild(wrapper); // ensure the last one
        return this.updateNested(wrapper, r);
    };
    MultiLevelRenderColumn.prototype.hasSummaryLine = function () {
        return _super.prototype.hasSummaryLine.call(this) || this.mc.children.some(function (c) { return Boolean(c.getMetaData().summary); });
    };
    MultiLevelRenderColumn.prototype.updateWidthRule = function (style) {
        var mc = this.mc;
        // need this for chrome to work properly
        var widths = mc.children.map(function (c) { return "minmax(0, ".concat(round(c.getWidth()), "fr)"); });
        var clazz = multiLevelGridCSSClass(this.ctx.idPrefix, this.c);
        style.updateRule("stacked-".concat(this.c.id), ".".concat(clazz), {
            display: 'grid',
            gridTemplateColumns: widths.join(' '),
        });
        return clazz;
    };
    MultiLevelRenderColumn.prototype.updateNested = function (wrapper, r) {
        var _this = this;
        var sub = this.mc.isShowNestedSummaries() ? this.mc.children : [];
        this.matchChildren(wrapper, sub);
        var children = Array.from(wrapper.children);
        var toWait = [];
        var header;
        if (isAsyncUpdate(r)) {
            toWait.push(r.ready);
            header = r.item;
        }
        else {
            header = r;
        }
        sub.forEach(function (c, i) {
            var node = children[i];
            updateHeader(node, c);
            if (!_this.renderers || !_this.renderers.summary) {
                return;
            }
            var summary = node.getElementsByClassName(cssClass('summary'))[0];
            var oldRenderer = summary.dataset.renderer;
            var currentRenderer = c.getSummaryRenderer();
            if (oldRenderer !== currentRenderer) {
                var renderer = _this.ctx.summaryRenderer(c, false);
                summary.remove();
                summary = _this.ctx.asElement(renderer.template);
                summary.classList.add(cssClass('summary'), cssClass('th-summary'), cssClass("renderer-".concat(currentRenderer)));
                summary.dataset.renderer = currentRenderer;
                _this.summaries[i] = renderer;
                node.appendChild(summary);
            }
            var ready = _this.summaries[i].update(summary);
            if (ready) {
                toWait.push(ready);
            }
        });
        if (toWait.length === 0) {
            return header;
        }
        return {
            item: header,
            ready: abortAbleAll(toWait),
        };
    };
    return MultiLevelRenderColumn;
}(RenderColumn));
export default MultiLevelRenderColumn;
//# sourceMappingURL=MultiLevelRenderColumn.js.map