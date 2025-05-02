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
import { createIndexArray, sortComplex, lazySeq } from '../internal';
import { Column, EDirtyReason, Ranking, defaultGroup, CompositeColumn, ValueColumn, } from '../model';
import ACommonDataProvider from './ACommonDataProvider';
import ADataProvider from './ADataProvider';
import { CompareLookup } from './sort';
import { DirectRenderTasks } from './DirectRenderTasks';
import { ScheduleRenderTasks } from './ScheduledTasks';
import { joinGroups, mapIndices, duplicateGroup } from '../model/internal';
/**
 * a data provider based on an local array
 */
var LocalDataProvider = /** @class */ (function (_super) {
    __extends(LocalDataProvider, _super);
    function LocalDataProvider(_data, columns, options) {
        if (columns === void 0) { columns = []; }
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, columns, options) || this;
        _this._data = _data;
        _this.ooptions = {
            /**
             * whether the filter should be applied to all rankings regardless where they are
             */
            filterGlobally: false,
            jumpToSearchResult: false,
            taskExecutor: 'direct',
            stringTopNCount: 10,
        };
        _this.filter = null;
        _this.mapToDataRow = function (i) {
            if (i < 0 || i >= _this._dataRows.length) {
                return { i: i, v: {} };
            }
            return _this._dataRows[i];
        };
        Object.assign(_this.ooptions, options);
        _this._dataRows = toRows(_data);
        _this.tasks =
            _this.ooptions.taskExecutor === 'direct'
                ? new DirectRenderTasks(_this.ooptions)
                : new ScheduleRenderTasks(_this.ooptions);
        _this.tasks.setData(_this._dataRows);
        for (var _i = 0, _a = _this.getRankings(); _i < _a.length; _i++) {
            var ranking = _a[_i];
            for (var _b = 0, _c = ranking.flatColumns; _b < _c.length; _b++) {
                var col = _c[_b];
                if (col instanceof ValueColumn) {
                    col.onDataUpdate(_this._dataRows);
                }
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = _this;
        _this.reorderAll = function () {
            //fire for all other rankings a dirty order event, too
            var ranking = this.source;
            var type = this.type;
            for (var _i = 0, _a = that.getRankings(); _i < _a.length; _i++) {
                var r = _a[_i];
                if (r !== ranking) {
                    r.dirtyOrder(type === Ranking.EVENT_FILTER_CHANGED ? [EDirtyReason.FILTER_CHANGED] : [EDirtyReason.UNKNOWN]);
                }
            }
        };
        return _this;
    }
    /**
     * set a globally applied filter to all data without changing the data source itself
     * @param {((row: IDataRow) => boolean) | null} filter
     */
    LocalDataProvider.prototype.setFilter = function (filter) {
        this.filter = filter;
        this.reorderAll.call({ type: Ranking.EVENT_FILTER_CHANGED });
    };
    LocalDataProvider.prototype.getFilter = function () {
        return this.filter;
    };
    LocalDataProvider.prototype.getTotalNumberOfRows = function () {
        return this.data.length;
    };
    LocalDataProvider.prototype.getTaskExecutor = function () {
        return this.tasks;
    };
    Object.defineProperty(LocalDataProvider.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: false,
        configurable: true
    });
    LocalDataProvider.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.tasks.terminate();
    };
    /**
     * replaces the dataset rows with a new one
     * @param data
     */
    LocalDataProvider.prototype.setData = function (data) {
        this._data = data;
        this._dataRows = toRows(data);
        this.dataChanged();
    };
    LocalDataProvider.prototype.dataChanged = function () {
        this.tasks.setData(this._dataRows);
        for (var _i = 0, _a = this.getRankings(); _i < _a.length; _i++) {
            var ranking = _a[_i];
            for (var _b = 0, _c = ranking.flatColumns; _b < _c.length; _b++) {
                var col = _c[_b];
                if (col instanceof ValueColumn && col.isLoaded()) {
                    col.onDataUpdate(this._dataRows);
                }
            }
            // since it uses normalized data
            this.tasks.preComputeData(ranking);
        }
        this.fire(ADataProvider.EVENT_DATA_CHANGED, this._dataRows);
        this.reorderAll.call({ type: 'data' });
    };
    LocalDataProvider.prototype.clearData = function () {
        this.setData([]);
    };
    /**
     * append rows to the dataset
     * @param data
     */
    LocalDataProvider.prototype.appendData = function (data) {
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var d = data_1[_i];
            this._data.push(d);
            this._dataRows.push({ v: d, i: this._dataRows.length });
        }
        this.dataChanged();
    };
    LocalDataProvider.prototype.cloneRanking = function (existing) {
        var ranking = _super.prototype.cloneRanking.call(this, existing);
        if (this.ooptions.filterGlobally) {
            ranking.on("".concat(Ranking.EVENT_FILTER_CHANGED, ".reorderAll"), this.reorderAll);
        }
        this.trackRanking(ranking, existing);
        return ranking;
    };
    LocalDataProvider.prototype.trackRanking = function (ranking, existing) {
        var _this = this;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        ranking.on("".concat(Column.EVENT_DIRTY_CACHES, ".cache"), function () {
            var col = this.origin;
            while (col instanceof Column) {
                // console.log(col.label, 'dirty data');
                that.tasks.dirtyColumn(col, 'data');
                that.tasks.preComputeCol(col);
                col = col.parent;
            }
        });
        var cols = ranking.flatColumns;
        var addKey = "".concat(Ranking.EVENT_ADD_COLUMN, ".cache");
        var removeKey = "".concat(Ranking.EVENT_REMOVE_COLUMN, ".cache");
        var loadedKey = "".concat(ValueColumn.EVENT_DATA_LOADED, ".cache");
        var removeCol = function (col) {
            _this.tasks.dirtyColumn(col, 'data');
            if (col instanceof CompositeColumn) {
                col.on(addKey, null);
                col.on(removeKey, null);
            }
            if (col instanceof ValueColumn) {
                col.on(loadedKey, null);
            }
        };
        var addCol = function (col) {
            _this.tasks.preComputeCol(col);
            if (col instanceof CompositeColumn) {
                col.on(addKey, addCol);
                col.on(removeKey, removeCol);
            }
            if (col instanceof ValueColumn) {
                col.on(loadedKey, dataLoaded);
            }
        };
        function dataLoaded(_, loaded) {
            if (!loaded) {
                return;
            }
            if (this.origin instanceof ValueColumn) {
                this.origin.onDataUpdate(that._dataRows);
            }
        }
        ranking.on(addKey, addCol);
        ranking.on(removeKey, removeCol);
        for (var _i = 0, cols_1 = cols; _i < cols_1.length; _i++) {
            var col = cols_1[_i];
            if (col instanceof CompositeColumn) {
                col.on(addKey, addCol);
                col.on(removeKey, removeCol);
            }
            if (col instanceof ValueColumn) {
                col.on(loadedKey, dataLoaded);
            }
        }
        if (existing) {
            var copy = existing.flatColumns;
            for (var i = 0; i < cols.length; ++i) {
                this.tasks.copyCache(cols[i], copy[i]);
            }
        }
        this.tasks.preComputeData(ranking);
    };
    LocalDataProvider.prototype.patchColumn = function (column) {
        var c = _super.prototype.patchColumn.call(this, column);
        if (c instanceof ValueColumn && c.isLoaded()) {
            c.onDataUpdate(this._dataRows);
        }
        return c;
    };
    LocalDataProvider.prototype.cleanUpRanking = function (ranking) {
        if (this.ooptions.filterGlobally) {
            ranking.on("".concat(Ranking.EVENT_FILTER_CHANGED, ".reorderAll"), null);
        }
        var cols = ranking.flatColumns;
        var addKey = "".concat(Ranking.EVENT_ADD_COLUMN, ".cache");
        var removeKey = "".concat(Ranking.EVENT_REMOVE_COLUMN, ".cache");
        ranking.on(addKey, null);
        ranking.on(removeKey, null);
        for (var _i = 0, cols_2 = cols; _i < cols_2.length; _i++) {
            var col = cols_2[_i];
            if (col instanceof CompositeColumn) {
                col.on(addKey, null);
                col.on(removeKey, null);
            }
        }
        this.tasks.dirtyRanking(ranking, 'data');
        _super.prototype.cleanUpRanking.call(this, ranking);
    };
    LocalDataProvider.prototype.resolveFilter = function (ranking) {
        //do the optional filtering step
        var filter = [];
        if (this.ooptions.filterGlobally) {
            for (var _i = 0, _a = this.getRankings(); _i < _a.length; _i++) {
                var r = _a[_i];
                if (r.isFiltered()) {
                    filter.push.apply(filter, r.flatColumns.filter(function (d) { return d.isFiltered(); }));
                }
            }
        }
        else if (ranking.isFiltered()) {
            filter.push.apply(filter, ranking.flatColumns.filter(function (d) { return d.isFiltered(); }));
        }
        if (this.filter) {
            filter.push(this.filter);
        }
        return filter;
    };
    LocalDataProvider.prototype.noSorting = function (ranking) {
        // initial no sorting required just index mapping
        var l = this._data.length;
        var order = createIndexArray(l, l - 1);
        var index2pos = order.slice();
        for (var i = 0; i < l; ++i) {
            order[i] = i;
            index2pos[i] = i + 1; // shift since default is 0
        }
        this.tasks.preCompute(ranking, [{ rows: order, group: defaultGroup }], l - 1);
        return { groups: [Object.assign({ order: order }, defaultGroup)], index2pos: index2pos };
    };
    LocalDataProvider.prototype.createSorter = function (ranking, filter, needsFiltering, needsGrouping, needsSorting) {
        var _this = this;
        var groups = new Map();
        var groupOrder = [];
        var maxDataIndex = -1;
        var groupCriteria = ranking.getGroupCriteria();
        var lookups = needsSorting
            ? new CompareLookup(this._data.length, true, ranking, this.tasks.valueCache.bind(this.tasks))
            : undefined;
        var pushGroup = function (group, r) {
            var groupKey = group.name.toLowerCase();
            if (groups.has(groupKey)) {
                groups.get(groupKey).rows.push(r.i);
                return;
            }
            var s = { group: group, rows: [r.i] };
            groups.set(groupKey, s);
            groupOrder.push(s);
        };
        var groupCaches = groupCriteria.map(function (c) { return _this.tasks.valueCache(c); });
        var filterCaches = filter.map(function (c) { return (typeof c === 'function' ? undefined : _this.tasks.valueCache(c)); });
        var toGroup = groupCriteria.length === 1
            ? function (r) { return joinGroups([groupCriteria[0].group(r, groupCaches[0] ? groupCaches[0](r.i) : undefined)]); }
            : function (r) {
                return joinGroups(groupCriteria.map(function (c, i) { return c.group(r, groupCaches[i] ? groupCaches[i](r.i) : undefined); }));
            };
        if (needsFiltering) {
            // filter, group, sort
            outer: for (var _i = 0, _a = this._dataRows; _i < _a.length; _i++) {
                var r = _a[_i];
                for (var f = 0; f < filter.length; ++f) {
                    var fc = filter[f];
                    var c = filterCaches[f];
                    if ((typeof fc === 'function' && !fc(r)) || (fc instanceof Column && !fc.filter(r, c ? c(r.i) : undefined))) {
                        continue outer;
                    }
                }
                if (maxDataIndex < r.i) {
                    maxDataIndex = r.i;
                }
                if (lookups) {
                    lookups.push(r);
                }
                pushGroup(toGroup(r), r);
            }
            // some default sorting
            groupOrder.sort(function (a, b) { return a.group.name.toLowerCase().localeCompare(b.group.name.toLowerCase()); });
            return { maxDataIndex: maxDataIndex, lookups: lookups, groupOrder: groupOrder };
        }
        // reuse the existing groups
        for (var _b = 0, _c = ranking.getGroups(); _b < _c.length; _b++) {
            var before = _c[_b];
            var order = before.order;
            if (!needsGrouping) {
                var clone = duplicateGroup(before);
                // reuse in full
                groupOrder.push({ group: clone, rows: order });
                if (!lookups) {
                    maxDataIndex = order.reduce(function (a, b) { return Math.max(a, b); }, maxDataIndex);
                    continue;
                }
                // sort
                for (var o = 0; o < order.length; ++o) {
                    var i = order[o];
                    if (maxDataIndex < i) {
                        maxDataIndex = i;
                    }
                    lookups.push(this._dataRows[i]);
                }
                continue;
            }
            // group, [sort]
            for (var o = 0; o < order.length; ++o) {
                var i = order[o];
                if (maxDataIndex < i) {
                    maxDataIndex = i;
                }
                var r = this._dataRows[i];
                if (lookups) {
                    lookups.push(r);
                }
                pushGroup(toGroup(r), r);
            }
        }
        if (needsGrouping) {
            // some default sorting
            groupOrder.sort(function (a, b) { return a.group.name.toLowerCase().localeCompare(b.group.name.toLowerCase()); });
        }
        return { maxDataIndex: maxDataIndex, lookups: lookups, groupOrder: groupOrder };
    };
    LocalDataProvider.prototype.sortGroup = function (g, i, ranking, lookups, groupLookup, singleGroup, maxDataIndex) {
        var group = g.group;
        var sortTask = this.tasks.sort(ranking, group, g.rows, singleGroup, maxDataIndex, lookups);
        // compute sort group value as task
        var groupSortTask = groupLookup
            ? this.tasks.groupCompare(ranking, group, g.rows).then(function (r) { return r; })
            : [];
        // trigger task for groups to compute for this group
        return Promise.all([sortTask, groupSortTask]).then(function (_a) {
            var order = _a[0], groupC = _a[1];
            if (groupLookup && Array.isArray(groupC)) {
                groupLookup.pushValues(i, groupC);
            }
            return Object.assign(group, { order: order });
        });
    };
    LocalDataProvider.prototype.sortGroups = function (groups, groupLookup, enforceSorting) {
        // sort groups
        if (groupLookup) {
            var groupIndices = groups.map(function (_, i) { return i; });
            sortComplex(groupIndices, groupLookup.sortOrders);
            return groupIndices.map(function (i) { return groups[i]; });
        }
        if (enforceSorting) {
            // create a default sorting
            return groups.sort(function (a, b) { return a.name.localeCompare(b.name); });
        }
        return groups;
    };
    LocalDataProvider.prototype.index2pos = function (groups, maxDataIndex) {
        var total = groups.reduce(function (a, b) { return a + b.order.length; }, 1);
        var index2pos = createIndexArray(maxDataIndex + 1, total);
        var offset = 1;
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var g = groups_1[_i];
            // tslint:disable-next-line
            for (var i = 0; i < g.order.length; i++, offset++) {
                index2pos[g.order[i]] = offset;
            }
        }
        return { groups: groups, index2pos: index2pos };
    };
    LocalDataProvider.prototype.sort = function (ranking, dirtyReason) {
        var _this = this;
        var reasons = new Set(dirtyReason);
        if (this._data.length === 0) {
            return { groups: [], index2pos: [] };
        }
        // console.log(dirtyReason);
        var filter = this.resolveFilter(ranking);
        var needsFiltering = reasons.has(EDirtyReason.UNKNOWN) || reasons.has(EDirtyReason.FILTER_CHANGED);
        var needsGrouping = needsFiltering ||
            reasons.has(EDirtyReason.GROUP_CRITERIA_CHANGED) ||
            reasons.has(EDirtyReason.GROUP_CRITERIA_DIRTY);
        var needsSorting = needsGrouping || reasons.has(EDirtyReason.SORT_CRITERIA_CHANGED) || reasons.has(EDirtyReason.SORT_CRITERIA_DIRTY);
        var needsGroupSorting = needsGrouping ||
            reasons.has(EDirtyReason.GROUP_SORT_CRITERIA_CHANGED) ||
            reasons.has(EDirtyReason.GROUP_SORT_CRITERIA_DIRTY);
        if (needsFiltering) {
            this.tasks.dirtyRanking(ranking, 'summary');
        }
        else if (needsGrouping) {
            this.tasks.dirtyRanking(ranking, 'group');
        }
        // otherwise the summary and group summaries should still be valid
        if (filter.length === 0) {
            // all rows so summary = data
            this.tasks.copyData2Summary(ranking);
        }
        var isGroupedBy = ranking.getGroupCriteria().length > 0;
        var isSortedBy = ranking.getSortCriteria().length > 0;
        var isGroupedSortedBy = ranking.getGroupSortCriteria().length > 0;
        if (!isGroupedBy && !isSortedBy && filter.length === 0) {
            return this.noSorting(ranking);
        }
        var _a = this.createSorter(ranking, filter, needsFiltering, needsGrouping, needsSorting), maxDataIndex = _a.maxDataIndex, lookups = _a.lookups, groupOrder = _a.groupOrder;
        if (groupOrder.length === 0) {
            return { groups: [], index2pos: [] };
        }
        this.tasks.preCompute(ranking, groupOrder, maxDataIndex);
        if (groupOrder.length === 1) {
            var g = groupOrder[0];
            // not required if: group sort criteria changed -> lookups will be none
            return this.sortGroup(g, 0, ranking, lookups, undefined, true, maxDataIndex).then(function (group) {
                return _this.index2pos([group], maxDataIndex);
            });
        }
        var groupLookup = isGroupedSortedBy && needsGroupSorting ? new CompareLookup(groupOrder.length, false, ranking) : undefined;
        return Promise.all(groupOrder.map(function (g, i) {
            // not required if: group sort criteria changed -> lookups will be none
            return _this.sortGroup(g, i, ranking, lookups, groupLookup, false, maxDataIndex);
        })).then(function (groups) {
            // not required if: sort criteria changed -> groupLookup will be none
            var sortedGroups = _this.sortGroups(groups, groupLookup, needsGroupSorting);
            return _this.index2pos(sortedGroups, maxDataIndex);
        });
    };
    LocalDataProvider.prototype.viewRaw = function (indices) {
        var _this = this;
        return mapIndices(indices, function (i) { return _this._data[i] || {}; });
    };
    LocalDataProvider.prototype.viewRawRows = function (indices) {
        return mapIndices(indices, this.mapToDataRow);
    };
    LocalDataProvider.prototype.getRow = function (index) {
        return this._dataRows[index];
    };
    LocalDataProvider.prototype.seq = function (indices) {
        return lazySeq(indices).map(this.mapToDataRow);
    };
    LocalDataProvider.prototype.view = function (indices) {
        return this.viewRaw(indices);
    };
    LocalDataProvider.prototype.mappingSample = function (col) {
        var _this = this;
        var MAX_SAMPLE = 120; //at most 120 sample lines
        var l = this._dataRows.length;
        if (l <= MAX_SAMPLE) {
            return lazySeq(this._dataRows).map(function (v) { return col.getRawNumber(v); });
        }
        //randomly select 500 elements
        var indices = new Set();
        for (var i = 0; i < MAX_SAMPLE; ++i) {
            var j = Math.floor(Math.random() * (l - 1));
            while (indices.has(j)) {
                j = Math.floor(Math.random() * (l - 1));
            }
            indices.add(j);
        }
        return lazySeq(Array.from(indices)).map(function (i) { return col.getRawNumber(_this._dataRows[i]); });
    };
    LocalDataProvider.prototype.searchAndJump = function (search, col, first) {
        //case insensitive search
        var indices = this.search(search, col);
        if (first && indices.length > 0) {
            this.jumpToNearest(indices.slice(0, 1));
        }
        else {
            this.jumpToNearest(indices);
        }
        return indices;
    };
    LocalDataProvider.prototype.search = function (search, col) {
        search = typeof search === 'string' ? search.toLowerCase() : search;
        var f = typeof search === 'string'
            ? function (v) { return v.toLowerCase().indexOf(search) >= 0; }
            : search.test.bind(search);
        var indices = [];
        for (var i = 0; i < this._dataRows.length; ++i) {
            if (f(col.getLabel(this._dataRows[i]))) {
                indices.push(i);
            }
        }
        return indices;
    };
    return LocalDataProvider;
}(ACommonDataProvider));
export default LocalDataProvider;
function toRows(data) {
    return data.map(function (v, i) { return ({ v: v, i: i }); });
}
//# sourceMappingURL=LocalDataProvider.js.map