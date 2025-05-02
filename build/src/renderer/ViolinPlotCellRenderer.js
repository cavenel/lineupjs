import { scaleLinear } from 'd3-scale';
import { GUESSES_GROUP_HEIGHT } from '../constants';
import { extent } from '../internal';
import { Column, isMapAbleColumn, isNumberColumn, NumberColumn, } from '../model';
import { tasksAll } from '../provider';
import { cssClass } from '../styles';
import { computeLabel } from './BoxplotCellRenderer';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { adaptColor, BIG_MARK_LIGHTNESS_FACTOR, noRenderer, SMALL_MARK_LIGHTNESS_FACTOR } from './utils';
var ViolinPlotCellRenderer = /** @class */ (function () {
    function ViolinPlotCellRenderer() {
        this.title = 'Violin Plot';
    }
    ViolinPlotCellRenderer.prototype.canRender = function (col, mode) {
        return isNumberColumn(col) && mode !== ERenderMode.CELL;
    };
    ViolinPlotCellRenderer.prototype.create = function () {
        return noRenderer;
    };
    ViolinPlotCellRenderer.prototype.createGroup = function (col, context, imposer) {
        var sort = col instanceof NumberColumn && col.isGroupSortedByMe().asc !== undefined ? col.getSortMethod() : '';
        return {
            template: createViolinTemplate(col.getWidth(), false),
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
                    var color = adaptColor(colorOf(col, null, imposer), SMALL_MARK_LIGHTNESS_FACTOR);
                    var fillColor = adaptColor(colorOf(col, null, imposer), BIG_MARK_LIGHTNESS_FACTOR);
                    renderViolin(col, n, data[0].group, data[1].group, sort, color, fillColor);
                });
            },
        };
    };
    ViolinPlotCellRenderer.prototype.createSummary = function (col, context, _interactive, imposer) {
        return {
            template: createViolinTemplate(col.getWidth(), isMapAbleColumn(col)),
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
                    var color = adaptColor(colorOf(col, null, imposer), SMALL_MARK_LIGHTNESS_FACTOR);
                    var fillColor = adaptColor(colorOf(col, null, imposer), BIG_MARK_LIGHTNESS_FACTOR);
                    renderViolin(col, n, mappedSummary, rawSummary, sort, color, fillColor);
                });
            },
        };
    };
    return ViolinPlotCellRenderer;
}());
export default ViolinPlotCellRenderer;
function createViolinTemplate(width, isMapped) {
    var mappedHelper = isMapped
        ? "<span class=\"".concat(cssClass('mapping-hint'), "\"></span><span class=\"").concat(cssClass('mapping-hint'), "\"></span>")
        : '';
    var h = GUESSES_GROUP_HEIGHT;
    return "<div title=\"\">\n      <svg class=\"".concat(cssClass('violin'), "\"\n           viewBox=\"0 0 ").concat(width, " ").concat(h, "\" preserveAspectRatio=\"none meet\">\n        <path class=\"").concat(cssClass('violin-path'), "\" d=\"M0,0 L100,0\"></path>\n        <line x1=\"0\" x2=\"0\" y1=\"").concat(h / 2, "\" y2=\"").concat(h / 2, "\" class=\"").concat(cssClass('violin-iqr'), "\"></line>\n        <line x1=\"0\" x2=\"0\" y1=\"").concat(h / 2 - h * 0.25, "\" y2=\"").concat(h / 2 + h * 0.25, "\" class=\"").concat(cssClass('violin-mean'), "\"></line>\n        <line x1=\"0\" x2=\"0\" y1=\"").concat(h / 2 - h * 0.25, "\" y2=\"").concat(h / 2 + h * 0.25, "\" class=\"").concat(cssClass('violin-median'), "\"></line>\n      </svg>\n      ").concat(mappedHelper, "\n    </div>");
}
function computePath(xScale, data) {
    var halfH = GUESSES_GROUP_HEIGHT / 2;
    var yScale = scaleLinear([0, halfH - 1]).domain(extent(data.kdePoints, function (d) { return d.p; }));
    var pathF = [];
    var pathB = [];
    for (var _i = 0, _a = data.kdePoints; _i < _a.length; _i++) {
        var point = _a[_i];
        var x = xScale(point.v);
        var y = yScale(point.p);
        pathF.push("".concat(pathF.length === 0 ? 'M' : 'L').concat(x, ",").concat(halfH - y));
        pathB.push("L".concat(x, ",").concat(halfH + y));
    }
    pathB.reverse();
    return pathF.join(' ') + pathB.join(' ') + ' Z';
}
function renderViolin(col, n, data, label, _sort, color, fillColor) {
    n.title = computeLabel(col, label);
    var svg = n.firstElementChild;
    svg.style.color = color;
    var path = svg.firstElementChild;
    path.style.fill = fillColor;
    var xScale = scaleLinear([0, col.getWidth()]).domain([0, 1]);
    path.setAttribute('d', computePath(xScale, data));
    var iqrLine = svg.children[1];
    var medianLine = svg.children[2];
    var meanLine = svg.children[3];
    medianLine.setAttribute('x1', xScale(data.median).toString());
    medianLine.setAttribute('x2', xScale(data.median).toString());
    meanLine.setAttribute('x1', xScale(data.mean).toString());
    meanLine.setAttribute('x2', xScale(data.mean).toString());
    iqrLine.setAttribute('x1', xScale(data.q1).toString());
    iqrLine.setAttribute('x2', xScale(data.q3).toString());
}
//# sourceMappingURL=ViolinPlotCellRenderer.js.map