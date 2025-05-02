import { hsl } from 'd3-color';
import { Column, isNumbersColumn, isNumberColumn, isMapAbleColumn, DEFAULT_COLOR, SolidColorFunction, } from '../model';
import { CANVAS_HEIGHT, cssClass } from '../styles';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
import { noRenderer, setText } from './utils';
export function toHeatMapColor(v, row, col, imposer) {
    if (v == null || Number.isNaN(v)) {
        v = 1; // max = brightest
    }
    if (imposer || !isMapAbleColumn(col)) {
        //hsl space encoding, encode in lightness
        var color = hsl(colorOf(col, row, imposer, v) || DEFAULT_COLOR);
        color.l = 1 - v; // largest value = darkest color
        return color.toString();
    }
    var map = col.getColorMapping();
    var valueColor = map.apply(v);
    if (map instanceof SolidColorFunction) {
        //hsl space encoding, encode in lightness
        var color = hsl(valueColor);
        color.l = 1 - v; // largest value = darkest color
        return color.toString();
    }
    // some custom logic that maps to another value
    return valueColor;
}
var BrightnessCellRenderer = /** @class */ (function () {
    function BrightnessCellRenderer() {
        this.title = 'Brightness';
    }
    BrightnessCellRenderer.prototype.canRender = function (col, mode) {
        return isNumberColumn(col) && mode === ERenderMode.CELL && !isNumbersColumn(col);
    };
    BrightnessCellRenderer.prototype.create = function (col, context, imposer) {
        var width = context.colWidth(col);
        return {
            template: "<div title=\"\">\n        <div class=\"".concat(cssClass('cat-color'), "\" style=\"background-color: ").concat(DEFAULT_COLOR, "\"></div><div class=\"").concat(cssClass('cat-label'), "\"> </div>\n      </div>"),
            update: function (n, d) {
                var missing = renderMissingDOM(n, col, d);
                n.title = col.getLabel(d);
                n.firstElementChild.style.backgroundColor = missing
                    ? null
                    : toHeatMapColor(col.getNumber(d), d, col, imposer);
                setText(n.lastElementChild, n.title);
            },
            render: function (ctx, d) {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                ctx.fillStyle = toHeatMapColor(col.getNumber(d), d, col, imposer);
                ctx.fillRect(0, 0, width, CANVAS_HEIGHT);
            },
        };
    };
    BrightnessCellRenderer.prototype.createGroup = function () {
        return noRenderer;
    };
    BrightnessCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return BrightnessCellRenderer;
}());
export default BrightnessCellRenderer;
//# sourceMappingURL=BrightnessCellRenderer.js.map