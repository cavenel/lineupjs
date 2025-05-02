import { Column, isNumbersColumn } from '../model';
import { CANVAS_HEIGHT, cssClass } from '../styles';
import { ANumbersCellRenderer } from './ANumbersCellRenderer';
import { toHeatMapColor } from './BrightnessCellRenderer';
import { renderMissingValue, renderMissingDOM } from './missing';
import { noop, wideEnough } from './utils';
import { GUESSED_ROW_HEIGHT } from '../constants';
import { getSortLabel } from '../internal';
var HeatmapCellRenderer = /** @class */ (function () {
    function HeatmapCellRenderer() {
        this.title = 'Heatmap';
    }
    HeatmapCellRenderer.prototype.canRender = function (col) {
        return isNumbersColumn(col) && Boolean(col.dataLength);
    };
    HeatmapCellRenderer.prototype.createContext = function (col, context, imposer) {
        var width = context.colWidth(col);
        var cellDimension = width / col.dataLength;
        var labels = col.labels;
        var render = function (ctx, data, item, height) {
            data.forEach(function (d, j) {
                var x = j * cellDimension;
                if (Number.isNaN(d)) {
                    renderMissingValue(ctx, cellDimension, height, x, 0);
                    return;
                }
                ctx.fillStyle = toHeatMapColor(d, item, col, imposer);
                ctx.fillRect(x, 0, cellDimension, height);
            });
        };
        return {
            template: "<canvas height=\"".concat(GUESSED_ROW_HEIGHT, "\" title=\"\"></canvas>"),
            render: render,
            width: width,
            mover: function (n, values, prefix) { return function (evt) {
                var percent = evt.offsetX / width;
                var index = Math.max(0, Math.min(col.dataLength - 1, Math.floor(percent * (col.dataLength - 1) + 0.5)));
                n.title = "".concat(prefix || '').concat(labels[index], ": ").concat(values[index]);
            }; },
        };
    };
    HeatmapCellRenderer.prototype.create = function (col, context, _hist, imposer) {
        var _a = this.createContext(col, context, imposer), template = _a.template, render = _a.render, mover = _a.mover, width = _a.width;
        return {
            template: template,
            update: function (n, d) {
                var ctx = n.getContext('2d');
                ctx.canvas.width = width;
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                if (renderMissingDOM(n, col, d)) {
                    return;
                }
                n.onmousemove = mover(n, col.getLabels(d));
                n.onmouseleave = function () { return (n.title = ''); };
                render(ctx, col.getNumbers(d), d, GUESSED_ROW_HEIGHT);
            },
            render: function (ctx, d) {
                render(ctx, col.getNumbers(d), d, CANVAS_HEIGHT);
            },
        };
    };
    HeatmapCellRenderer.prototype.createGroup = function (col, context, imposer) {
        var _this = this;
        var _a = this.createContext(col, context, imposer), template = _a.template, render = _a.render, mover = _a.mover, width = _a.width;
        var formatter = col.getNumberFormat();
        return {
            template: template,
            update: function (n, group) {
                return context.tasks
                    .groupRows(col, group, _this.title, function (rows) { return ANumbersCellRenderer.choose(col, rows); })
                    .then(function (data) {
                    if (typeof data === 'symbol') {
                        return;
                    }
                    var ctx = n.getContext('2d');
                    ctx.canvas.width = width;
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    var isMissing = !data || data.normalized.length === 0 || data.normalized.every(function (v) { return Number.isNaN(v); });
                    n.classList.toggle(cssClass('missing'), isMissing);
                    if (isMissing) {
                        return;
                    }
                    n.onmousemove = mover(n, data.raw.map(formatter), "".concat(getSortLabel(col.getSortMethod()), " "));
                    n.onmouseleave = function () { return (n.title = ''); };
                    render(ctx, data.normalized, data.row, GUESSED_ROW_HEIGHT);
                });
            },
        };
    };
    HeatmapCellRenderer.prototype.createSummary = function (col, context) {
        var labels = col.labels.slice();
        while (labels.length > 0 && !wideEnough(col, labels.length)) {
            labels = labels.filter(function (_, i) { return i % 2 === 0; }); // even
        }
        var templateRows = "<div class=\"".concat(cssClass('heatmap'), "\">");
        for (var _i = 0, labels_1 = labels; _i < labels_1.length; _i++) {
            var label = labels_1[_i];
            templateRows += "<div class=\"".concat(cssClass('heatmap-cell'), "\"  title=\"").concat(context.sanitize(label), "\" data-title=\"").concat(context.sanitize(label), "\"></div>");
        }
        templateRows += '</div>';
        return {
            template: templateRows,
            update: noop,
        };
    };
    return HeatmapCellRenderer;
}());
export default HeatmapCellRenderer;
//# sourceMappingURL=HeatmapCellRenderer.js.map