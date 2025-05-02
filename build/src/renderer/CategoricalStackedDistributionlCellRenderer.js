import { round } from '../internal';
import { CategoricalColumn, Column, OrdinalColumn, isCategoricalColumn, DEFAULT_COLOR, } from '../model';
import { filterMissingNumberMarkup } from '../ui/missing';
import { interactiveHist } from './CategoricalCellRenderer';
import { ERenderMode, } from './interfaces';
import { noRenderer, adaptTextColorToBgColor } from './utils';
import { cssClass, FILTERED_OPACITY } from '../styles';
import { color } from 'd3-color';
var CategoricalStackedDistributionlCellRenderer = /** @class */ (function () {
    function CategoricalStackedDistributionlCellRenderer() {
        this.title = 'Distribution Bar';
    }
    CategoricalStackedDistributionlCellRenderer.prototype.canRender = function (col, mode) {
        return isCategoricalColumn(col) && mode !== ERenderMode.CELL;
    };
    CategoricalStackedDistributionlCellRenderer.prototype.create = function () {
        return noRenderer;
    };
    CategoricalStackedDistributionlCellRenderer.prototype.createGroup = function (col, context) {
        var _a = stackedBar(col, context.sanitize), template = _a.template, update = _a.update;
        return {
            template: "".concat(template, "</div>"),
            update: function (n, group) {
                return context.tasks.groupCategoricalStats(col, group).then(function (r) {
                    if (typeof r === 'symbol') {
                        return;
                    }
                    var isMissing = !r || r.group == null || r.group.count === 0 || r.group.count === r.group.missing;
                    n.classList.toggle(cssClass('missing'), isMissing);
                    if (isMissing) {
                        return;
                    }
                    update(n, r.group);
                });
            },
        };
    };
    CategoricalStackedDistributionlCellRenderer.prototype.createSummary = function (col, context, interactive) {
        return col instanceof CategoricalColumn || col instanceof OrdinalColumn
            ? interactiveSummary(col, context, interactive)
            : staticSummary(col, context);
    };
    return CategoricalStackedDistributionlCellRenderer;
}());
export default CategoricalStackedDistributionlCellRenderer;
function staticSummary(col, context) {
    var _a = stackedBar(col, context.sanitize), template = _a.template, update = _a.update;
    return {
        template: "".concat(template, "</div>"),
        update: function (n) {
            return context.tasks.summaryCategoricalStats(col).then(function (r) {
                if (typeof r === 'symbol') {
                    return;
                }
                var isMissing = !r || r.summary == null || r.summary.count === 0 || r.summary.count === r.summary.missing;
                n.classList.toggle(cssClass('missing'), isMissing);
                if (isMissing) {
                    return;
                }
                update(n, r.summary, r.data);
            });
        },
    };
}
function interactiveSummary(col, context, interactive) {
    var _a = stackedBar(col, context.sanitize), template = _a.template, update = _a.update;
    var filterUpdate;
    return {
        template: "".concat(template).concat(interactive ? filterMissingNumberMarkup(false, 0) : '', "</div>"),
        update: function (n) {
            if (!filterUpdate) {
                filterUpdate = interactiveHist(col, n);
            }
            return context.tasks.summaryCategoricalStats(col).then(function (r) {
                if (typeof r === 'symbol') {
                    return;
                }
                var summary = r.summary, data = r.data;
                var missing = interactive && data ? data.missing : summary ? summary.missing : 0;
                filterUpdate(missing, col);
                var isMissing = !r || r.summary == null || r.summary.count === 0 || r.summary.count === r.summary.missing;
                n.classList.toggle(cssClass('missing'), isMissing);
                if (isMissing) {
                    return;
                }
                update(n, summary, data);
            });
        },
    };
}
function selectedCol(value) {
    var c = color(value);
    c.opacity = FILTERED_OPACITY;
    return c.toString();
}
function stackedBar(col, sanitize) {
    var s = sanitize;
    var mapping = col.getColorMapping();
    var cats = col.categories.map(function (c) { return ({
        label: c.label,
        name: c.name,
        color: mapping.apply(c),
        selected: selectedCol(mapping.apply(c)),
    }); });
    cats.push({ label: 'Missing Values', name: 'missing', color: DEFAULT_COLOR, selected: 'transparent' });
    var bins = cats
        .map(function (c) {
        return "<div class=\"".concat(cssClass('distribution-bar'), "\" style=\"background-color: ").concat(s(c.color), "; color: ").concat(adaptTextColorToBgColor(c.color), "\" title=\"").concat(s(c.label), ": 0\" data-cat=\"").concat(s(c.name), "\"><span>").concat(s(c.label), "</span></div>");
    })
        .join('');
    return {
        template: "<div>".concat(bins), // no closing div to be able to append things
        update: function (n, hist, gHist) {
            var bins = hist.hist.slice();
            bins.push({ count: hist.missing });
            var children = Array.from(n.children);
            if (!gHist) {
                var total_1 = bins.reduce(function (acc, _a) {
                    var count = _a.count;
                    return acc + count;
                }, 0);
                for (var i = 0; i < cats.length; ++i) {
                    var d = children[i];
                    var count = bins[i].count;
                    var label = cats[i].label;
                    d.style.flexGrow = "".concat(round(total_1 === 0 ? 0 : count, 2));
                    d.title = "".concat(label, ": ").concat(count);
                }
                return;
            }
            var gBins = gHist.hist.slice();
            gBins.push({ count: gHist.missing });
            var total = gBins.reduce(function (acc, _a) {
                var count = _a.count;
                return acc + count;
            }, 9);
            for (var i = 0; i < cats.length; ++i) {
                var d = children[i];
                var count = bins[i].count;
                var label = cats[i].label;
                var gCount = gBins[i].count;
                d.style.flexGrow = "".concat(round(total === 0 ? 0 : gCount, 2));
                d.title = "".concat(label, ": ").concat(count, " of ").concat(gCount);
                var relY = 100 - round((count * 100) / gCount, 2);
                d.style.background =
                    relY === 0
                        ? cats[i].color
                        : relY === 100
                            ? cats[i].selected
                            : "linear-gradient(".concat(cats[i].selected, " ").concat(relY, "%, ").concat(cats[i].color, " ").concat(relY, "%, ").concat(cats[i].color, " 100%)");
            }
        },
    };
}
//# sourceMappingURL=CategoricalStackedDistributionlCellRenderer.js.map