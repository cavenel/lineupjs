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
import { abortAble } from 'lineupengine';
import { getNumberOfBins, lazySeq, toIndexArray, WorkerTaskScheduler, createWorkerBlob, } from '../internal';
import TaskScheduler, { ABORTED, oneShotIterator } from '../internal/scheduler';
import Column, { isCategoricalLikeColumn, isDateColumn, isNumberColumn, Ranking, StringColumn, } from '../model';
import { sortDirect } from './DirectRenderTasks';
import { ARenderTasks, MultiIndices, taskLater, TaskLater, taskNow, TaskNow } from './tasks';
var ScheduleRenderTasks = /** @class */ (function (_super) {
    __extends(ScheduleRenderTasks, _super);
    function ScheduleRenderTasks() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cache = new Map();
        _this.tasks = new TaskScheduler();
        _this.workers = new WorkerTaskScheduler(createWorkerBlob());
        return _this;
    }
    ScheduleRenderTasks.prototype.setData = function (data) {
        this.data = data;
        this.cache.clear();
        this.tasks.clear();
        this.valueCacheData.clear();
        this.workers.deleteRefs();
    };
    ScheduleRenderTasks.prototype.dirtyColumn = function (col, type) {
        _super.prototype.dirtyColumn.call(this, col, type);
        // order designed such that first groups, then summaries, then data is deleted
        for (var _i = 0, _a = Array.from(this.cache.keys()).sort(); _i < _a.length; _i++) {
            var key = _a[_i];
            // data = all
            // summary = summary + group
            // group = group only
            if ((type === 'data' && key.startsWith("".concat(col.id, ":"))) ||
                (type === 'summary' && key.startsWith("".concat(col.id, ":b:summary:"))) ||
                key.startsWith("".concat(col.id, ":a:group"))) {
                this.cache.delete(key);
                this.tasks.abort(key);
            }
        }
        if (type !== 'data') {
            return;
        }
        this.valueCacheData.delete(col.id);
        this.workers.deleteRef(col.id);
    };
    ScheduleRenderTasks.prototype.dirtyRanking = function (ranking, type) {
        var cols = ranking.flatColumns;
        var checker;
        switch (type) {
            case 'group':
                checker = cols.map(function (col) { return function (key) { return key.startsWith("".concat(col.id, ":a:group")); }; });
                break;
            case 'summary':
                checker = cols.map(function (col) { return function (key) { return key.startsWith("".concat(col.id, ":b:summary")) || key.startsWith("".concat(col.id, ":a:group")); }; });
                break;
            case 'data':
            default:
                checker = cols.map(function (col) { return function (key) { return key.startsWith("".concat(col.id, ":")); }; });
                break;
        }
        var _loop_1 = function (key) {
            if (checker.some(function (f) { return f(key); })) {
                this_1.cache.delete(key);
                this_1.tasks.abort(key);
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = Array.from(this.cache.keys()).sort(); _i < _a.length; _i++) {
            var key = _a[_i];
            _loop_1(key);
        }
        // group compare tasks
        this.tasks.abortAll(function (t) { return t.id.startsWith("r".concat(ranking.id, ":")); });
        // delete remote caches
        this.workers.deleteRef(ranking.id, true);
        if (type !== 'data') {
            return;
        }
        for (var _b = 0, cols_1 = cols; _b < cols_1.length; _b++) {
            var col = cols_1[_b];
            _super.prototype.dirtyColumn.call(this, col, type);
            this.workers.deleteRef(col.id);
        }
    };
    ScheduleRenderTasks.prototype.preCompute = function (ranking, groups, maxDataIndex) {
        if (groups.length === 0) {
            return;
        }
        var cols = ranking.flatColumns;
        if (groups.length === 1) {
            var _a = groups[0], group = _a.group, rows = _a.rows;
            var multi = new MultiIndices([rows], maxDataIndex);
            for (var _i = 0, cols_2 = cols; _i < cols_2.length; _i++) {
                var col = cols_2[_i];
                if (isCategoricalLikeColumn(col)) {
                    this.summaryCategoricalStats(col, multi);
                }
                else if (isNumberColumn(col)) {
                    this.summaryNumberStats(col, false, multi);
                    this.summaryNumberStats(col, true, multi);
                }
                else if (isDateColumn(col)) {
                    this.summaryDateStats(col, multi);
                }
                else if (col instanceof StringColumn) {
                    this.summaryStringStats(col, multi);
                }
                else {
                    continue;
                }
                // copy from summary to group and create proper structure
                this.chainCopy("".concat(col.id, ":a:group:").concat(group.name), this.cache.get("".concat(col.id, ":b:summary")), function (v) { return ({ group: v.summary, summary: v.summary, data: v.data }); });
                if (isNumberColumn(col)) {
                    this.chainCopy("".concat(col.id, ":a:group:").concat(group.name, ":raw"), this.cache.get("".concat(col.id, ":b:summary:raw")), function (v) { return ({ group: v.summary, summary: v.summary, data: v.data }); });
                }
            }
            return;
        }
        var orderedGroups = groups.map(function (_a) {
            var rows = _a.rows, group = _a.group;
            return Object.assign({ order: rows }, group);
        });
        var full = new MultiIndices(groups.map(function (d) { return d.rows; }), maxDataIndex);
        for (var _b = 0, cols_3 = cols; _b < cols_3.length; _b++) {
            var col = cols_3[_b];
            if (isCategoricalLikeColumn(col)) {
                this.summaryCategoricalStats(col, full);
                for (var _c = 0, orderedGroups_1 = orderedGroups; _c < orderedGroups_1.length; _c++) {
                    var g = orderedGroups_1[_c];
                    this.groupCategoricalStats(col, g);
                }
            }
            else if (isDateColumn(col)) {
                this.summaryDateStats(col, full);
                for (var _d = 0, orderedGroups_2 = orderedGroups; _d < orderedGroups_2.length; _d++) {
                    var g = orderedGroups_2[_d];
                    this.groupDateStats(col, g);
                }
            }
            else if (isNumberColumn(col)) {
                this.summaryNumberStats(col, false, full);
                this.summaryNumberStats(col, true, full);
                for (var _e = 0, orderedGroups_3 = orderedGroups; _e < orderedGroups_3.length; _e++) {
                    var g = orderedGroups_3[_e];
                    this.groupNumberStats(col, g, false);
                    this.groupNumberStats(col, g, true);
                }
            }
            else if (col instanceof StringColumn) {
                this.summaryStringStats(col, full);
                for (var _f = 0, orderedGroups_4 = orderedGroups; _f < orderedGroups_4.length; _f++) {
                    var g = orderedGroups_4[_f];
                    this.groupStringStats(col, g);
                }
            }
        }
    };
    ScheduleRenderTasks.prototype.preComputeData = function (ranking) {
        for (var _i = 0, _a = ranking.flatColumns; _i < _a.length; _i++) {
            var col = _a[_i];
            if (isCategoricalLikeColumn(col)) {
                this.dataCategoricalStats(col);
            }
            else if (isNumberColumn(col)) {
                this.dataNumberStats(col, false);
                this.dataNumberStats(col, true);
            }
            else if (isDateColumn(col)) {
                this.dataDateStats(col);
            }
            else if (col instanceof StringColumn) {
                this.dataStringStats(col);
            }
        }
    };
    ScheduleRenderTasks.prototype.preComputeCol = function (col) {
        var ranking = col.findMyRanker();
        if (col instanceof StringColumn) {
            this.dataStringStats(col);
            if (!ranking) {
                return;
            }
            this.summaryStringStats(col);
            for (var _i = 0, _a = ranking.getGroups(); _i < _a.length; _i++) {
                var group = _a[_i];
                this.groupStringStats(col, group);
            }
            return;
        }
        if (isCategoricalLikeColumn(col)) {
            this.dataCategoricalStats(col);
            if (!ranking) {
                return;
            }
            this.summaryCategoricalStats(col);
            for (var _b = 0, _c = ranking.getGroups(); _b < _c.length; _b++) {
                var group = _c[_b];
                this.groupCategoricalStats(col, group);
            }
            return;
        }
        if (isNumberColumn(col)) {
            this.dataNumberStats(col, false);
            this.dataNumberStats(col, true);
            if (!ranking) {
                return;
            }
            this.summaryNumberStats(col, false);
            this.summaryNumberStats(col, true);
            for (var _d = 0, _e = ranking.getGroups(); _d < _e.length; _d++) {
                var group = _e[_d];
                this.groupNumberStats(col, group, false);
                this.groupNumberStats(col, group, true);
            }
            return;
        }
        if (!isDateColumn(col)) {
            return;
        }
        this.dataDateStats(col);
        if (!ranking) {
            return;
        }
        this.summaryDateStats(col);
        for (var _f = 0, _g = ranking.getGroups(); _f < _g.length; _f++) {
            var group = _g[_f];
            this.groupDateStats(col, group);
        }
    };
    ScheduleRenderTasks.prototype.copyData2Summary = function (ranking) {
        for (var _i = 0, _a = ranking.flatColumns; _i < _a.length; _i++) {
            var col = _a[_i];
            if (isCategoricalLikeColumn(col)) {
                this.dataCategoricalStats(col);
            }
            else if (isNumberColumn(col)) {
                this.dataNumberStats(col, false);
                this.dataNumberStats(col, true);
            }
            else if (isDateColumn(col)) {
                this.dataDateStats(col);
            }
            else if (col instanceof StringColumn) {
                this.dataStringStats(col);
            }
            else {
                continue;
            }
            // copy from data to summary and create proper structure
            this.chainCopy("".concat(col.id, ":b:summary"), this.cache.get("".concat(col.id, ":c:data")), function (data) { return ({
                summary: data,
                data: data,
            }); });
            if (isNumberColumn(col)) {
                this.chainCopy("".concat(col.id, ":b:summary:raw"), this.cache.get("".concat(col.id, ":c:data:raw")), function (data) { return ({
                    summary: data,
                    data: data,
                }); });
            }
        }
    };
    ScheduleRenderTasks.prototype.copyCache = function (col, from) {
        var fromPrefix = "".concat(from.id, ":");
        for (var _i = 0, _a = Array.from(this.cache.keys()).sort(); _i < _a.length; _i++) {
            var key = _a[_i];
            if (!key.startsWith(fromPrefix)) {
                continue;
            }
            var chainKey = "".concat(col.id, ":").concat(key.slice(fromPrefix.length));
            this.chainCopy(chainKey, this.cache.get(key), function (data) { return data; });
        }
    };
    ScheduleRenderTasks.prototype.groupCompare = function (ranking, group, rows) {
        var _this = this;
        return taskLater(this.tasks.push("r".concat(ranking.id, ":").concat(group.name), function () {
            var rg = ranking.getGroupSortCriteria();
            if (rg.length === 0) {
                return [group.name.toLowerCase()];
            }
            var o = _this.byOrder(rows);
            var vs = [];
            var _loop_2 = function (s) {
                var cache = _this.valueCache(s.col);
                var r = s.col.toCompareGroupValue(o, group, cache ? lazySeq(rows).map(function (d) { return cache(d); }) : undefined);
                if (Array.isArray(r)) {
                    vs.push.apply(vs, r);
                }
                else {
                    vs.push(r);
                }
            };
            for (var _i = 0, rg_1 = rg; _i < rg_1.length; _i++) {
                var s = rg_1[_i];
                _loop_2(s);
            }
            vs.push(group.name.toLowerCase());
            return vs;
        }));
    };
    ScheduleRenderTasks.prototype.groupRows = function (col, group, key, compute) {
        var _this = this;
        return this.cached("".concat(col.id, ":a:group:").concat(group.name, ":").concat(key), true, oneShotIterator(function () { return compute(_this.byOrder(group.order)); }));
    };
    ScheduleRenderTasks.prototype.groupExampleRows = function (_col, group, _key, compute) {
        return taskNow(compute(this.byOrder(group.order.slice(0, 5))));
    };
    ScheduleRenderTasks.prototype.groupBoxPlotStats = function (col, group, raw) {
        var _this = this;
        return this.chain("".concat(col.id, ":a:group:").concat(group.name).concat(raw ? ':braw' : ':b'), this.summaryBoxPlotStats(col, raw), function (_a) {
            var summary = _a.summary, data = _a.data;
            var ranking = col.findMyRanker();
            var key = raw ? "".concat(col.id, ":r") : col.id;
            if (_this.valueCacheData.has(key) && group.order.length > 0) {
                // web worker version
                return function () {
                    return _this.workers
                        .pushStats('boxplotStats', {}, key, _this.valueCacheData.get(key), "".concat(ranking.id, ":").concat(group.name), group.order)
                        .then(function (group) { return ({ group: group, summary: summary, data: data }); });
                };
            }
            return _this.boxplotBuilder(group.order, col, raw, function (group) { return ({ group: group, summary: summary, data: data }); });
        });
    };
    ScheduleRenderTasks.prototype.groupNumberStats = function (col, group, raw) {
        var _this = this;
        return this.chain("".concat(col.id, ":a:group:").concat(group.name).concat(raw ? ':raw' : ''), this.summaryNumberStats(col, raw), function (_a) {
            var summary = _a.summary, data = _a.data;
            var ranking = col.findMyRanker();
            var key = raw ? "".concat(col.id, ":r") : col.id;
            if (_this.valueCacheData.has(key) && group.order.length > 0) {
                // web worker version
                return function () {
                    return _this.workers
                        .pushStats('numberStats', { numberOfBins: summary.hist.length, domain: _this.resolveDomain(col, raw) }, key, _this.valueCacheData.get(key), "".concat(ranking.id, ":").concat(group.name), group.order)
                        .then(function (group) { return ({ group: group, summary: summary, data: data }); });
                };
            }
            return _this.statsBuilder(group.order, col, summary.hist.length, raw, function (group) { return ({
                group: group,
                summary: summary,
                data: data,
            }); });
        });
    };
    ScheduleRenderTasks.prototype.groupCategoricalStats = function (col, group) {
        var _this = this;
        return this.chain("".concat(col.id, ":a:group:").concat(group.name), this.summaryCategoricalStats(col), function (_a) {
            var summary = _a.summary, data = _a.data;
            var ranking = col.findMyRanker();
            if (_this.valueCacheData.has(col.id) && group.order.length > 0) {
                // web worker version
                return function () {
                    return _this.workers
                        .pushStats('categoricalStats', { categories: col.categories.map(function (d) { return d.name; }) }, col.id, _this.valueCacheData.get(col.id), "".concat(ranking.id, ":").concat(group.name), group.order)
                        .then(function (group) { return ({ group: group, summary: summary, data: data }); });
                };
            }
            return _this.categoricalStatsBuilder(group.order, col, function (group) { return ({ group: group, summary: summary, data: data }); });
        });
    };
    ScheduleRenderTasks.prototype.groupDateStats = function (col, group) {
        var _this = this;
        var key = "".concat(col.id, ":a:group:").concat(group.name);
        return this.chain(key, this.summaryDateStats(col), function (_a) {
            var summary = _a.summary, data = _a.data;
            var ranking = col.findMyRanker();
            if (_this.valueCacheData.has(col.id) && group.order.length > 0) {
                // web worker version
                return function () {
                    return _this.workers
                        .pushStats('dateStats', { template: summary }, col.id, _this.valueCacheData.get(col.id), "".concat(ranking.id, ":").concat(group.name), group.order)
                        .then(function (group) { return ({ group: group, summary: summary, data: data }); });
                };
            }
            return _this.dateStatsBuilder(group.order, col, summary, function (group) { return ({ group: group, summary: summary, data: data }); });
        });
    };
    ScheduleRenderTasks.prototype.groupStringStats = function (col, group) {
        var _this = this;
        var key = "".concat(col.id, ":a:group:").concat(group.name);
        return this.chain(key, this.summaryStringStats(col), function (_a) {
            var summary = _a.summary, data = _a.data;
            var ranking = col.findMyRanker();
            var topN = summary.topN.map(function (d) { return d.value; });
            if (_this.valueCacheData.has(col.id) && group.order.length > 0) {
                // web worker version
                return function () {
                    return _this.workers
                        .pushStats('stringStats', { topN: _this.options.stringTopNCount }, col.id, _this.valueCacheData.get(col.id), "".concat(ranking.id, ":").concat(group.name), group.order)
                        .then(function (group) { return ({ group: group, summary: summary, data: data }); });
                };
            }
            return _this.stringStatsBuilder(group.order, col, topN, function (group) { return ({ group: group, summary: summary, data: data }); });
        });
    };
    ScheduleRenderTasks.prototype.summaryBoxPlotStats = function (col, raw, order) {
        var _this = this;
        return this.chain("".concat(col.id, ":b:summary").concat(raw ? ':braw' : ':b'), this.dataBoxPlotStats(col, raw), function (data) {
            var ranking = col.findMyRanker();
            var key = raw ? "".concat(col.id, ":r") : col.id;
            if (_this.valueCacheData.has(key)) {
                // web worker version
                return function () {
                    return _this.workers
                        .pushStats('boxplotStats', {}, key, _this.valueCacheData.get(key), ranking.id, order ? order.joined : ranking.getOrder())
                        .then(function (summary) { return ({ summary: summary, data: data }); });
                };
            }
            return _this.boxplotBuilder(order ? order : ranking.getOrder(), col, raw, function (summary) { return ({ summary: summary, data: data }); });
        });
    };
    ScheduleRenderTasks.prototype.summaryNumberStats = function (col, raw, order) {
        var _this = this;
        return this.chain("".concat(col.id, ":b:summary").concat(raw ? ':raw' : ''), this.dataNumberStats(col, raw), function (data) {
            var ranking = col.findMyRanker();
            var key = raw ? "".concat(col.id, ":r") : col.id;
            if (_this.valueCacheData.has(key)) {
                // web worker version
                return function () {
                    return _this.workers
                        .pushStats('numberStats', { numberOfBins: data.hist.length, domain: _this.resolveDomain(col, raw) }, key, _this.valueCacheData.get(key), ranking.id, order ? order.joined : ranking.getOrder())
                        .then(function (summary) { return ({ summary: summary, data: data }); });
                };
            }
            return _this.statsBuilder(order ? order : ranking.getOrder(), col, data.hist.length, raw, function (summary) { return ({
                summary: summary,
                data: data,
            }); });
        });
    };
    ScheduleRenderTasks.prototype.summaryCategoricalStats = function (col, order) {
        var _this = this;
        return this.chain("".concat(col.id, ":b:summary"), this.dataCategoricalStats(col), function (data) {
            var ranking = col.findMyRanker();
            if (_this.valueCacheData.has(col.id)) {
                // web worker version
                return function () {
                    return _this.workers
                        .pushStats('categoricalStats', { categories: col.categories.map(function (d) { return d.name; }) }, col.id, _this.valueCacheData.get(col.id), ranking.id, order ? order.joined : ranking.getOrder())
                        .then(function (summary) { return ({ summary: summary, data: data }); });
                };
            }
            return _this.categoricalStatsBuilder(order ? order : ranking.getOrder(), col, function (summary) { return ({ summary: summary, data: data }); });
        });
    };
    ScheduleRenderTasks.prototype.summaryDateStats = function (col, order) {
        var _this = this;
        return this.chain("".concat(col.id, ":b:summary"), this.dataDateStats(col), function (data) {
            var ranking = col.findMyRanker();
            if (_this.valueCacheData.has(col.id)) {
                // web worker version
                return function () {
                    return _this.workers
                        .pushStats('dateStats', { template: data }, col.id, _this.valueCacheData.get(col.id), ranking.id, order ? order.joined : ranking.getOrder())
                        .then(function (summary) { return ({ summary: summary, data: data }); });
                };
            }
            return _this.dateStatsBuilder(order ? order : ranking.getOrder(), col, data, function (summary) { return ({ summary: summary, data: data }); });
        });
    };
    ScheduleRenderTasks.prototype.summaryStringStats = function (col, order) {
        var _this = this;
        return this.chain("".concat(col.id, ":b:summary"), this.dataStringStats(col), function (data) {
            var ranking = col.findMyRanker();
            if (_this.valueCacheData.has(col.id)) {
                // web worker version
                return function () {
                    return _this.workers
                        .pushStats('stringStats', { topN: _this.options.stringTopNCount }, col.id, _this.valueCacheData.get(col.id), ranking.id, order ? order.joined : ranking.getOrder())
                        .then(function (summary) { return ({ summary: summary, data: data }); });
                };
            }
            return _this.stringStatsBuilder(order ? order : ranking.getOrder(), col, undefined, function (summary) { return ({
                summary: summary,
                data: data,
            }); });
        });
    };
    ScheduleRenderTasks.prototype.cached = function (key, canAbort, it) {
        var _this = this;
        var dontCache = this.data.length === 0;
        if (this.isValidCacheEntry(key) && !dontCache) {
            return this.cache.get(key);
        }
        var task = typeof it === 'function' ? abortAble(it()) : this.tasks.pushMulti(key, it, canAbort);
        var s = taskLater(task);
        if (!dontCache) {
            this.cache.set(key, s);
        }
        task.then(function (r) {
            if (_this.cache.get(key) !== s) {
                return;
            }
            if (typeof r === 'symbol') {
                _this.cache.delete(key);
            }
            else {
                _this.cache.set(key, taskNow(r));
            }
        });
        return s;
    };
    ScheduleRenderTasks.prototype.chain = function (key, task, creator) {
        var _this = this;
        if (this.isValidCacheEntry(key)) {
            return this.cache.get(key);
        }
        if (task instanceof TaskNow) {
            if (typeof task.v === 'symbol') {
                // aborted
                return taskNow(ABORTED);
            }
            return this.cached(key, true, creator(task.v));
        }
        var v = task.v;
        var subTask = v.then(function (data) {
            if (typeof data === 'symbol') {
                return ABORTED;
            }
            var created = creator(data);
            if (typeof created === 'function') {
                // promise
                return created();
            }
            return _this.tasks.pushMulti(key, created);
        });
        var s = taskLater(subTask);
        this.cache.set(key, s);
        subTask.then(function (r) {
            if (_this.cache.get(key) !== s) {
                return;
            }
            if (typeof r === 'symbol') {
                _this.cache.delete(key);
            }
            else {
                _this.cache.set(key, taskNow(r));
            }
        });
        return s;
    };
    ScheduleRenderTasks.prototype.isValidCacheEntry = function (key) {
        if (!this.cache.has(key)) {
            return false;
        }
        var v = this.cache.get(key);
        // not an aborted task
        return !(v instanceof TaskNow && typeof v.v === 'symbol') && !(v instanceof TaskLater && v.v.isAborted());
    };
    ScheduleRenderTasks.prototype.chainCopy = function (key, task, creator) {
        var _this = this;
        if (this.isValidCacheEntry(key)) {
            return this.cache.get(key);
        }
        if (task instanceof TaskNow) {
            if (typeof task.v === 'symbol') {
                // aborted
                return taskNow(ABORTED);
            }
            var subTask_1 = taskNow(creator(task.v));
            this.cache.set(key, subTask_1);
            return subTask_1;
        }
        var v = task.v;
        var subTask = v.then(function (data) {
            if (typeof data === 'symbol') {
                return ABORTED;
            }
            return creator(data);
        });
        var s = taskLater(subTask);
        this.cache.set(key, s);
        subTask.then(function (r) {
            if (_this.cache.get(key) !== s) {
                return;
            }
            if (typeof r === 'symbol') {
                _this.cache.delete(key);
            }
            else {
                _this.cache.set(key, taskNow(r));
            }
        });
        return s;
    };
    ScheduleRenderTasks.prototype.dataBoxPlotStats = function (col, raw) {
        var _this = this;
        var key = "".concat(col.id, ":c:data").concat(raw ? ':braw' : ':b');
        var valueCacheKey = raw ? "".concat(col.id, ":r") : col.id;
        if (this.valueCacheData.has(valueCacheKey) && this.data.length > 0) {
            // use webworker
            return this.cached(key, false, function () {
                return _this.workers.pushStats('boxplotStats', {}, valueCacheKey, _this.valueCacheData.get(valueCacheKey));
            });
        }
        return this.cached(key, false, this.boxplotBuilder(null, col, raw));
    };
    ScheduleRenderTasks.prototype.dataNumberStats = function (col, raw) {
        return this.cached("".concat(col.id, ":c:data").concat(raw ? ':raw' : ''), false, this.statsBuilder(null, col, getNumberOfBins(this.data.length), raw));
    };
    ScheduleRenderTasks.prototype.dataCategoricalStats = function (col) {
        return this.cached("".concat(col.id, ":c:data"), false, this.categoricalStatsBuilder(null, col));
    };
    ScheduleRenderTasks.prototype.dataStringStats = function (col) {
        return this.cached("".concat(col.id, ":c:data"), false, this.stringStatsBuilder(null, col));
    };
    ScheduleRenderTasks.prototype.dataDateStats = function (col) {
        return this.cached("".concat(col.id, ":c:data"), false, this.dateStatsBuilder(null, col));
    };
    ScheduleRenderTasks.prototype.sort = function (ranking, group, indices, singleCall, maxDataIndex, lookups) {
        if (!lookups || indices.length < 1000) {
            // no thread needed
            var order = sortDirect(indices, maxDataIndex, lookups);
            return Promise.resolve(order);
        }
        var indexArray = toIndexArray(indices, maxDataIndex);
        var toTransfer = [indexArray.buffer];
        if (singleCall) {
            // can transfer otherwise need to copy
            toTransfer.push.apply(toTransfer, lookups.transferAbles);
        }
        return this.workers.push('sort', {
            ref: "".concat(ranking.id, ":").concat(group.name),
            indices: indexArray,
            sortOrders: lookups.sortOrders,
        }, toTransfer, function (r) { return r.order; });
    };
    ScheduleRenderTasks.prototype.terminate = function () {
        this.workers.terminate();
        this.cache.clear();
        this.valueCacheData.clear();
    };
    return ScheduleRenderTasks;
}(ARenderTasks));
export { ScheduleRenderTasks };
//# sourceMappingURL=ScheduledTasks.js.map