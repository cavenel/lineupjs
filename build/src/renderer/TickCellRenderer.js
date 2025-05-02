import { round } from '../internal';
import { Column, isNumberColumn } from '../model';
import { CANVAS_HEIGHT, cssClass, TICK } from '../styles';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
import { adaptColor, noRenderer, SMALL_MARK_LIGHTNESS_FACTOR } from './utils';
var TickCellRenderer = /** @class */ (function () {
    /**
     * flag to always render the value
     * @type {boolean}
     */
    function TickCellRenderer(renderValue) {
        if (renderValue === void 0) { renderValue = false; }
        this.renderValue = renderValue;
        this.title = 'Tick';
        this.groupTitle = 'Ticks';
    }
    TickCellRenderer.prototype.canRender = function (col, mode) {
        return isNumberColumn(col) && mode === ERenderMode.CELL;
    };
    TickCellRenderer.prototype.create = function (col, context, imposer) {
        var width = col.getWidth();
        return {
            template: "<div><div></div><span ".concat(this.renderValue ? '' : "class=\"".concat(cssClass('text-shadow'), " ").concat(cssClass('hover-only'), "\""), "></span></div>"),
            update: function (n, d) {
                renderMissingDOM(n, col, d);
                var color = adaptColor(colorOf(col, d, imposer), SMALL_MARK_LIGHTNESS_FACTOR);
                var l = context.sanitize(col.getLabel(d));
                var v = col.getNumber(d);
                n.title = l;
                var tick = n.firstElementChild;
                tick.style.background = context.sanitize(color);
                tick.style.left = "".concat(round(v * 100, 2), "%");
                var label = n.lastElementChild;
                label.textContent = l;
            },
            render: function (ctx, d) {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                var color = adaptColor(colorOf(col, d, imposer), SMALL_MARK_LIGHTNESS_FACTOR);
                var v = col.getNumber(d);
                ctx.save();
                ctx.globalAlpha = TICK.opacity;
                ctx.fillStyle = color || TICK.color;
                ctx.fillRect(Math.max(0, v * width - TICK.size / 2), 0, TICK.size, CANVAS_HEIGHT);
                ctx.restore();
            },
        };
    };
    TickCellRenderer.prototype.createGroup = function () {
        return noRenderer;
    };
    TickCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return TickCellRenderer;
}());
export default TickCellRenderer;
//# sourceMappingURL=TickCellRenderer.js.map