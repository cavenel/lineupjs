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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { equalArrays, fixCSS, suffix, joinIndexArrays, AEventDispatcher } from '../internal';
import { isSortingAscByDefault } from './annotations';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, labelChanged, visibilityChanged, widthChanged, } from './Column';
import CompositeColumn from './CompositeColumn';
import { defaultGroup, } from './interfaces';
import { groupRoots, traverseGroupsDFS } from './internal';
import AggregateGroupColumn from './AggregateGroupColumn';
import SetColumn from './SetColumn';
import { AGGREGATION_LEVEL_WIDTH } from '../styles';
export var EDirtyReason;
(function (EDirtyReason) {
    EDirtyReason["UNKNOWN"] = "unknown";
    EDirtyReason["FILTER_CHANGED"] = "filter";
    EDirtyReason["SORT_CRITERIA_CHANGED"] = "sort_changed";
    EDirtyReason["SORT_CRITERIA_DIRTY"] = "sort_dirty";
    EDirtyReason["GROUP_CRITERIA_CHANGED"] = "group_changed";
    EDirtyReason["GROUP_CRITERIA_DIRTY"] = "group_dirty";
    EDirtyReason["GROUP_SORT_CRITERIA_CHANGED"] = "group_sort_changed";
    EDirtyReason["GROUP_SORT_CRITERIA_DIRTY"] = "group_sort_dirty";
})(EDirtyReason || (EDirtyReason = {}));
/**
 * a ranking
 */
