import { Column, CompositeNumberColumn } from '../model';
import { CANVAS_HEIGHT, cssClass } from '../styles';
import { getHistDOMRenderer } from './HistogramCellRenderer';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
import { createData } from './MultiLevelCellRenderer';
import { colorOf, matchColumns, forEachChild } from './utils';
import { tasksAll } from '../provider';
var InterleavingCellRenderer = /** @class */ (function () {
    function InterleavingCellRenderer() {
        this.title = 'Interleaved';
    }
    InterleavingCellRenderer.prototype.canRender = function (col) {
        return col instanceof CompositeNumberColumn;
    };
    InterleavingCellRenderer.prototype.create = function (col, context) {
        var cols = createData(col, context, false, ERenderMode.CELL).cols;
        var width = context.colWidth(col);
        return {
            template: "<div>".concat(cols.map(function (r) { return r.template; }).join(''), "</div>"),
            update: function (n, d, i, group) {
                var missing = renderMissingDOM(n, col, d);
                if (missing) {
                    return;
                }
                matchColumns(n, cols, context);
                forEachChild(n, function (ni, j) {
                    cols[j].renderer.update(ni, d, i, group);
                });
            },
            render: function (ctx, d, _i, group) {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                ctx.save();
                ctx.scale(1, 1 / cols.length); // scale since internal use the height, too
                cols.forEach(function (r, i) {
                    var rr = r.renderer;
                    if (rr.render) {
                        rr.render(ctx, d, i, group);
                    }
                    ctx.translate(0, CANVAS_HEIGHT);
                });
                ctx.restore();
            },
        };
    };
    InterleavingCellRenderer.prototype.createGroup = function (col, context) {
        var cols = createData(col, context, false, ERenderMode.GROUP).cols;
        return {
            template: "<div>".concat(cols.map(function (r) { return r.template; }).join(''), "</div>"),
            update: function (n, group) {
                matchColumns(n, cols, context);
                forEachChild(n, function (ni, j) {
                    cols[j].groupRenderer.update(ni, group);
                });
            },
        };
    };
    InterleavingCellRenderer.prototype.createSummary = function (col, context, _interactive) {
        var cols = col.children;
        var acc = 0;
        var _a = getHistDOMRenderer(col, {
            color: function () { return colorOf(cols[acc++ % cols.length]); },
        }), template = _a.template, render = _a.render;
        return {
            template: template,
            update: function (n) {
                var tasks = cols.map(function (col) { return context.tasks.summaryNumberStats(col); });
                return tasksAll(tasks).then(function (vs) {
                    if (typeof vs === 'symbol') {
                        return;
                    }
                    var summaries = vs.map(function (d) { return d.summary; });
                    if (!summaries.some(Boolean)) {
                        n.classList.add(cssClass('missing'));
                        return;
                    }
                    n.classList.remove(cssClass('missing'));
                    var grouped = groupedHist(summaries);
                    render(n, grouped);
                });
            },
        };
    };
    return InterleavingCellRenderer;
}());
export default InterleavingCellRenderer;
var dummyBin = {
    count: 0,
    x0: 0,
    x1: 0,
};
function groupedHist(stats) {
    var sample = stats.find(Boolean);
    if (!sample) {
        return null;
    }
    var bins = sample.hist.length;
    // assert all have the same bin size
    var hist = [];
    var maxBin = 0;
    for (var i = 0; i < bins; ++i) {
        for (var _a = 0, stats_1 = stats; _a < stats_1.length; _a++) {
            var s = stats_1[_a];
            var bin = s ? s.hist[i] : null;
            if (!bin) {
                hist.push(dummyBin);
                continue;
            }
            if (bin.count > maxBin) {
                maxBin = bin.count;
            }
            hist.push(bin);
        }
    }
    return {
        maxBin: maxBin,
        hist: hist,
    };
}
//# sourceMappingURL=InterleavingCellRenderer.js.map