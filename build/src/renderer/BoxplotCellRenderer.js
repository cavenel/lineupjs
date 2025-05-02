import { round } from '../internal';
import { NumberColumn, isBoxPlotColumn, Column, isNumberColumn, isMapAbleColumn, } from '../model';
import { BOX_PLOT, CANVAS_HEIGHT, DOT, cssClass } from '../styles';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas } from './missing';
import { tasksAll } from '../provider';
import { adaptColor, BIG_MARK_LIGHTNESS_FACTOR, SMALL_MARK_LIGHTNESS_FACTOR } from './utils';
var BOXPLOT = "<div title=\"\">\n  <div class=\"".concat(cssClass('boxplot-whisker'), "\">\n    <div class=\"").concat(cssClass('boxplot-box'), "\"></div>\n    <div class=\"").concat(cssClass('boxplot-median'), "\"></div>\n    <div class=\"").concat(cssClass('boxplot-mean'), "\"></div>\n  </div>\n</div>");
var MAPPED_BOXPLOT = "<div title=\"\">\n  <div class=\"".concat(cssClass('boxplot-whisker'), "\">\n    <div class=\"").concat(cssClass('boxplot-box'), "\"></div>\n    <div class=\"").concat(cssClass('boxplot-median'), "\"></div>\n    <div class=\"").concat(cssClass('boxplot-mean'), "\"></div>\n  </div>\n  <span class=\"").concat(cssClass('mapping-hint'), "\"></span><span class=\"").concat(cssClass('mapping-hint'), "\"></span>\n</div>");
/** @internal */
export function computeLabel(col, v) {
    if (v == null) {
        return '';
    }
    var f = col.getNumberFormat();
    var mean = v.mean != null ? "mean = ".concat(f(v.mean), " (dashed line)\n") : '';
    return "min = ".concat(f(v.min), "\nq1 = ").concat(f(v.q1), "\nmedian = ").concat(f(v.median), "\n").concat(mean, "q3 = ").concat(f(v.q3), "\nmax = ").concat(f(v.max));
}
var BoxplotCellRenderer = /** @class */ (function () {
    function BoxplotCellRenderer() {
        this.title = 'Box Plot';
    }
    BoxplotCellRenderer.prototype.canRender = function (col, mode) {
        return (isBoxPlotColumn(col) && mode === ERenderMode.CELL) || (isNumberColumn(col) && mode !== ERenderMode.CELL);
    };
    BoxplotCellRenderer.prototype.create = function (col, context, imposer) {
        var sortMethod = col.getSortMethod();
        var sortedByMe = col.isSortedByMe().asc !== undefined;
        var width = context.colWidth(col);
        return {
            template: BOXPLOT,
            update: function (n, d) {
                var data = col.getBoxPlotData(d);
                n.classList.toggle(cssClass('missing'), !data);
                if (!data) {
                    return;
                }
                var label = col.getRawBoxPlotData(d);
                renderDOMBoxPlot(col, n, data, label, sortedByMe ? sortMethod : '', colorOf(col, d, imposer));
            },
            render: function (ctx, d) {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                // Rectangle
                var data = col.getBoxPlotData(d);
                if (!data) {
                    return;
                }
                var scaled = {
                    min: data.min * width,
                    median: data.median * width,
                    mean: data.mean != null ? data.mean * width : undefined,
                    q1: data.q1 * width,
                    q3: data.q3 * width,
                    max: data.max * width,
                    outlier: data.outlier ? data.outlier.map(function (d) { return d * width; }) : undefined,
                    whiskerLow: data.whiskerLow != null ? data.whiskerLow * width : undefined,
                    whiskerHigh: data.whiskerHigh != null ? data.whiskerHigh * width : undefined,
                };
                renderBoxPlot(ctx, scaled, sortedByMe ? sortMethod : '', colorOf(col, d, imposer), CANVAS_HEIGHT, 0);
            },
        };
    };
    BoxplotCellRenderer.prototype.createGroup = function (col, context, imposer) {
        var sort = col instanceof NumberColumn && col.isGroupSortedByMe().asc !== undefined ? col.getSortMethod() : '';
        return {
            template: BOXPLOT,
            update: function (n, group) {
                return tasksAll([
                    context.tasks.groupBoxPlotStats(col, group, false),
                    context.tasks.groupBoxPlotStats(col, group, true),
                ]).then(function (data) {
                    if (typeof data === 'symbol') {
                        return;
                    }
                    // render
                    var isMissing = data == null ||
                        data[0] == null ||
                        data[0].group.count === 0 ||
                        data[0].group.count === data[0].group.missing;
                    n.classList.toggle(cssClass('missing'), isMissing);
                    if (isMissing) {
                        return;
                    }
                    renderDOMBoxPlot(col, n, data[0].group, data[1].group, sort, colorOf(col, null, imposer));
                });
            },
        };
    };
    BoxplotCellRenderer.prototype.createSummary = function (col, context, _interactive, imposer) {
        return {
            template: isMapAbleColumn(col) ? MAPPED_BOXPLOT : BOXPLOT,
            update: function (n) {
                return tasksAll([
                    context.tasks.summaryBoxPlotStats(col, false),
                    context.tasks.summaryBoxPlotStats(col, true),
                ]).then(function (data) {
                    if (typeof data === 'symbol') {
                        return;
                    }
                    var isMissing = data == null ||
                        data[0] == null ||
                        data[0].summary.count === 0 ||
                        data[0].summary.count === data[0].summary.missing;
                    n.classList.toggle(cssClass('missing'), isMissing);
                    if (isMissing) {
                        return;
                    }
                    var mappedSummary = data[0].summary;
                    var rawSummary = data[1].summary;
                    var sort = col instanceof NumberColumn && col.isGroupSortedByMe().asc !== undefined ? col.getSortMethod() : '';
                    if (isMapAbleColumn(col)) {
                        var range_1 = col.getRange();
                        Array.from(n.getElementsByTagName('span')).forEach(function (d, i) { return (d.textContent = range_1[i]); });
                    }
                    renderDOMBoxPlot(col, n, mappedSummary, rawSummary, sort, colorOf(col, null, imposer), isMapAbleColumn(col));
                });
            },
        };
    };
    return BoxplotCellRenderer;
}());
export default BoxplotCellRenderer;
function renderDOMBoxPlot(col, n, data, label, sort, color, hasRange) {
    if (hasRange === void 0) { hasRange = false; }
    n.title = computeLabel(col, label);
    var whiskers = n.firstElementChild;
    var box = whiskers.firstElementChild;
    var median = box.nextElementSibling;
    var mean = whiskers.lastElementChild;
    var leftWhisker = data.whiskerLow != null ? data.whiskerLow : Math.max(data.q1 - 1.5 * (data.q3 - data.q1), data.min);
    var rightWhisker = data.whiskerHigh != null ? data.whiskerHigh : Math.min(data.q3 + 1.5 * (data.q3 - data.q1), data.max);
    whiskers.style.left = "".concat(round(leftWhisker * 100, 2), "%");
    var range = rightWhisker - leftWhisker;
    whiskers.style.width = "".concat(round(range * 100, 2), "%");
    //relative within the whiskers
    box.style.left = "".concat(round(((data.q1 - leftWhisker) / range) * 100, 2), "%");
    box.style.width = "".concat(round(((data.q3 - data.q1) / range) * 100, 2), "%");
    box.style.backgroundColor = adaptColor(color, BIG_MARK_LIGHTNESS_FACTOR);
    //relative within the whiskers
    median.style.left = "".concat(round(((data.median - leftWhisker) / range) * 100, 2), "%");
    if (data.mean != null) {
        mean.style.left = "".concat(round(((data.mean - leftWhisker) / range) * 100, 2), "%");
        mean.style.display = null;
    }
    else {
        mean.style.display = 'none';
    }
    // match lengths
    var outliers = Array.from(n.children).slice(1, hasRange ? -2 : undefined);
    var numOutliers = data.outlier ? data.outlier.length : 0;
    outliers.splice(numOutliers, outliers.length - numOutliers).forEach(function (v) { return v.remove(); });
    whiskers.dataset.sort = sort;
    if (!data.outlier || numOutliers === 0) {
        return;
    }
    for (var i = outliers.length; i < numOutliers; ++i) {
        var p = n.ownerDocument.createElement('div');
        p.classList.add(cssClass('boxplot-outlier'));
        outliers.unshift(p);
        whiskers.insertAdjacentElement('afterend', p);
    }
    data.outlier.forEach(function (v, i) {
        delete outliers[i].dataset.sort;
        outliers[i].style.left = "".concat(round(v * 100, 2), "%");
    });
    if (sort === 'min' && data.outlier[0] <= leftWhisker) {
        // first outliers is the min
        whiskers.dataset.sort = '';
        outliers[0].dataset.sort = 'min';
        if (outliers.length > 1) {
            // append at the end of the DOM to be on top
            outliers[outliers.length - 1].insertAdjacentElement('afterend', outliers[0]);
        }
    }
    else if (sort === 'max' && data.outlier[outliers.length - 1] >= rightWhisker) {
        // last outlier is the max
        whiskers.dataset.sort = '';
        outliers[outliers.length - 1].dataset.sort = 'max';
    }
}
function renderBoxPlot(ctx, box, sort, color, height, topPadding) {
    var left = box.whiskerLow != null ? box.whiskerLow : Math.max(box.q1 - 1.5 * (box.q3 - box.q1), box.min);
    var right = box.whiskerHigh != null ? box.whiskerHigh : Math.min(box.q3 + 1.5 * (box.q3 - box.q1), box.max);
    ctx.fillStyle = adaptColor(color || BOX_PLOT.box, BIG_MARK_LIGHTNESS_FACTOR);
    ctx.strokeStyle = adaptColor(BOX_PLOT.stroke, SMALL_MARK_LIGHTNESS_FACTOR);
    ctx.beginPath();
    ctx.rect(box.q1, 0, box.q3 - box.q1, height);
    ctx.fill();
    ctx.stroke();
    //Line
    var bottomPos = height - topPadding;
    var middlePos = height / 2;
    ctx.beginPath();
    ctx.moveTo(left, middlePos);
    ctx.lineTo(box.q1, middlePos);
    ctx.moveTo(left, topPadding);
    ctx.lineTo(left, bottomPos);
    ctx.moveTo(box.median, 0);
    ctx.lineTo(box.median, height);
    ctx.moveTo(box.q3, middlePos);
    ctx.lineTo(right, middlePos);
    ctx.moveTo(right, topPadding);
    ctx.lineTo(right, bottomPos);
    ctx.stroke();
    ctx.fill();
    if (sort !== '') {
        ctx.strokeStyle = BOX_PLOT.sort;
        ctx.beginPath();
        ctx.moveTo(box[sort], topPadding);
        ctx.lineTo(box[sort], height - topPadding);
        ctx.stroke();
        ctx.fill();
    }
    if (!box.outlier) {
        return;
    }
    ctx.fillStyle = BOX_PLOT.outlier;
    box.outlier.forEach(function (v) {
        // currently dots with 3px
        ctx.fillRect(Math.max(v - DOT.size / 2, 0), middlePos - DOT.size / 2, DOT.size, DOT.size);
    });
}
//# sourceMappingURL=BoxplotCellRenderer.js.map