import { round } from '../internal';
import { Column, isNumbersColumn, isNumberColumn, DEFAULT_COLOR, } from '../model';
import { setText, adaptDynamicColorToBgColor, noRenderer, BIG_MARK_LIGHTNESS_FACTOR, adaptColor } from './utils';
import { CANVAS_HEIGHT, cssClass } from '../styles';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
var BarCellRenderer = /** @class */ (function () {
    /**
     * flag to always render the value
     * @type {boolean}
     */
    function BarCellRenderer(renderValue) {
        if (renderValue === void 0) { renderValue = false; }
        this.renderValue = renderValue;
        this.title = 'Bar';
    }
    BarCellRenderer.prototype.canRender = function (col, mode) {
        return mode === ERenderMode.CELL && isNumberColumn(col) && !isNumbersColumn(col);
    };
    BarCellRenderer.prototype.create = function (col, context, imposer) {
        var width = context.colWidth(col);
        var showMin = col.desc.showMinimumRepresentation;
        return {
            template: "<div title=\"\">\n          <div class=\"".concat(cssClass('bar-label'), "\" style='background-color: ").concat(DEFAULT_COLOR, "'>\n            <span ").concat(this.renderValue ? '' : "class=\"".concat(cssClass('hover-only'), "\""), "></span>\n          </div>\n        </div>"),
            update: function (n, d) {
                var value = col.getNumber(d);
                var missing = renderMissingDOM(n, col, d);
                var w = Number.isNaN(value) ? 0 : round(value * 100, 2);
                var title = col.getLabel(d);
                n.title = title;
                var bar = n.firstElementChild;
                bar.style.width = missing ? '100%' : showMin ? "max(1px, ".concat(w, "%)") : "".concat(w, "%");
                var color = adaptColor(colorOf(col, d, imposer, value), BIG_MARK_LIGHTNESS_FACTOR);
                bar.style.backgroundColor = missing ? null : color;
                setText(bar.firstElementChild, title);
                var item = bar.firstElementChild;
                setText(item, title);
                adaptDynamicColorToBgColor(item, color || DEFAULT_COLOR, title, w / 100);
            },
            render: function (ctx, d) {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                var value = col.getNumber(d);
                ctx.fillStyle = adaptColor(colorOf(col, d, imposer, value) || DEFAULT_COLOR, BIG_MARK_LIGHTNESS_FACTOR);
                var w = width * value;
                ctx.fillRect(0, 0, Number.isNaN(w) ? 0 : Math.max(w, showMin ? 1 : 0), CANVAS_HEIGHT);
            },
        };
    };
    BarCellRenderer.prototype.createGroup = function () {
        return noRenderer;
    };
    BarCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return BarCellRenderer;
}());
export default BarCellRenderer;
//# sourceMappingURL=BarCellRenderer.js.map