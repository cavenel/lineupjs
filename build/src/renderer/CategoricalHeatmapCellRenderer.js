import { Column, isCategoricalsColumn, } from '../model';
import { toMostFrequentCategoricals } from '../model/internalCategorical';
import { CANVAS_HEIGHT, cssClass } from '../styles';
import { renderMissingDOM, renderMissingValue } from './missing';
import { noop, wideEnough } from './utils';
import { GUESSED_ROW_HEIGHT } from '../constants';
var CategoricalHeatmapCellRenderer = /** @class */ (function () {
    function CategoricalHeatmapCellRenderer() {
        this.title = 'Heatmap';
    }
    CategoricalHeatmapCellRenderer.prototype.canRender = function (col) {
        return isCategoricalsColumn(col) && Boolean(col.dataLength);
    };
    CategoricalHeatmapCellRenderer.prototype.createContext = function (col, context) {
        var width = context.colWidth(col);
        var cellDimension = width / col.dataLength;
        var labels = col.labels;
        var render = function (ctx, data, height) {
            data.forEach(function (d, j) {
                var x = j * cellDimension;
                if (d == null) {
                    renderMissingValue(ctx, cellDimension, height, x, 0);
                    return;
                }
                ctx.fillStyle = d.color;
                ctx.fillRect(x, 0, cellDimension, height);
            });
        };
        return {
            template: "<canvas height=\"".concat(GUESSED_ROW_HEIGHT, "\" title=\"\"></canvas>"),
            render: render,
            width: width,
            mover: function (n, values) { return function (evt) {
                var percent = evt.offsetX / width;
                var index = Math.max(0, Math.min(col.dataLength - 1, Math.floor(percent * (col.dataLength - 1) + 0.5)));
                n.title = "".concat(labels[index], ": ").concat(values[index]);
            }; },
        };
    };
    CategoricalHeatmapCellRenderer.prototype.create = function (col, context) {
        var _a = this.createContext(col, context), template = _a.template, render = _a.render, mover = _a.mover, width = _a.width;
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
                render(ctx, col.getCategories(d), GUESSED_ROW_HEIGHT);
            },
            render: function (ctx, d) {
                render(ctx, col.getCategories(d), CANVAS_HEIGHT);
            },
        };
    };
    CategoricalHeatmapCellRenderer.prototype.createGroup = function (col, context) {
        var _this = this;
        var _a = this.createContext(col, context), template = _a.template, render = _a.render, mover = _a.mover, width = _a.width;
        return {
            template: template,
            update: function (n, group) {
                return context.tasks
                    .groupRows(col, group, _this.title, function (rows) { return toMostFrequentCategoricals(rows, col); })
                    .then(function (data) {
                    if (typeof data === 'symbol') {
                        return;
                    }
                    var ctx = n.getContext('2d');
                    ctx.canvas.width = width;
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    var isMissing = !data || data.length === 0 || data.every(function (d) { return d == null; });
                    n.classList.toggle(cssClass('missing'), isMissing);
                    if (isMissing) {
                        return;
                    }
                    n.onmousemove = mover(n, data.map(function (d) { return (d ? d.label : 'missing'); }));
                    n.onmouseleave = function () { return (n.title = ''); };
                    render(ctx, data, GUESSED_ROW_HEIGHT);
                });
            },
        };
    };
    CategoricalHeatmapCellRenderer.prototype.createSummary = function (col, context) {
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
    return CategoricalHeatmapCellRenderer;
}());
export default CategoricalHeatmapCellRenderer;
//# sourceMappingURL=CategoricalHeatmapCellRenderer.js.map