var Ranking = /** @class */ (function (_super) {
    __extends(Ranking, _super);
    function Ranking(id) {
        var _this = _super.call(this) || this;
        _this.id = id;
        _this.sortCriteria = [];
        _this.groupColumns = [];
        _this.groupSortCriteria = [];
        /**
         * columns of this ranking
         * @type {Array}
         * @private
         */
        _this.columns = [];
        _this.dirtyOrder = function (reason) {
            _this.fire([Ranking.EVENT_DIRTY_ORDER, Ranking.EVENT_DIRTY_VALUES, Ranking.EVENT_DIRTY], reason);
        };
        _this.dirtyOrderSortDirty = function () { return _this.dirtyOrder([EDirtyReason.SORT_CRITERIA_DIRTY]); };
        _this.dirtyOrderGroupDirty = function () { return _this.dirtyOrder([EDirtyReason.GROUP_CRITERIA_DIRTY]); };
        _this.dirtyOrderGroupSortDirty = function () { return _this.dirtyOrder([EDirtyReason.GROUP_SORT_CRITERIA_DIRTY]); };
        _this.dirtyOrderFiltering = function () { return _this.dirtyOrder([EDirtyReason.FILTER_CHANGED]); };
        /**
         * the current ordering as an sorted array of indices
         * @type {Array}
         */
        _this.groups = [Object.assign({ order: [] }, defaultGroup)];
        _this.order = [];
        _this.index2pos = [];
        _this.id = fixCSS(id);
        _this.label = "Ranking ".concat(id.startsWith('rank') ? id.slice(4) : id);
        return _this;
    }
    Ranking.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            Ranking.EVENT_WIDTH_CHANGED,
            Ranking.EVENT_FILTER_CHANGED,
            Ranking.EVENT_LABEL_CHANGED,
            Ranking.EVENT_GROUPS_CHANGED,
            Ranking.EVENT_ADD_COLUMN,
            Ranking.EVENT_REMOVE_COLUMN,
            Ranking.EVENT_GROUP_CRITERIA_CHANGED,
            Ranking.EVENT_MOVE_COLUMN,
            Ranking.EVENT_DIRTY,
            Ranking.EVENT_DIRTY_HEADER,
            Ranking.EVENT_DIRTY_VALUES,
            Ranking.EVENT_DIRTY_CACHES,
            Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED,
            Ranking.EVENT_COLUMN_VISIBILITY_CHANGED,
            Ranking.EVENT_SORT_CRITERIA_CHANGED,
            Ranking.EVENT_DIRTY_ORDER,
            Ranking.EVENT_ORDER_CHANGED,
        ]);
    };
    Ranking.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    Ranking.prototype.assignNewId = function (idGenerator) {
        this.id = fixCSS(idGenerator());
        this.columns.forEach(function (c) { return c.assignNewId(idGenerator); });
    };
    Ranking.prototype.getLabel = function () {
        return this.label;
    };
    Ranking.prototype.setLabel = function (value) {
        if (value === this.label) {
            return;
        }
        this.fire(Ranking.EVENT_LABEL_CHANGED, this.label, (this.label = value));
    };
    Ranking.prototype.setGroups = function (groups, index2pos, dirtyReason) {
        var old = this.order;
        var oldGroups = this.groups;
        this.groups = groups;
        this.index2pos = index2pos;
        this.order = joinIndexArrays(groups.map(function (d) { return d.order; }));
        // replace with subarrays to save memory
        if (groups.length > 1) {
            this.unifyGroups(groups);
        }
        else if (groups.length === 1) {
            // propagate to the top
            var p = groups[0].parent;
            while (p) {
                p.order = this.order;
                p = p.parent;
            }
        }
        this.fire([Ranking.EVENT_ORDER_CHANGED, Ranking.EVENT_GROUPS_CHANGED, Ranking.EVENT_DIRTY_VALUES, Ranking.EVENT_DIRTY], old, this.order, oldGroups, groups, dirtyReason);
    };
    Ranking.prototype.unifyGroups = function (groups) {
        var offset = 0;
        var order = this.order;
        var offsets = new Map();
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var group = groups_1[_i];
            var size = group.order.length;
            group.order = order.subarray(offset, offset + size);
            offsets.set(group, { offset: offset, size: size });
            offset += size;
        }
        // propagate also to the top with views
        var roots = groupRoots(groups);
        var resolve = function (g) {
            if (offsets.has(g)) {
                // leaf
                return offsets.get(g);
            }
            var subs = g.subGroups.map(function (gi) { return resolve(gi); });
            var offset = subs.length > 0 ? subs[0].offset : 0;
            var size = subs.reduce(function (a, b) { return a + b.size; }, 0);
            var r = { offset: offset, size: size };
            offsets.set(g, r);
            g.order = order.subarray(offset, offset + size);
            return r;
        };
        for (var _a = 0, roots_1 = roots; _a < roots_1.length; _a++) {
            var root = roots_1[_a];
            resolve(root);
        }
    };
    Ranking.prototype.getRank = function (dataIndex) {
        if (dataIndex < 0 || dataIndex > this.index2pos.length) {
            return -1;
        }
        var v = this.index2pos[dataIndex];
        return v != null && !Number.isNaN(v) && v > 0 ? v : -1;
    };
    Ranking.prototype.getOrder = function () {
        return this.order;
    };
    Ranking.prototype.getOrderLength = function () {
        return this.order.length;
    };
    Ranking.prototype.getGroups = function () {
        return this.groups.slice();
    };
    /**
     * Returns the flat group tree in depth first search (DFS).
     */
    Ranking.prototype.getFlatGroups = function () {
        var r = [];
        traverseGroupsDFS(this.groups, function (v) {
            r.push(v);
        });
        return r;
    };
    Ranking.prototype.dump = function (toDescRef) {
        var r = {};
        r.columns = this.columns.map(function (d) { return d.dump(toDescRef); });
        r.sortCriteria = this.sortCriteria.map(function (s) { return ({ asc: s.asc, sortBy: s.col.id }); });
        r.groupSortCriteria = this.groupSortCriteria.map(function (s) { return ({ asc: s.asc, sortBy: s.col.id }); });
        r.groupColumns = this.groupColumns.map(function (d) { return d.id; });
        return r;
    };
    Ranking.prototype.restore = function (dump, factory) {
        var _this = this;
        this.clear();
        (dump.columns || []).forEach(function (child) {
            var c = factory(child);
            if (c) {
                _this.push(c);
            }
        });
        // compatibility case
        if (dump.sortColumn && dump.sortColumn.sortBy) {
            var help = this.columns.find(function (d) { return d.id === dump.sortColumn.sortBy; });
            if (help) {
                this.sortBy(help, dump.sortColumn.asc);
            }
        }
        if (dump.groupColumns) {
            var groupColumns = dump.groupColumns
                .map(function (id) { return _this.columns.find(function (d) { return d.id === id; }); })
                .filter(function (d) { return d != null; });
            this.setGroupCriteria(groupColumns);
        }
        var restoreSortCriteria = function (dumped) {
            return dumped
                .map(function (s) {
                return {
                    asc: s.asc,
                    col: _this.columns.find(function (d) { return d.id === s.sortBy; }) || null,
                };
            })
                .filter(function (s) { return s.col; });
        };
        if (dump.sortCriteria) {
            this.setSortCriteria(restoreSortCriteria(dump.sortCriteria));
        }
        if (dump.groupSortCriteria) {
            this.setGroupSortCriteria(restoreSortCriteria(dump.groupSortCriteria));
        }
    };
    Ranking.prototype.flatten = function (r, offset, levelsToGo, padding) {
        if (levelsToGo === void 0) { levelsToGo = 0; }
        if (padding === void 0) { padding = 0; }
        var acc = offset; // + this.getWidth() + padding;
        if (levelsToGo > 0 || levelsToGo <= Column.FLAT_ALL_COLUMNS) {
            this.columns.forEach(function (c) {
                if (c.getVisible() && levelsToGo <= Column.FLAT_ALL_COLUMNS) {
                    acc += c.flatten(r, acc, levelsToGo - 1, padding) + padding;
                }
            });
        }
        return acc - offset;
    };
    Ranking.prototype.getPrimarySortCriteria = function () {
        if (this.sortCriteria.length === 0) {
            return null;
        }
        return this.sortCriteria[0];
    };
    Ranking.prototype.getSortCriteria = function () {
        return this.sortCriteria.map(function (d) { return Object.assign({}, d); });
    };
    Ranking.prototype.getGroupSortCriteria = function () {
        return this.groupSortCriteria.map(function (d) { return Object.assign({}, d); });
    };
    Ranking.prototype.toggleSorting = function (col) {
        return this.setSortCriteria(this.toggleSortingLogic(col, this.sortCriteria));
    };
    Ranking.prototype.toggleSortingLogic = function (col, sortCriteria) {
        var newSort = sortCriteria.slice();
        var current = newSort.findIndex(function (d) { return d.col === col; });
        var defaultAsc = isSortingAscByDefault(col);
        if (current < 0) {
            newSort.splice(0, newSort.length, { col: col, asc: defaultAsc });
        }
        else if (newSort[current].asc === defaultAsc) {
            // asc -> desc, or desc -> asc
            newSort.splice(current, 1, { col: col, asc: !defaultAsc });
        }
        else {
            // remove
            newSort.splice(current, 1);
        }
        return newSort;
    };
    Ranking.prototype.toggleGrouping = function (col) {
        var old = this.groupColumns.indexOf(col);
        if (old >= 0) {
            var newGroupings = this.groupColumns.slice();
            newGroupings.splice(old, 1);
            return this.setGroupCriteria(newGroupings);
        }
        return this.setGroupCriteria([col]);
    };
    Ranking.prototype.getGroupCriteria = function () {
        return this.groupColumns.slice();
    };
    /**
     * replaces, moves, or remove the given column in the sorting hierarchy
     * @param col
     * @param priority when priority < 0 remove the column only else replace at the given priority
     */
    Ranking.prototype.sortBy = function (col, ascending, priority) {
        if (ascending === void 0) { ascending = false; }
        if (priority === void 0) { priority = 0; }
        if (col.findMyRanker() !== this) {
            return false; //not one of mine
        }
        return this.setSortCriteria(this.hierarchyLogic(this.sortCriteria, this.sortCriteria.findIndex(function (d) { return d.col === col; }), { col: col, asc: ascending }, priority));
    };
    /**
     * replaces, moves, or remove the given column in the group sorting hierarchy
     * @param col
     * @param priority when priority < 0 remove the column only else replace at the given priority
     */
    Ranking.prototype.groupSortBy = function (col, ascending, priority) {
        if (ascending === void 0) { ascending = false; }
        if (priority === void 0) { priority = 0; }
        if (col.findMyRanker() !== this) {
            return false; //not one of mine
        }
        return this.setGroupSortCriteria(this.hierarchyLogic(this.groupSortCriteria, this.groupSortCriteria.findIndex(function (d) { return d.col === col; }), { col: col, asc: ascending }, priority));
    };
    Ranking.prototype.hierarchyLogic = function (entries, index, entry, priority) {
        entries = entries.slice();
        if (index >= 0) {
            // move at the other position
            entries.splice(index, 1);
            if (priority >= 0) {
                entries.splice(Math.min(priority, entries.length), 0, entry);
            }
        }
        else if (priority >= 0) {
            entries[Math.min(priority, entries.length)] = entry;
        }
        return entries;
    };
    /**
     * replaces, moves, or remove the given column in the grouping hierarchy
     * @param col
     * @param priority when priority < 0 remove the column only else replace at the given priority
     */
    Ranking.prototype.groupBy = function (col, priority) {
        if (priority === void 0) { priority = 0; }
        if (col.findMyRanker() !== this) {
            return false; //not one of mine
        }
        return this.setGroupCriteria(this.hierarchyLogic(this.groupColumns, this.groupColumns.indexOf(col), col, priority));
    };
    Ranking.prototype.setSortCriteria = function (value) {
        var _a;
        var _this = this;
        var values = Array.isArray(value) ? value.slice() : [value];
        var bak = this.sortCriteria.slice();
        if (equalCriteria(values, bak)) {
            return false;
        }
        // update listener
        bak.forEach(function (d) {
            d.col.on(Ranking.COLUMN_SORT_DIRTY, null);
        });
        values.forEach(function (d) {
            d.col.on(Ranking.COLUMN_SORT_DIRTY, _this.dirtyOrderSortDirty);
        });
        (_a = this.sortCriteria).splice.apply(_a, __spreadArray([0, this.sortCriteria.length], values.slice(), false));
        this.triggerResort(bak);
        return true;
    };
    Ranking.prototype.setGroupCriteria = function (column) {
        var _a;
        var _this = this;
        var cols = Array.isArray(column) ? column : [column];
        if (equalArrays(this.groupColumns, cols)) {
            return true; //same
        }
        this.groupColumns.forEach(function (groupColumn) {
            groupColumn.on(Ranking.COLUMN_GROUP_DIRTY, null);
        });
        var bak = this.groupColumns.slice();
        (_a = this.groupColumns).splice.apply(_a, __spreadArray([0, this.groupColumns.length], cols, false));
        this.groupColumns.forEach(function (groupColumn) {
            groupColumn.on(Ranking.COLUMN_GROUP_DIRTY, _this.dirtyOrderGroupDirty);
        });
        this.fire([
            Ranking.EVENT_GROUP_CRITERIA_CHANGED,
            Ranking.EVENT_DIRTY_ORDER,
            Ranking.EVENT_DIRTY_HEADER,
            Ranking.EVENT_DIRTY_VALUES,
            Ranking.EVENT_DIRTY_CACHES,
            Ranking.EVENT_DIRTY,
        ], bak, this.getGroupCriteria());
        this.autoAdaptAggregationColumn();
        return true;
    };
    Ranking.prototype.autoAdaptAggregationColumn = function () {
        // set column auto adds two levels
        var length = this.groupColumns.reduce(function (acc, c) { return acc + (c instanceof SetColumn ? 2 : 1); }, 0);
        var col = this.children.find(function (d) { return d instanceof AggregateGroupColumn; });
        if (!col) {
            return;
        }
        var targetWidth = length * AGGREGATION_LEVEL_WIDTH;
        if (targetWidth > col.getWidth()) {
            col.setWidth(targetWidth);
        }
    };
    Ranking.prototype.toggleGroupSorting = function (col) {
        return this.setGroupSortCriteria(this.toggleSortingLogic(col, this.groupSortCriteria));
    };
    Ranking.prototype.setGroupSortCriteria = function (value) {
        var _a;
        var _this = this;
        var values = Array.isArray(value) ? value.slice() : [value];
        var bak = this.groupSortCriteria.slice();
        if (equalCriteria(values, bak)) {
            return false;
        }
        bak.forEach(function (d) {
            d.col.on(Ranking.COLUMN_GROUP_SORT_DIRTY, null);
        });
        values.forEach(function (d) {
            d.col.on(Ranking.COLUMN_GROUP_SORT_DIRTY, _this.dirtyOrderGroupSortDirty);
        });
        (_a = this.groupSortCriteria).splice.apply(_a, __spreadArray([0, this.groupSortCriteria.length], values.slice(), false));
        this.triggerGroupResort(bak);
        return true;
    };
    Ranking.prototype.triggerGroupResort = function (bak) {
        var sortCriterias = this.getGroupSortCriteria();
        var bakMulti = Array.isArray(bak) ? bak : sortCriterias;
        this.fire([
            Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED,
            Ranking.EVENT_DIRTY_ORDER,
            Ranking.EVENT_DIRTY_HEADER,
            Ranking.EVENT_DIRTY_VALUES,
            Ranking.EVENT_DIRTY,
        ], bakMulti, sortCriterias);
    };
    Ranking.prototype.triggerResort = function (bak) {
        var sortCriterias = this.getSortCriteria();
        var bakMulti = Array.isArray(bak) ? bak : sortCriterias;
        this.fire([
            Ranking.EVENT_SORT_CRITERIA_CHANGED,
            Ranking.EVENT_DIRTY_ORDER,
            Ranking.EVENT_DIRTY_HEADER,
            Ranking.EVENT_DIRTY_VALUES,
            Ranking.EVENT_DIRTY,
        ], bakMulti, sortCriterias);
    };
    Object.defineProperty(Ranking.prototype, "children", {
        get: function () {
            return this.columns.slice();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ranking.prototype, "length", {
        get: function () {
            return this.columns.length;
        },
        enumerable: false,
        configurable: true
    });
    Ranking.prototype.insert = function (col, index) {
        var _this = this;
        if (index === void 0) { index = this.columns.length; }
        this.columns.splice(index, 0, col);
        col.attach(this);
        this.forward.apply(this, __spreadArray([col], Ranking.FORWARD_COLUMN_EVENTS, false));
        col.on("".concat(Ranking.EVENT_FILTER_CHANGED, ".order"), this.dirtyOrderFiltering);
        col.on("".concat(Column.EVENT_VISIBILITY_CHANGED, ".ranking"), function (oldValue, newValue) {
            return _this.fire([
                Ranking.EVENT_COLUMN_VISIBILITY_CHANGED,
                Ranking.EVENT_DIRTY_HEADER,
                Ranking.EVENT_DIRTY_VALUES,
                Ranking.EVENT_DIRTY,
            ], col, oldValue, newValue);
        });
        this.fire([Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_DIRTY_HEADER, Ranking.EVENT_DIRTY_VALUES, Ranking.EVENT_DIRTY], col, index);
        if (col.isFiltered()) {
            this.dirtyOrderFiltering();
        }
        return col;
    };
    Ranking.prototype.move = function (col, index) {
        if (index === void 0) { index = this.columns.length; }
        if (col.parent !== this) {
            // not a move operation!
            console.error('invalid move operation: ', col);
            return null;
        }
        var old = this.columns.indexOf(col);
        if (index === old) {
            // no move needed
            return col;
        }
        //delete first
        this.columns.splice(old, 1);
        // adapt target index based on previous index, i.e shift by one
        this.columns.splice(old < index ? index - 1 : index, 0, col);
        this.fire([Ranking.EVENT_MOVE_COLUMN, Ranking.EVENT_DIRTY_HEADER, Ranking.EVENT_DIRTY_VALUES, Ranking.EVENT_DIRTY], col, index, old);
        return col;
    };
    Ranking.prototype.moveAfter = function (col, reference) {
        var i = this.columns.indexOf(reference);
        if (i < 0) {
            return null;
        }
        return this.move(col, i + 1);
    };
    Ranking.prototype.moveBefore = function (col, reference) {
        var i = this.columns.indexOf(reference);
        if (i < 0) {
            return null;
        }
        return this.move(col, i);
    };
    Object.defineProperty(Ranking.prototype, "fqpath", {
        get: function () {
            return '';
        },
        enumerable: false,
        configurable: true
    });
    Ranking.prototype.findByPath = function (fqpath) {
        var p = this;
        var indices = fqpath.split('@').map(Number).slice(1); //ignore the first entry = ranking
        while (indices.length > 0) {
            var i = indices.shift();
            p = p.at(i);
        }
        return p;
    };
    Ranking.prototype.indexOf = function (col) {
        return this.columns.indexOf(col);
    };
    Ranking.prototype.at = function (index) {
        return this.columns[index];
    };
    Ranking.prototype.insertAfter = function (col, ref) {
        var i = this.columns.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.insert(col, i + 1);
    };
    Ranking.prototype.insertBefore = function (col, ref) {
        var i = this.columns.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.insert(col, i);
    };
    Ranking.prototype.push = function (col) {
        return this.insert(col);
    };
    Ranking.prototype.remove = function (col) {
        var i = this.columns.indexOf(col);
        if (i < 0) {
            return false;
        }
        this.unforward.apply(this, __spreadArray([col], Ranking.FORWARD_COLUMN_EVENTS, false));
        var isSortCriteria = this.sortCriteria.findIndex(function (d) { return d.col === col; });
        var sortCriteriaChanged = isSortCriteria >= 0;
        if (sortCriteriaChanged) {
            this.sortCriteria.splice(isSortCriteria, 1);
        }
        var isGroupSortCriteria = this.groupSortCriteria.findIndex(function (d) { return d.col === col; });
        var groupSortCriteriaChanged = isGroupSortCriteria >= 0;
        if (groupSortCriteriaChanged) {
            this.groupSortCriteria.splice(isGroupSortCriteria, 1);
        }
        var newGrouping = null;
        var isGroupColumn = this.groupColumns.indexOf(col);
        if (isGroupColumn >= 0) {
            // was my grouping criteria
            newGrouping = this.groupColumns.slice();
            newGrouping.splice(isGroupColumn, 1);
        }
        col.detach();
        this.columns.splice(i, 1);
        this.fire([Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_DIRTY_HEADER, Ranking.EVENT_DIRTY_VALUES, Ranking.EVENT_DIRTY], col, i);
        if (newGrouping) {
            this.setGroupCriteria(newGrouping);
        }
        else if (sortCriteriaChanged) {
            this.triggerResort(null);
        }
        else if (groupSortCriteriaChanged) {
            this.triggerGroupResort(null);
        }
        else if (col.isFiltered()) {
            this.dirtyOrderFiltering();
        }
        return true;
    };
    Ranking.prototype.clear = function () {
        var _this = this;
        if (this.columns.length === 0) {
            return;
        }
        this.sortCriteria.forEach(function (d) {
            d.col.on("".concat(Column.EVENT_DIRTY_CACHES, ".order"), null);
        });
        this.sortCriteria.splice(0, this.sortCriteria.length);
        this.groupSortCriteria.forEach(function (d) {
            d.col.on(Ranking.COLUMN_GROUP_SORT_DIRTY, null);
        });
        this.groupSortCriteria.splice(0, this.groupSortCriteria.length);
        this.groupColumns.forEach(function (d) {
            d.on(Ranking.COLUMN_GROUP_DIRTY, null);
        });
        this.groupColumns.splice(0, this.groupColumns.length);
        this.columns.forEach(function (col) {
            _this.unforward.apply(_this, __spreadArray([col], Ranking.FORWARD_COLUMN_EVENTS, false));
            col.detach();
        });
        var removed = this.columns.splice(0, this.columns.length);
        this.fire([
            Ranking.EVENT_REMOVE_COLUMN,
            Ranking.EVENT_DIRTY_ORDER,
            Ranking.EVENT_DIRTY_HEADER,
            Ranking.EVENT_DIRTY_VALUES,
            Ranking.EVENT_DIRTY,
        ], removed);
    };
    Object.defineProperty(Ranking.prototype, "flatColumns", {
        get: function () {
            var r = [];
            this.flatten(r, 0, Column.FLAT_ALL_COLUMNS);
            return r.map(function (d) { return d.col; });
        },
        enumerable: false,
        configurable: true
    });
    Ranking.prototype.find = function (idOrFilter) {
        var filter = typeof idOrFilter === 'string' ? function (col) { return col.id === idOrFilter; } : idOrFilter;
        var r = this.flatColumns;
        for (var _i = 0, r_1 = r; _i < r_1.length; _i++) {
            var v = r_1[_i];
            if (filter(v)) {
                return v;
            }
        }
        return null;
    };
    Ranking.prototype.isFiltered = function () {
        return this.columns.some(function (d) { return d.isFiltered(); });
    };
    Ranking.prototype.filter = function (row) {
        return this.columns.every(function (d) { return d.filter(row); });
    };
    Ranking.prototype.clearFilters = function () {
        return this.columns.map(function (d) { return d.clearFilter(); }).some(function (d) { return d; });
    };
    Ranking.prototype.findMyRanker = function () {
        return this;
    };
    Object.defineProperty(Ranking.prototype, "fqid", {
        get: function () {
            return this.id;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * marks the header, values, or both as dirty such that the values are reevaluated
     * @param type specify in more detail what is dirty, by default whole column
     */
    Ranking.prototype.markDirty = function (type) {
        if (type === void 0) { type = 'all'; }
        switch (type) {
            case 'header':
                return this.fire([Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY]);
            case 'values':
                return this.fire([Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY]);
            default:
                return this.fire([
                    Column.EVENT_DIRTY_HEADER,
                    Column.EVENT_DIRTY_VALUES,
                    Column.EVENT_DIRTY_CACHES,
                    Column.EVENT_DIRTY,
                ]);
        }
    };
    Ranking.EVENT_WIDTH_CHANGED = Column.EVENT_WIDTH_CHANGED;
    Ranking.EVENT_FILTER_CHANGED = 'filterChanged';
    Ranking.EVENT_LABEL_CHANGED = Column.EVENT_LABEL_CHANGED;
    Ranking.EVENT_ADD_COLUMN = CompositeColumn.EVENT_ADD_COLUMN;
    Ranking.EVENT_MOVE_COLUMN = CompositeColumn.EVENT_MOVE_COLUMN;
    Ranking.EVENT_REMOVE_COLUMN = CompositeColumn.EVENT_REMOVE_COLUMN;
    Ranking.EVENT_DIRTY = Column.EVENT_DIRTY;
    Ranking.EVENT_DIRTY_HEADER = Column.EVENT_DIRTY_HEADER;
    Ranking.EVENT_DIRTY_VALUES = Column.EVENT_DIRTY_VALUES;
    Ranking.EVENT_DIRTY_CACHES = Column.EVENT_DIRTY_CACHES;
    Ranking.EVENT_COLUMN_VISIBILITY_CHANGED = Column.EVENT_VISIBILITY_CHANGED;
    Ranking.EVENT_SORT_CRITERIA_CHANGED = 'sortCriteriaChanged';
    Ranking.EVENT_GROUP_CRITERIA_CHANGED = 'groupCriteriaChanged';
    Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED = 'groupSortCriteriaChanged';
    Ranking.EVENT_DIRTY_ORDER = 'dirtyOrder';
    Ranking.EVENT_ORDER_CHANGED = 'orderChanged';
    Ranking.EVENT_GROUPS_CHANGED = 'groupsChanged';
    Ranking.FORWARD_COLUMN_EVENTS = suffix('.ranking', Column.EVENT_VISIBILITY_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY_CACHES, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY, Column.EVENT_VISIBILITY_CHANGED, Ranking.EVENT_FILTER_CHANGED);
    Ranking.COLUMN_GROUP_SORT_DIRTY = suffix('.groupOrder', Column.EVENT_DIRTY_CACHES, 'sortMethodChanged');
    Ranking.COLUMN_SORT_DIRTY = suffix('.order', Column.EVENT_DIRTY_CACHES);
    Ranking.COLUMN_GROUP_DIRTY = suffix('.group', Column.EVENT_DIRTY_CACHES, 'groupingChanged');
    return Ranking;
}(AEventDispatcher));
export default Ranking;
function equalCriteria(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every(function (ai, i) {
        var bi = b[i];
        return ai.col === bi.col && ai.asc === bi.asc;
    });
}
//# sourceMappingURL=Ranking.js.map