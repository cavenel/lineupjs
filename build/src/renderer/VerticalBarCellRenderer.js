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
import { Column, NumbersColumn, isNumbersColumn } from '../model';
import { CANVAS_HEIGHT, cssClass } from '../styles';
import { ANumbersCellRenderer } from './ANumbersCellRenderer';
import { toHeatMapColor } from './BrightnessCellRenderer';
import { ERenderMode, } from './interfaces';
import { forEachChild, noRenderer } from './utils';
var VerticalBarCellRenderer = /** @class */ (function (_super) {
    __extends(VerticalBarCellRenderer, _super);
    function VerticalBarCellRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.title = 'Bar Chart';
        return _this;
    }
    VerticalBarCellRenderer.prototype.canRender = function (col, mode) {
        return isNumbersColumn(col) && Boolean(col.dataLength) && mode === ERenderMode.CELL;
    };
    VerticalBarCellRenderer.compute = function (v, threshold, domain) {
        if (v < threshold) {
            //threshold to down
            return { height: threshold - v, bottom: v - domain[0] };
        }
        //from top to down
        return { height: v - threshold, bottom: threshold - domain[0] };
    };
    VerticalBarCellRenderer.prototype.createContext = function (col, context, imposer) {
        var cellDimension = context.colWidth(col) / col.dataLength;
        var threshold = col.getMapping().apply(NumbersColumn.CENTER);
        var range = 1;
        var templateRows = '';
        for (var i = 0; i < col.dataLength; ++i) {
            templateRows += "<div class=\"".concat(cssClass('heatmap-cell'), "\" style=\"background-color: white\" title=\"\"></div>");
        }
        var formatter = col.getNumberFormat();
        return {
            clazz: cssClass('heatmap'),
            templateRow: templateRows,
            update: function (row, data, raw, item, tooltipPrefix) {
                var zero = toHeatMapColor(0, item, col, imposer);
                var one = toHeatMapColor(1, item, col, imposer);
                forEachChild(row, function (d, i) {
                    var v = data[i];
                    var _a = VerticalBarCellRenderer.compute(v, threshold, [0, 1]), bottom = _a.bottom, height = _a.height;
                    d.title = "".concat(tooltipPrefix || '').concat(formatter(raw[i]));
                    d.style.backgroundColor = v < threshold ? zero : one;
                    d.style.bottom = "".concat(Math.round((100 * bottom) / range), "%");
                    d.style.height = "".concat(Math.round((100 * height) / range), "%");
                });
            },
            render: function (ctx, data, item) {
                var zero = toHeatMapColor(0, item, col, imposer);
                var one = toHeatMapColor(1, item, col, imposer);
                var scale = CANVAS_HEIGHT / range;
                data.forEach(function (v, j) {
                    ctx.fillStyle = v < threshold ? zero : one;
                    var xpos = j * cellDimension;
                    var _a = VerticalBarCellRenderer.compute(v, threshold, [0, 1]), bottom = _a.bottom, height = _a.height;
                    ctx.fillRect(xpos, (range - height - bottom) * scale, cellDimension, height * scale);
                });
            },
        };
    };
    VerticalBarCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return VerticalBarCellRenderer;
}(ANumbersCellRenderer));
export default VerticalBarCellRenderer;
//# sourceMappingURL=VerticalBarCellRenderer.js.map