import { dateStatsBuilder } from '../internal';
import { Column, isDateColumn, isDatesColumn, Ranking, } from '../model';
import { cssClass, engineCssClass } from '../styles';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { colorOf } from './utils';
import { histogramUpdate, histogramTemplate, mappingHintTemplate, mappingHintUpdate, filteredHistTemplate, initFilter, } from './histogram';
import InputDateDialog from '../ui/dialogs/InputDateDialog';
import { shiftFilterDateDay, noDateFilter } from '../model/internalDate';
var DateHistogramCellRenderer = /** @class */ (function () {
    function DateHistogramCellRenderer() {
        this.title = 'Histogram';
    }
    DateHistogramCellRenderer.prototype.canRender = function (col, mode) {
        return (isDateColumn(col) && mode !== ERenderMode.CELL) || (isDatesColumn(col) && mode === ERenderMode.CELL);
    };
    DateHistogramCellRenderer.prototype.create = function (col, _context) {
        var _a = getHistDOMRenderer(col), template = _a.template, render = _a.render;
        return {
            template: "".concat(template, "</div>"),
            update: function (n, row) {
                if (renderMissingDOM(n, col, row)) {
                    return;
                }
                var b = dateStatsBuilder();
                for (var _i = 0, _a = col.getDates(row); _i < _a.length; _i++) {
                    var n_1 = _a[_i];
                    b.push(n_1);
                }
                var hist = b.build();
                render(n, hist);
            },
        };
    };
    DateHistogramCellRenderer.prototype.createGroup = function (col, context) {
        var _a = getHistDOMRenderer(col), template = _a.template, render = _a.render;
        return {
            template: "".concat(template, "</div>"),
            update: function (n, group) {
                return context.tasks.groupDateStats(col, group).then(function (r) {
                    if (typeof r === 'symbol') {
                        return;
                    }
                    var isMissing = !r || r.group == null || r.group.count === 0 || r.group.count === r.group.missing;
                    n.classList.toggle(cssClass('missing'), isMissing);
                    if (isMissing) {
                        return;
                    }
                    render(n, r.group);
                });
            },
        };
    };
    DateHistogramCellRenderer.prototype.createSummary = function (col, context, interactive) {
        var r = getHistDOMRenderer(col);
        return interactive
            ? interactiveSummary(col, context, r.template, r.render)
            : staticSummary(col, context, false, r.template, r.render);
    };
    return DateHistogramCellRenderer;
}());
export default DateHistogramCellRenderer;
function staticSummary(col, context, interactive, template, render) {
    template += mappingHintTemplate(['', '']);
    return {
        template: "".concat(template, "</div>"),
        update: function (node) {
            return context.tasks.summaryDateStats(col).then(function (r) {
                if (typeof r === 'symbol') {
                    return;
                }
                var summary = r.summary, data = r.data;
                node.classList.toggle(cssClass('missing'), !summary);
                if (!summary) {
                    return;
                }
                var formatter = col.getFormatter();
                mappingHintUpdate(node, [formatter(summary.min), formatter(summary.max)]);
                render(node, summary, interactive ? data : undefined);
            });
        },
    };
}
function interactiveSummary(col, context, template, render) {
    var filter = col.getFilter();
    var dummyDomain = [
        isFinite(filter.min) ? filter.min : 0,
        isFinite(filter.max) ? filter.max : 100,
    ];
    template += filteredHistTemplate(createFilterContext(col, context, dummyDomain), createFilterInfo(col, dummyDomain));
    var fContext;
    var updateFilter;
    return {
        template: "".concat(template, "</div>"),
        update: function (node) {
            return context.tasks.summaryDateStats(col).then(function (r) {
                if (typeof r === 'symbol') {
                    return;
                }
                var summary = r.summary, data = r.data;
                if (!updateFilter) {
                    var domain = [
                        data.min ? data.min.getTime() : Date.now(),
                        data.max ? data.max.getTime() : Date.now(),
                    ];
                    fContext = createFilterContext(col, context, domain);
                    updateFilter = initFilter(node, fContext);
                }
                updateFilter(data ? data.missing : summary ? summary.missing : 0, createFilterInfo(col, fContext.domain));
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
export function createDateFilter(col, parent, context, livePreviews) {
    var renderer = getHistDOMRenderer(col);
    var filter = col.getFilter();
    var domain = [isFinite(filter.min) ? filter.min : 0, isFinite(filter.max) ? filter.max : 100];
    var fContext = createFilterContext(col, context, domain);
    var applyFilter = fContext.setFilter;
    var currentFilter = createFilterInfo(col, domain);
    fContext.setFilter = function (filterMissing, min, max) {
        currentFilter = { filterMissing: filterMissing, filterMin: min, filterMax: max };
        if (livePreviews) {
            applyFilter(filterMissing, min, max);
        }
    };
    parent.innerHTML = "".concat(renderer.template).concat(filteredHistTemplate(fContext, createFilterInfo(col, domain)), "</div>");
    var summaryNode = parent.firstElementChild;
    summaryNode.classList.add(cssClass('summary'), cssClass('renderer'));
    summaryNode.dataset.renderer = 'histogram';
    summaryNode.dataset.interactive = '';
    summaryNode.classList.add(cssClass('histogram-i'));
    var updateFilter = null;
    var prepareRender = function (min, max) {
        // reinit with proper domain
        domain = [min ? min.getTime() : Date.now(), max ? max.getTime() : Date.now()];
        fContext = createFilterContext(col, context, domain);
        applyFilter = fContext.setFilter;
        currentFilter = createFilterInfo(col, domain);
        fContext.setFilter = function (filterMissing, min, max) {
            currentFilter = { filterMissing: filterMissing, filterMin: min, filterMax: max };
            if (livePreviews) {
                applyFilter(filterMissing, min, max);
            }
        };
        return initFilter(summaryNode, fContext);
    };
    var rerender = function () {
        var ready = context.tasks.summaryDateStats(col).then(function (r) {
            if (typeof r === 'symbol') {
                return;
            }
            var summary = r.summary, data = r.data;
            if (!updateFilter) {
                updateFilter = prepareRender(data.min, data.max);
            }
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
            currentFilter = createFilterInfo(col, domain, noDateFilter());
            rerender();
        },
        submit: function () {
            applyFilter(currentFilter.filterMissing, currentFilter.filterMin, currentFilter.filterMax);
        },
    };
}
function getHistDOMRenderer(col) {
    var guessedBins = 10;
    var formatter = col.getFormatter();
    var color = colorOf(col);
    var render = function (n, stats, unfiltered) {
        return histogramUpdate(n, stats, unfiltered || null, formatter, function () { return color; });
    };
    return {
        template: histogramTemplate(guessedBins),
        render: render,
        guessedBins: guessedBins,
    };
}
function createFilterInfo(col, domain, filter) {
    if (filter === void 0) { filter = col.getFilter(); }
    var filterMin = isFinite(filter.min) ? filter.min : domain[0];
    var filterMax = isFinite(filter.max) ? filter.max : domain[1];
    return {
        filterMissing: filter.filterMissing,
        filterMin: filterMin,
        filterMax: filterMax,
    };
}
function createFilterContext(col, context, domain) {
    var clamp = function (v) { return Math.max(0, Math.min(100, v)); };
    var percent = function (v) { return clamp(Math.round((100 * (v - domain[0])) / (domain[1] - domain[0]))); };
    var unpercent = function (v) { return (v / 100) * (domain[1] - domain[0]) + domain[0]; };
    return {
        percent: percent,
        unpercent: unpercent,
        domain: domain,
        format: function (v) { return (Number.isNaN(v) ? '' : col.getFormatter()(new Date(v))); },
        formatRaw: String,
        parseRaw: function (v) { return Number.parseInt(v, 10); },
        setFilter: function (filterMissing, minValue, maxValue) {
            return col.setFilter({
                filterMissing: filterMissing,
                min: Math.abs(minValue - domain[0]) < 0.001 ? Number.NEGATIVE_INFINITY : shiftFilterDateDay(minValue, 'min'),
                max: Math.abs(maxValue - domain[1]) < 0.001 ? Number.POSITIVE_INFINITY : shiftFilterDateDay(maxValue, 'max'),
            });
        },
        edit: function (value, attachment, type, otherValue) {
            return new Promise(function (resolve) {
                var _a;
                var dialogCtx = {
                    attachment: attachment,
                    manager: context.dialogManager,
                    level: context.dialogManager.maxLevel + 1,
                    idPrefix: context.idPrefix,
                    sanitize: context.sanitize,
                };
                var dialog = new InputDateDialog(dialogCtx, function (d) { return resolve(d == null ? NaN : shiftFilterDateDay(d.getTime(), type)); }, (_a = {
                        value: Number.isNaN(value) ? null : new Date(value)
                    },
                    _a[type === 'min' ? 'max' : 'min'] = Number.isNaN(otherValue) ? null : new Date(otherValue),
                    _a));
                dialog.open();
            });
        },
    };
}
//# sourceMappingURL=DateHistogramCellRenderer.js.map