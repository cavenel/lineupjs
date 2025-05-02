import { DENSE_HISTOGRAM } from '../constants';
import { round } from '../internal';
import { Column, isCategoricalColumn } from '../model';
import { CANVAS_HEIGHT, cssClass, TICK } from '../styles';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
import { adaptColor, noRenderer, SMALL_MARK_LIGHTNESS_FACTOR } from './utils';
var CategoricalTickCellRenderer = /** @class */ (function () {
    /**
     * flag to always render the value
     * @type {boolean}
     */
    function CategoricalTickCellRenderer(renderValue) {
        if (renderValue === void 0) { renderValue = false; }
        this.renderValue = renderValue;
        this.title = 'Tick';
    }
    CategoricalTickCellRenderer.prototype.canRender = function (col, mode) {
        return isCategoricalColumn(col) && mode === ERenderMode.CELL;
    };
    CategoricalTickCellRenderer.prototype.create = function (col, context, imposer) {
        var width = col.getWidth();
        return {
            template: "<div><div></div><span ".concat(this.renderValue ? '' : "class=\"".concat(cssClass('text-shadow'), " ").concat(cssClass('hover-only'), "\""), "></span></div>"),
            update: function (n, d) {
                renderMissingDOM(n, col, d);
                var perElem = 100 / col.categories.length;
                var color = colorOf(col, d, imposer);
                if (col.categories.length > DENSE_HISTOGRAM) {
                    color = adaptColor(color, SMALL_MARK_LIGHTNESS_FACTOR);
                }
                var l = context.sanitize(col.getLabel(d));
                var index = col.categories.indexOf(col.getCategory(d));
                n.title = l;
                var tick = n.firstElementChild;
                tick.style.background = context.sanitize(color);
                tick.style.left = "".concat(round(perElem * index, 2), "%");
                tick.style.width = "".concat(round(perElem, 2), "%");
                var label = n.lastElementChild;
                label.textContent = l;
            },
            render: function (ctx, d) {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                var color = colorOf(col, d, imposer);
                if (col.categories.length > DENSE_HISTOGRAM) {
                    color = adaptColor(color, SMALL_MARK_LIGHTNESS_FACTOR);
                }
                var perElem = width / col.categories.length;
                var index = col.categories.indexOf(col.getCategory(d));
                ctx.save();
                ctx.globalAlpha = TICK.opacity;
                ctx.fillStyle = color || TICK.color;
                ctx.fillRect(Math.max(0, index * perElem), 0, perElem, CANVAS_HEIGHT);
                ctx.restore();
            },
        };
    };
    CategoricalTickCellRenderer.prototype.createGroup = function () {
        return noRenderer;
    };
    CategoricalTickCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return CategoricalTickCellRenderer;
}());
export default CategoricalTickCellRenderer;
//# sourceMappingURL=CategoricalTickCellRenderer.js.map