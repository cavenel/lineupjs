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
import { ARenderTasks, taskNow } from './tasks';
import { toIndexArray, sortComplex, getNumberOfBins, } from '../internal';
/**
 * @internal
 */
export function sortDirect(indices, maxDataIndex, lookups) {
    var order = toIndexArray(indices, maxDataIndex);
    if (lookups) {
        sortComplex(order, lookups.sortOrders);
    }
    return order;
}
/**
 * @internal
 */
var DirectRenderTasks = /** @class */ (function (_super) {
    __extends(DirectRenderTasks, _super);
    function DirectRenderTasks() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cache = new Map();
        return _this;
    }
    DirectRenderTasks.prototype.setData = function (data) {
        this.data = data;
        this.cache.clear();
        this.valueCacheData.clear();
    };
    DirectRenderTasks.prototype.dirtyColumn = function (col, type) {
        _super.prototype.dirtyColumn.call(this, col, type);
        if (type === 'group') {
            return; // not cached
        }
        this.cache.delete("".concat(col.id, ":summary"));
        this.cache.delete("".concat(col.id, ":summary:raw"));
        this.cache.delete("".concat(col.id, ":summary:b"));
        this.cache.delete("".concat(col.id, ":summary:braw"));
        if (type === 'summary') {
            return;
        }
        this.cache.delete("".concat(col.id, ":data"));
        this.cache.delete("".concat(col.id, ":data:raw"));
        this.cache.delete("".concat(col.id, ":data:b"));
        this.cache.delete("".concat(col.id, ":data:braw"));
    };
    DirectRenderTasks.prototype.dirtyRanking = function (ranking, type) {
        for (var _i = 0, _a = ranking.flatColumns; _i < _a.length; _i++) {
            var col = _a[_i];
            this.dirtyColumn(col, type);
        }
    };
    DirectRenderTasks.prototype.preCompute = function () {
        // dummy
    };
    DirectRenderTasks.prototype.preComputeData = function () {
        // dummy
    };
    DirectRenderTasks.prototype.preComputeCol = function () {
        // dummy
    };
    DirectRenderTasks.prototype.copyData2Summary = function () {
        // dummy
    };
    DirectRenderTasks.prototype.copyCache = function (col, from) {
        var fromPrefix = "".concat(from.id, ":");
        for (var _i = 0, _a = Array.from(this.cache.keys()).sort(); _i < _a.length; _i++) {
            var key = _a[_i];
            if (!key.startsWith(fromPrefix)) {
                continue;
            }
            var cacheKey = "".concat(col.id, ":").concat(key.slice(fromPrefix.length));
            this.cache.set(cacheKey, this.cache.get(key));
        }
    };
    DirectRenderTasks.prototype.sort = function (_ranking, _group, indices, _singleCall, maxDataIndex, lookups) {
        return Promise.resolve(sortDirect(indices, maxDataIndex, lookups));
    };
    DirectRenderTasks.prototype.groupCompare = function (ranking, group, rows) {
        var rg = ranking.getGroupSortCriteria();
        if (rg.length === 0) {
            return taskNow([group.name.toLowerCase()]);
        }
        var o = this.byOrder(rows);
        var vs = [];
        for (var _i = 0, rg_1 = rg; _i < rg_1.length; _i++) {
            var s = rg_1[_i];
            var r = s.col.toCompareGroupValue(o, group);
            if (Array.isArray(r)) {
                vs.push.apply(vs, r);
            }
            else {
                vs.push(r);
            }
        }
        vs.push(group.name.toLowerCase());
        return taskNow(vs);
    };
    DirectRenderTasks.prototype.groupRows = function (_col, group, _key, compute) {
        return taskNow(compute(this.byOrder(group.order)));
    };
    DirectRenderTasks.prototype.groupExampleRows = function (_col, group, _key, compute) {
        return taskNow(compute(this.byOrder(group.order.slice(0, 5))));
    };
    DirectRenderTasks.prototype.groupBoxPlotStats = function (col, group, raw) {
        var _a = this.summaryBoxPlotStatsD(col, raw), summary = _a.summary, data = _a.data;
        return taskNow({
            group: this.boxplotBuilder(group.order, col, raw).next(Number.POSITIVE_INFINITY).value,
            summary: summary,
            data: data,
        });
    };
    DirectRenderTasks.prototype.groupNumberStats = function (col, group, raw) {
        var _a = this.summaryNumberStatsD(col, raw), summary = _a.summary, data = _a.data;
        return taskNow({
            group: this.statsBuilder(group.order, col, summary.hist.length, raw).next(Number.POSITIVE_INFINITY).value,
            summary: summary,
            data: data,
        });
    };
    DirectRenderTasks.prototype.groupCategoricalStats = function (col, group) {
        var _a = this.summaryCategoricalStatsD(col), summary = _a.summary, data = _a.data;
        return taskNow({
            group: this.categoricalStatsBuilder(group.order, col).next(Number.POSITIVE_INFINITY).value,
            summary: summary,
            data: data,
        });
    };
    DirectRenderTasks.prototype.groupDateStats = function (col, group) {
        var _a = this.summaryDateStatsD(col), summary = _a.summary, data = _a.data;
        return taskNow({
            group: this.dateStatsBuilder(group.order, col, summary).next(Number.POSITIVE_INFINITY).value,
            summary: summary,
            data: data,
        });
    };
    DirectRenderTasks.prototype.groupStringStats = function (col, group) {
        var _a = this.summaryStringStatsD(col), summary = _a.summary, data = _a.data;
        return taskNow({
            group: this.stringStatsBuilder(group.order, col, summary.topN.map(function (d) { return d.value; })).next(Number.POSITIVE_INFINITY).value,
            summary: summary,
            data: data,
        });
    };
    DirectRenderTasks.prototype.summaryBoxPlotStats = function (col, raw) {
        return taskNow(this.summaryBoxPlotStatsD(col, raw));
    };
    DirectRenderTasks.prototype.summaryNumberStats = function (col, raw) {
        return taskNow(this.summaryNumberStatsD(col, raw));
    };
    DirectRenderTasks.prototype.summaryCategoricalStats = function (col) {
        return taskNow(this.summaryCategoricalStatsD(col));
    };
    DirectRenderTasks.prototype.summaryDateStats = function (col) {
        return taskNow(this.summaryDateStatsD(col));
    };
    DirectRenderTasks.prototype.summaryStringStats = function (col) {
        return taskNow(this.summaryStringStatsD(col));
    };
    DirectRenderTasks.prototype.summaryNumberStatsD = function (col, raw) {
        var _this = this;
        var ranking = col.findMyRanker();
        return this.cached('summary', col, function () {
            var order = ranking ? ranking.getOrder() : [];
            var data = _this.dataNumberStats(col, raw);
            return {
                summary: _this.statsBuilder(order, col, data.hist.length, raw).next(Number.POSITIVE_INFINITY).value,
                data: data,
            };
        }, raw ? ':raw' : '', ranking && ranking.getOrderLength() === 0);
    };
    DirectRenderTasks.prototype.summaryBoxPlotStatsD = function (col, raw) {
        var _this = this;
        var ranking = col.findMyRanker();
        return this.cached('summary', col, function () {
            var order = ranking ? ranking.getOrder() : [];
            var data = _this.dataBoxPlotStats(col, raw);
            return { summary: _this.boxplotBuilder(order, col, raw).next(Number.POSITIVE_INFINITY).value, data: data };
        }, raw ? ':braw' : ':b', ranking && ranking.getOrderLength() === 0);
    };
    DirectRenderTasks.prototype.summaryCategoricalStatsD = function (col) {
        var _this = this;
        var ranking = col.findMyRanker();
        return this.cached('summary', col, function () {
            var order = ranking ? ranking.getOrder() : [];
            var data = _this.dataCategoricalStats(col);
            return {
                summary: _this.categoricalStatsBuilder(order, col).next(Number.POSITIVE_INFINITY).value,
                data: data,
            };
        }, '', ranking && ranking.getOrderLength() === 0);
    };
    DirectRenderTasks.prototype.summaryDateStatsD = function (col) {
        var _this = this;
        var ranking = col.findMyRanker();
        return this.cached('summary', col, function () {
            var order = ranking ? ranking.getOrder() : [];
            var data = _this.dataDateStats(col);
            return {
                summary: _this.dateStatsBuilder(order, col, data).next(Number.POSITIVE_INFINITY).value,
                data: data,
            };
        }, '', ranking && ranking.getOrderLength() === 0);
    };
    DirectRenderTasks.prototype.summaryStringStatsD = function (col) {
        var _this = this;
        return this.cached('summary', col, function () {
            var ranking = col.findMyRanker().getOrder();
            var data = _this.dataStringStats(col);
            return {
                summary: _this.stringStatsBuilder(ranking, col, undefined).next(Number.POSITIVE_INFINITY).value,
                data: data,
            };
        }, '', col.findMyRanker().getOrderLength() === 0);
    };
    DirectRenderTasks.prototype.cached = function (prefix, col, creator, suffix, dontCache) {
        if (suffix === void 0) { suffix = ''; }
        if (dontCache === void 0) { dontCache = false; }
        var key = "".concat(col.id, ":").concat(prefix).concat(suffix);
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        var s = creator();
        if (!dontCache) {
            this.cache.set(key, s);
        }
        return s;
    };
    DirectRenderTasks.prototype.dataBoxPlotStats = function (col, raw) {
        var _this = this;
        return this.cached('data', col, function () { return _this.boxplotBuilder(null, col, raw).next(Number.POSITIVE_INFINITY).value; }, raw ? ':braw' : ':b');
    };
    DirectRenderTasks.prototype.dataNumberStats = function (col, raw) {
        var _this = this;
        return this.cached('data', col, function () {
            return _this.statsBuilder(null, col, getNumberOfBins(_this.data.length), raw).next(Number.POSITIVE_INFINITY)
                .value;
        }, raw ? ':raw' : '');
    };
    DirectRenderTasks.prototype.dataCategoricalStats = function (col) {
        var _this = this;
        return this.cached('data', col, function () { return _this.categoricalStatsBuilder(null, col).next(Number.POSITIVE_INFINITY).value; });
    };
    DirectRenderTasks.prototype.dataDateStats = function (col) {
        var _this = this;
        return this.cached('data', col, function () { return _this.dateStatsBuilder(null, col).next(Number.POSITIVE_INFINITY).value; });
    };
    DirectRenderTasks.prototype.dataStringStats = function (col) {
        var _this = this;
        return this.cached('data', col, function () { return _this.stringStatsBuilder(null, col).next(Number.POSITIVE_INFINITY).value; });
    };
    DirectRenderTasks.prototype.terminate = function () {
        this.cache.clear();
    };
    return DirectRenderTasks;
}(ARenderTasks));
export { DirectRenderTasks };
//# sourceMappingURL=DirectRenderTasks.js.map