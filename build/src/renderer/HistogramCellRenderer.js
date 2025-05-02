import { numberStatsBuilder, getNumberOfBins } from '../internal';
import { Column, isNumberColumn, isNumbersColumn, isMapAbleColumn, Ranking, } from '../model';
import InputNumberDialog from '../ui/dialogs/InputNumberDialog';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { cssClass, engineCssClass } from '../styles';
import { histogramUpdate, histogramTemplate, mappingHintTemplate, mappingHintUpdate, filteredHistTemplate, initFilter, } from './histogram';
import { noNumberFilter } from '../model/internalNumber';
var HistogramCellRenderer = /** @class */ (function () {
    function HistogramCellRenderer() {
        this.title = 'Histogram';
    }
    HistogramCellRenderer.prototype.canRender = function (col, mode) {
        return (isNumberColumn(col) && mode !== ERenderMode.CELL) || (isNumbersColumn(col) && mode === ERenderMode.CELL);
    };
    HistogramCellRenderer.prototype.create = function (col, _context, imposer) {
        var _a = getHistDOMRenderer(col, imposer), template = _a.template, render = _a.render, guessedBins = _a.guessedBins;
        return {
            template: "".concat(template, "</div>"),
            update: function (n, row) {
                if (renderMissingDOM(n, col, row)) {
                    return;
                }
                var b = numberStatsBuilder([0, 1], guessedBins);
                for (var _i = 0, _a = col.getNumbers(row); _i < _a.length; _i++) {
                    var n_1 = _a[_i];
                    b.push(n_1);
                }
                var hist = b.build();
                render(n, hist);
            },
        };
    };
    HistogramCellRenderer.prototype.createGroup = function (col, context, imposer) {
        var _a = getHistDOMRenderer(col, imposer), template = _a.template, render = _a.render;
        return {
            template: "".concat(template, "</div>"),
            update: function (n, group) {
                return context.tasks.groupNumberStats(col, group).then(function (r) {
                    if (typeof r === 'symbol') {
                        return;
                    }
                    var isMissing = !r || r.group == null || r.group.count === 0 || r.group.count === r.group.missing;
                    n.classList.toggle(cssClass('missing'), isMissing);
                    if (isMissing) {
                        return;
                    }
                    var summary = r.summary, group = r.group;
                    render(n, group, summary);
                });
            },
        };
    };
    HistogramCellRenderer.prototype.createSummary = function (col, context, interactive, imposer) {
        var r = getHistDOMRenderer(col, imposer);
        var staticHist = !interactive || !isMapAbleColumn(col);
        return staticHist
            ? staticSummary(col, context, r.template, r.render)
            : interactiveSummary(col, context, r.template, r.render);
    };
    return HistogramCellRenderer;
}());
export default HistogramCellRenderer;
function staticSummary(col, context, template, render) {
    if (isMapAbleColumn(col)) {
        template += mappingHintTemplate(col.getRange());
    }
    return {
        template: "".concat(template, "</div>"),
        update: function (node) {
            if (isMapAbleColumn(col)) {
                mappingHintUpdate(node, col.getRange());
            }
            return context.tasks.summaryNumberStats(col).then(function (r) {
                if (typeof r === 'symbol') {
                    return;
                }
                var isMissing = !r || r.summary == null || r.summary.count === 0 || r.summary.count === r.summary.missing;
                node.classList.toggle(cssClass('missing'), isMissing);
                if (isMissing) {
                    return;
                }
                render(node, r.summary);
            });
        },
    };
}
function interactiveSummary(col, context, template, render) {
    var fContext = createFilterContext(col, context);
    template += filteredHistTemplate(fContext, createFilterInfo(col));
    var updateFilter;
    return {
        template: "".concat(template, "</div>"),
        update: function (node) {
            if (!updateFilter) {
                updateFilter = initFilter(node, fContext);
            }
            return context.tasks.summaryNumberStats(col, true /* raw */).then(function (r) {
                if (typeof r === 'symbol') {
                    return;
                }
                var summary = r.summary, data = r.data;
                updateFilter(data ? data.missing : summary ? summary.missing : 0, createFilterInfo(col));
                node.classList.add(cssClass('histogram-i'));
                node.classList.toggle(cssClass('missing'), !summary);
                if (!summary) {
                    return;
                }
                render(node, summary, data);
            });
        },
    };
}
/** @internal */
export function createNumberFilter(col, parent, context, livePreviews) {
    var renderer = getHistDOMRenderer(col);
    var fContext = createFilterContext(col, context);
    parent.innerHTML = "".concat(renderer.template).concat(filteredHistTemplate(fContext, createFilterInfo(col)), "</div>");
    var summaryNode = parent.firstElementChild;
    summaryNode.classList.add(cssClass('summary'), cssClass('renderer'));
    summaryNode.dataset.renderer = 'histogram';
    summaryNode.dataset.interactive = '';
    summaryNode.classList.add(cssClass('histogram-i'));
    var applyFilter = fContext.setFilter;
    var currentFilter = createFilterInfo(col);
    fContext.setFilter = function (filterMissing, min, max) {
        currentFilter = { filterMissing: filterMissing, filterMin: min, filterMax: max };
        if (livePreviews) {
            applyFilter(filterMissing, min, max);
        }
    };
    var updateFilter = initFilter(summaryNode, fContext);
    var rerender = function () {
        var ready = context.tasks.summaryNumberStats(col, true /* raw */).then(function (r) {
            if (typeof r === 'symbol') {
                return;
            }
            var summary = r.summary, data = r.data;
            updateFilter(data ? data.missing : summary ? summary.missing : 0, currentFilter);
            summaryNode.classList.toggle(cssClass('missing'), !summary);
            if (!summary) {
                return;
            }
            renderer.render(summaryNode, summary, data);
        });
        if (!ready) {
            return;
        }
        summaryNode.classList.add(engineCssClass('loading'));
        ready.then(function () {
            summaryNode.classList.remove(engineCssClass('loading'));
        });
    };
    var ranking = col.findMyRanker();
    if (ranking) {
        ranking.on("".concat(Ranking.EVENT_ORDER_CHANGED, ".numberFilter"), function () { return rerender(); });
    }
    rerender();
    return {
        cleanUp: function () {
            if (ranking) {
                ranking.on("".concat(Ranking.EVENT_ORDER_CHANGED, ".numberFilter"), null);
            }
        },
        reset: function () {
            currentFilter = createFilterInfo(col, noNumberFilter());
            rerender();
        },
        submit: function () {
            applyFilter(currentFilter.filterMissing, currentFilter.filterMin, currentFilter.filterMax);
        },
    };
}
/** @internal */
export function getHistDOMRenderer(col, imposer) {
    var ranking = col.findMyRanker();
    var guessedBins = ranking ? getNumberOfBins(ranking.getOrderLength()) : 10;
    var formatter = col.getNumberFormat();
    var render = function (n, stats, unfiltered) {
        return histogramUpdate(n, stats, unfiltered || null, formatter, function (bin) { return colorOf(col, null, imposer, (bin.x1 + bin.x0) / 2); });
    };
    return {
        template: histogramTemplate(guessedBins),
        render: render,
        guessedBins: guessedBins,
    };
}
function createFilterInfo(col, filter) {
    if (filter === void 0) { filter = col.getFilter(); }
    var domain = col.getMapping().domain;
    var filterMin = isFinite(filter.min) ? filter.min : domain[0];
    var filterMax = isFinite(filter.max) ? filter.max : domain[1];
    return {
        filterMissing: filter.filterMissing,
        filterMin: filterMin,
        filterMax: filterMax,
    };
}
function createFilterContext(col, context) {
    var domain = col.getMapping().domain;
    var format = col.getNumberFormat();
    var clamp = function (v) { return Math.max(0, Math.min(100, v)); };
    var percent = function (v) { return clamp(Math.round((100 * (v - domain[0])) / (domain[1] - domain[0]))); };
    var unpercent = function (v) { return (v / 100) * (domain[1] - domain[0]) + domain[0]; };
    return {
        percent: percent,
        unpercent: unpercent,
        domain: domain,
        format: format,
        formatRaw: String,
        parseRaw: Number.parseFloat,
        setFilter: function (filterMissing, minValue, maxValue) {
            return col.setFilter({
                filterMissing: filterMissing,
                min: minValue === domain[0] ? Number.NEGATIVE_INFINITY : minValue,
                max: maxValue === domain[1] ? Number.POSITIVE_INFINITY : maxValue,
            });
        },
        edit: function (value, attachment, type, otherValue) {
            return new Promise(function (resolve) {
                var dialogCtx = {
                    attachment: attachment,
                    manager: context.dialogManager,
                    level: context.dialogManager.maxLevel + 1,
                    idPrefix: context.idPrefix,
                    sanitize: context.sanitize,
                };
                var dialog = new InputNumberDialog(dialogCtx, resolve, {
                    value: value,
                    min: type === 'max' && !Number.isNaN(otherValue) ? Math.min(domain[0], otherValue) : domain[0],
                    max: type === 'min' && !Number.isNaN(otherValue) ? Math.max(domain[1], otherValue) : domain[1],
                });
                dialog.open();
            });
        },
    };
}
//# sourceMappingURL=HistogramCellRenderer.js.map