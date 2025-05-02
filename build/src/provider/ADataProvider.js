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
import { AEventDispatcher, debounce, OrderedSet, suffix, } from '../internal';
import { Column, Ranking, AggregateGroupColumn, createAggregateDesc, isSupportType, EDirtyReason, RankColumn, createRankDesc, createSelectionDesc, EAggregationState, } from '../model';
import { models } from '../model/models';
import { forEachIndices, everyIndices, toGroupID, unifyParents } from '../model/internal';
import { SCHEMA_REF, } from './interfaces';
import { exportRanking, map2Object, object2Map, exportTable, isPromiseLike } from './utils';
import { restoreCategoricalColorMapping } from '../model/CategoricalColorMappingFunction';
import { createColorMappingFunction, colorMappingFunctions } from '../model/ColorMappingFunction';
import { createMappingFunction, mappingFunctions } from '../model/MappingFunction';
import { convertAggregationState } from './internal';
function toDirtyReason(ctx) {
    var primary = ctx.primaryType;
    switch (primary || '') {
        case Ranking.EVENT_DIRTY_ORDER:
            return ctx.args[0] || [EDirtyReason.UNKNOWN];
        case Ranking.EVENT_SORT_CRITERIA_CHANGED:
            return [EDirtyReason.SORT_CRITERIA_CHANGED];
        case Ranking.EVENT_GROUP_CRITERIA_CHANGED:
            return [EDirtyReason.GROUP_CRITERIA_CHANGED];
        case Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED:
            return [EDirtyReason.GROUP_SORT_CRITERIA_CHANGED];
        default:
            return [EDirtyReason.UNKNOWN];
    }
}
function mergeDirtyOrderContext(current, next) {
    var currentReason = toDirtyReason(current.self);
    var nextReason = toDirtyReason(next.self);
    var combined = new Set(currentReason);
    for (var _i = 0, nextReason_1 = nextReason; _i < nextReason_1.length; _i++) {
        var r = nextReason_1[_i];
        combined.add(r);
    }
    var args = [Array.from(combined)];
    return {
        self: {
            primaryType: Ranking.EVENT_DIRTY_ORDER,
            args: args,
        },
        args: args,
    };
}
/**
 * a basic data provider holding the data and rankings
 */
var ADataProvider = /** @class */ (function (_super) {
    __extends(ADataProvider, _super);
    function ADataProvider(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        /**
         * all rankings
         * @type {Array}
         * @private
         */
        _this.rankings = [];
        /**
         * the current selected indices
         * @type {OrderedSet}
         */
        _this.selection = new OrderedSet();
        //Map<ranking.id@group.name, -1=expand,0=collapse,N=topN>
        _this.aggregations = new Map(); // not part of = show all
        _this.uid = 0;
        _this.options = {
            columnTypes: {},
            colorMappingFunctionTypes: {},
            mappingFunctionTypes: {},
            singleSelection: false,
            showTopN: 10,
            aggregationStrategy: 'item',
            propagateAggregationState: true,
        };
        Object.assign(_this.options, options);
        _this.columnTypes = Object.assign(models(), _this.options.columnTypes);
        _this.colorMappingFunctionTypes = Object.assign(colorMappingFunctions(), _this.options.colorMappingFunctionTypes);
        _this.mappingFunctionTypes = Object.assign(mappingFunctions(), _this.options.mappingFunctionTypes);
        _this.showTopN = _this.options.showTopN;
        _this.typeFactory = _this.createTypeFactory();
        return _this;
    }
    ADataProvider.prototype.createTypeFactory = function () {
        var _this = this;
        var factory = (function (d) {
            var desc = _this.fromDescRef(d.desc);
            if (!desc || !desc.type) {
                console.warn('cannot restore column dump', d);
                return new Column(d.id || '', d.desc || {});
            }
            _this.fixDesc(desc);
            var type = _this.columnTypes[desc.type];
            if (type == null) {
                console.warn('invalid column type in column dump using column', d);
                return new Column(d.id || '', desc);
            }
            var c = _this.instantiateColumn(type, '', desc, _this.typeFactory);
            c.restore(d, factory);
            return _this.patchColumn(c);
        });
        factory.colorMappingFunction = createColorMappingFunction(this.colorMappingFunctionTypes, factory);
        factory.mappingFunction = createMappingFunction(this.mappingFunctionTypes);
        factory.categoricalColorMappingFunction = restoreCategoricalColorMapping;
        return factory;
    };
    ADataProvider.prototype.getTypeFactory = function () {
        return this.typeFactory;
    };
    /**
     * events:
     *  * column changes: addColumn, removeColumn
     *  * ranking changes: addRanking, removeRanking
     *  * dirty: dirty, dirtyHeder, dirtyValues
     *  * selectionChanged
     * @returns {string[]}
     */
    ADataProvider.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            ADataProvider.EVENT_DATA_CHANGED,
            ADataProvider.EVENT_BUSY,
            ADataProvider.EVENT_SHOWTOPN_CHANGED,
            ADataProvider.EVENT_ADD_COLUMN,
            ADataProvider.EVENT_REMOVE_COLUMN,
            ADataProvider.EVENT_MOVE_COLUMN,
            ADataProvider.EVENT_ADD_RANKING,
            ADataProvider.EVENT_REMOVE_RANKING,
            ADataProvider.EVENT_DIRTY,
            ADataProvider.EVENT_DIRTY_HEADER,
            ADataProvider.EVENT_DIRTY_VALUES,
            ADataProvider.EVENT_DIRTY_CACHES,
            ADataProvider.EVENT_ORDER_CHANGED,
            ADataProvider.EVENT_SELECTION_CHANGED,
            ADataProvider.EVENT_ADD_DESC,
            ADataProvider.EVENT_CLEAR_DESC,
            ADataProvider.EVENT_JUMP_TO_NEAREST,
            ADataProvider.EVENT_GROUP_AGGREGATION_CHANGED,
        ]);
    };
    ADataProvider.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    /**
     * adds a new ranking
     * @param existing an optional existing ranking to clone
     * @return the new ranking
     */
    ADataProvider.prototype.pushRanking = function (existing) {
        var r = this.cloneRanking(existing);
        this.insertRanking(r);
        return r;
    };
    ADataProvider.prototype.fireBusy = function (busy) {
        this.fire(ADataProvider.EVENT_BUSY, busy);
    };
    ADataProvider.prototype.takeSnapshot = function (col) {
        var _this = this;
        this.fireBusy(true);
        var r = this.cloneRanking();
        var ranking = col.findMyRanker();
        // by convention copy all support types and the first string column
        var hasString = col.desc.type === 'string';
        var hasColumn = false;
        var toClone = !ranking
            ? [col]
            : ranking.children.filter(function (c) {
                if (c === col) {
                    hasColumn = true;
                    return true;
                }
                if (!hasString && c.desc.type === 'string') {
                    hasString = true;
                    return true;
                }
                return isSupportType(c);
            });
        if (!hasColumn) {
            // maybe a nested one thus not in the top level
            toClone.push(col);
        }
        toClone.forEach(function (c) {
            var clone = _this.clone(c);
            r.push(clone);
            if (c === col) {
                clone.sortByMe();
            }
        });
        this.insertRanking(r);
        this.fireBusy(false);
        return r;
    };
    ADataProvider.prototype.insertRanking = function (r, index) {
        if (index === void 0) { index = this.rankings.length; }
        this.rankings.splice(index, 0, r);
        this.forward.apply(this, __spreadArray([r], ADataProvider.FORWARD_RANKING_EVENTS, false));
        //delayed reordering per ranking
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        r.on("".concat(Ranking.EVENT_DIRTY_ORDER, ".provider"), debounce(function () {
            that.triggerReorder(r, toDirtyReason(this));
        }, 100, mergeDirtyOrderContext));
        this.fire([
            ADataProvider.EVENT_ADD_RANKING,
            ADataProvider.EVENT_DIRTY_HEADER,
            ADataProvider.EVENT_DIRTY_VALUES,
            ADataProvider.EVENT_DIRTY,
        ], r, index);
        this.triggerReorder(r);
    };
    ADataProvider.prototype.triggerReorder = function (ranking, dirtyReason) {
        var _this = this;
        this.fireBusy(true);
        var reason = dirtyReason || [EDirtyReason.UNKNOWN];
        Promise.resolve(this.sort(ranking, reason)).then(function (_a) {
            var groups = _a.groups, index2pos = _a.index2pos;
            if (ranking.getGroupSortCriteria().length === 0) {
                groups = unifyParents(groups);
            }
            _this.initAggregateState(ranking, groups);
            ranking.setGroups(groups, index2pos, reason);
            _this.fireBusy(false);
        });
    };
    /**
     * removes a ranking from this data provider
     * @param ranking
     * @returns {boolean}
     */
    ADataProvider.prototype.removeRanking = function (ranking) {
        var i = this.rankings.indexOf(ranking);
        if (i < 0) {
            return false;
        }
        this.unforward.apply(this, __spreadArray([ranking], ADataProvider.FORWARD_RANKING_EVENTS, false));
        this.rankings.splice(i, 1);
        ranking.on("".concat(Ranking.EVENT_DIRTY_ORDER, ".provider"), null);
        this.cleanUpRanking(ranking);
        this.fire([
            ADataProvider.EVENT_REMOVE_RANKING,
            ADataProvider.EVENT_DIRTY_HEADER,
            ADataProvider.EVENT_DIRTY_VALUES,
            ADataProvider.EVENT_DIRTY,
        ], ranking, i);
        return true;
    };
    /**
     * removes all rankings
     */
    ADataProvider.prototype.clearRankings = function () {
        var _this = this;
        this.rankings.forEach(function (ranking) {
            _this.unforward.apply(_this, __spreadArray([ranking], ADataProvider.FORWARD_RANKING_EVENTS, false));
            ranking.on("".concat(Ranking.EVENT_DIRTY_ORDER, ".provider"), null);
            _this.cleanUpRanking(ranking);
        });
        // clear
        this.rankings.splice(0, this.rankings.length);
        this.fire([
            ADataProvider.EVENT_REMOVE_RANKING,
            ADataProvider.EVENT_DIRTY_HEADER,
            ADataProvider.EVENT_DIRTY_VALUES,
            ADataProvider.EVENT_DIRTY,
        ], null, -1);
    };
    ADataProvider.prototype.clearFilters = function () {
        this.rankings.forEach(function (ranking) { return ranking.clearFilters(); });
    };
    /**
     * returns a list of all current rankings
     * @returns {Ranking[]}
     */
    ADataProvider.prototype.getRankings = function () {
        return this.rankings.slice();
    };
    /**
     * returns the last ranking for quicker access
     * @returns {Ranking}
     */
    ADataProvider.prototype.getFirstRanking = function () {
        return this.rankings[0] || null;
    };
    /**
     * returns the last ranking for quicker access
     * @returns {Ranking}
     */
    ADataProvider.prototype.getLastRanking = function () {
        return this.rankings[this.rankings.length - 1];
    };
    ADataProvider.prototype.ensureOneRanking = function () {
        if (this.rankings.length === 0) {
            var r = this.pushRanking();
            this.push(r, createRankDesc());
        }
    };
    ADataProvider.prototype.destroy = function () {
        // dummy
    };
    /**
     * hook method for cleaning up a ranking
     * @param _ranking
     */
    ADataProvider.prototype.cleanUpRanking = function (_ranking) {
        // dummy
    };
    /**
     * adds a column to a ranking described by its column description
     * @param ranking the ranking to add the column to
     * @param desc the description of the column
     * @return {Column} the newly created column or null
     */
    ADataProvider.prototype.push = function (ranking, desc) {
        var r = this.create(desc);
        if (r) {
            ranking.push(r);
            return r;
        }
        return null;
    };
    /**
     * adds a column to a ranking described by its column description
     * @param ranking the ranking to add the column to
     * @param index the position to insert the column
     * @param desc the description of the column
     * @return {Column} the newly created column or null
     */
    ADataProvider.prototype.insert = function (ranking, index, desc) {
        var r = this.create(desc);
        if (r) {
            ranking.insert(r, index);
            return r;
        }
        return null;
    };
    /**
     * creates a new unique id for a column
     * @returns {string}
     */
    ADataProvider.prototype.nextId = function () {
        return "col".concat(this.uid++);
    };
    ADataProvider.prototype.fixDesc = function (desc) {
        var _this = this;
        //hacks for provider dependent descriptors
        if (desc.type === 'selection') {
            desc.accessor = function (row) { return _this.isSelected(row.i); };
            desc.setter = function (index, value) {
                return value ? _this.select(index) : _this.deselect(index);
            };
            desc.setterAll = function (indices, value) {
                return value ? _this.selectAll(indices) : _this.deselectAll(indices);
            };
        }
        else if (desc.type === 'aggregate') {
            desc.isAggregated = function (ranking, group) {
                return _this.getAggregationState(ranking, group);
            };
            desc.setAggregated = function (ranking, group, value) {
                return _this.setAggregationState(ranking, group, value);
            };
        }
        return desc;
    };
    ADataProvider.prototype.cleanDesc = function (desc) {
        //hacks for provider dependent descriptors
        if (desc.type === 'selection') {
            delete desc.accessor;
            delete desc.setter;
            delete desc.setterAll;
        }
        else if (desc.type === 'aggregate') {
            delete desc.isAggregated;
            delete desc.setAggregated;
        }
        return desc;
    };
    /**
     * creates an internal column model out of the given column description
     * @param desc
     * @returns {Column} the new column or null if it can't be created
     */
    ADataProvider.prototype.create = function (desc) {
        this.fixDesc(desc);
        //find by type and instantiate
        var type = this.columnTypes[desc.type];
        if (type) {
            return this.patchColumn(this.instantiateColumn(type, this.nextId(), desc, this.typeFactory));
        }
        return null;
    };
    ADataProvider.prototype.patchColumn = function (column) {
        // hook for adapting columns
        return column;
    };
    ADataProvider.prototype.instantiateColumn = function (type, id, desc, typeFactory) {
        return new type(id, desc, typeFactory);
    };
    /**
     * clones a column by dumping and restoring
     * @param col
     * @returns {Column}
     */
    ADataProvider.prototype.clone = function (col) {
        var dump = this.dumpColumn(col);
        return this.restoreColumn(dump);
    };
    /**
     * restores a column from a dump
     * @param dump
     * @returns {Column}
     */
    ADataProvider.prototype.restoreColumn = function (dump) {
        var c = this.typeFactory(dump);
        c.assignNewId(this.nextId.bind(this));
        return c;
    };
    /**
     * finds a column in all rankings returning the first match
     * @param idOrFilter by id or by a filter function
     * @returns {Column}
     */
    ADataProvider.prototype.find = function (idOrFilter) {
        //convert to function
        var filter = typeof idOrFilter === 'string' ? function (col) { return col.id === idOrFilter; } : idOrFilter;
        for (var _i = 0, _a = this.rankings; _i < _a.length; _i++) {
            var ranking = _a[_i];
            var r = ranking.find(filter);
            if (r) {
                return r;
            }
        }
        return null;
    };
    /**
     * dumps this whole provider including selection and the rankings
     * @returns {{uid: number, selection: number[], rankings: *[]}}
     */
    ADataProvider.prototype.dump = function () {
        var _this = this;
        return {
            $schema: SCHEMA_REF,
            uid: this.uid,
            selection: this.getSelection(),
            aggregations: map2Object(this.aggregations),
            rankings: this.rankings.map(function (r) { return r.dump(_this.toDescRef.bind(_this)); }),
            showTopN: this.showTopN,
        };
    };
    /**
     * dumps a specific column
     */
    ADataProvider.prototype.dumpColumn = function (col) {
        return col.dump(this.toDescRef.bind(this));
    };
    /**
     * for better dumping describe reference, by default just return the description
     */
    ADataProvider.prototype.toDescRef = function (desc) {
        return desc;
    };
    /**
     * inverse operation of toDescRef
     */
    ADataProvider.prototype.fromDescRef = function (descRef) {
        return descRef;
    };
    ADataProvider.prototype.restoreRanking = function (dump) {
        var ranking = this.cloneRanking();
        ranking.restore(dump, this.typeFactory);
        var idGenerator = this.nextId.bind(this);
        ranking.children.forEach(function (c) { return c.assignNewId(idGenerator); });
        return ranking;
    };
    ADataProvider.prototype.restore = function (dump) {
        var _this = this;
        //clean old
        this.clearRankings();
        //restore selection
        this.uid = dump.uid || 0;
        if (dump.selection) {
            dump.selection.forEach(function (s) { return _this.selection.add(s); });
        }
        if (dump.showTopN != null) {
            this.showTopN = dump.showTopN;
        }
        if (dump.aggregations) {
            this.aggregations.clear();
            if (Array.isArray(dump.aggregations)) {
                dump.aggregations.forEach(function (a) { return _this.aggregations.set(a, 0); });
            }
            else {
                object2Map(dump.aggregations).forEach(function (v, k) { return _this.aggregations.set(k, v); });
            }
        }
        //restore rankings
        if (dump.rankings) {
            dump.rankings.forEach(function (r) {
                var ranking = _this.cloneRanking();
                ranking.restore(r, _this.typeFactory);
                //if no rank column add one
                if (!ranking.children.some(function (d) { return d instanceof RankColumn; })) {
                    ranking.insert(_this.create(createRankDesc()), 0);
                }
                _this.insertRanking(ranking);
            });
        }
        //assign new ids
        var idGenerator = this.nextId.bind(this);
        this.rankings.forEach(function (r) {
            r.children.forEach(function (c) { return c.assignNewId(idGenerator); });
        });
    };
    /**
     * generates a default ranking by using all column descriptions ones
     */
    ADataProvider.prototype.deriveDefault = function (addSupportType) {
        var _this = this;
        if (addSupportType === void 0) { addSupportType = true; }
        var r = this.pushRanking();
        if (addSupportType) {
            r.push(this.create(createAggregateDesc()));
            r.push(this.create(createRankDesc()));
            if (this.options.singleSelection !== true) {
                r.push(this.create(createSelectionDesc()));
            }
        }
        this.getColumns().forEach(function (col) {
            var c = _this.create(col);
            if (!c || isSupportType(c)) {
                return;
            }
            r.push(c);
        });
        return r;
    };
    ADataProvider.prototype.isAggregated = function (ranking, group) {
        return this.getTopNAggregated(ranking, group) >= 0;
    };
    ADataProvider.prototype.getAggregationState = function (ranking, group) {
        var n = this.getTopNAggregated(ranking, group);
        return n < 0 ? EAggregationState.EXPAND : n === 0 ? EAggregationState.COLLAPSE : EAggregationState.EXPAND_TOP_N;
    };
    ADataProvider.prototype.setAggregated = function (ranking, group, value) {
        return this.setAggregationState(ranking, group, value ? EAggregationState.COLLAPSE : EAggregationState.EXPAND);
    };
    ADataProvider.prototype.setAggregationState = function (ranking, group, value) {
        this.setTopNAggregated(ranking, group, value === EAggregationState.COLLAPSE ? 0 : value === EAggregationState.EXPAND_TOP_N ? this.showTopN : -1);
    };
    ADataProvider.prototype.getTopNAggregated = function (ranking, group) {
        var g = group;
        while (g) {
            var key = "".concat(ranking.id, "@").concat(toGroupID(g));
            if (this.aggregations.has(key)) {
                // propagate to leaf
                var v = this.aggregations.get(key);
                if (this.options.propagateAggregationState && group !== g) {
                    this.aggregations.set("".concat(ranking.id, "@").concat(toGroupID(group)), v);
                }
                return v;
            }
            g = g.parent;
        }
        return -1;
    };
    ADataProvider.prototype.unaggregateParents = function (ranking, group) {
        var g = group.parent;
        var changed = false;
        while (g) {
            changed = this.aggregations.delete("".concat(ranking.id, "@").concat(toGroupID(g))) || changed;
            g = g.parent;
        }
        return changed;
    };
    ADataProvider.prototype.getAggregationStrategy = function () {
        return this.options.aggregationStrategy;
    };
    ADataProvider.prototype.initAggregateState = function (ranking, groups) {
        var initial = -1;
        switch (this.getAggregationStrategy()) {
            case 'group':
                initial = 0;
                break;
            case 'item':
            case 'group+item':
            case 'group+item+top':
                initial = -1;
                break;
            case 'group+top+item':
                initial = this.showTopN;
                break;
        }
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var group = groups_1[_i];
            var key = "".concat(ranking.id, "@").concat(toGroupID(group));
            if (!this.aggregations.has(key) && initial >= 0) {
                this.aggregations.set(key, initial);
            }
        }
    };
    ADataProvider.prototype.setTopNAggregated = function (ranking, group, value) {
        var groups = Array.isArray(group) ? group : [group];
        var changed = [];
        var previous = [];
        var changedParents = false;
        for (var i = 0; i < groups.length; i++) {
            var group_1 = groups[i];
            var target = typeof value === 'number' ? value : value[i];
            changedParents = this.unaggregateParents(ranking, group_1) || changedParents;
            var current = this.getTopNAggregated(ranking, group_1);
            if (current === target) {
                continue;
            }
            changed.push(group_1);
            previous.push(current);
            var key = "".concat(ranking.id, "@").concat(toGroupID(group_1));
            if (target >= 0) {
                this.aggregations.set(key, target);
            }
            else {
                this.aggregations.delete(key);
            }
        }
        if (!changedParents && changed.length === 0) {
            // no change
            return;
        }
        if (!Array.isArray(group)) {
            // single change
            this.fire([ADataProvider.EVENT_GROUP_AGGREGATION_CHANGED, ADataProvider.EVENT_DIRTY_VALUES, ADataProvider.EVENT_DIRTY], ranking, group, previous.length === 0 ? value : previous[0], value);
        }
        else {
            this.fire([ADataProvider.EVENT_GROUP_AGGREGATION_CHANGED, ADataProvider.EVENT_DIRTY_VALUES, ADataProvider.EVENT_DIRTY], ranking, group, previous, value);
        }
    };
    ADataProvider.prototype.aggregateAllOf = function (ranking, aggregateAll, groups) {
        if (groups === void 0) { groups = ranking.getGroups(); }
        var value = convertAggregationState(aggregateAll, this.showTopN);
        this.setTopNAggregated(ranking, groups, value);
    };
    ADataProvider.prototype.getShowTopN = function () {
        return this.showTopN;
    };
    ADataProvider.prototype.setShowTopN = function (value) {
        if (this.showTopN === value) {
            return;
        }
        // update entries
        for (var _i = 0, _a = Array.from(this.aggregations.entries()); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], v = _b[1];
            if (v === this.showTopN) {
                this.aggregations.set(k, value);
            }
        }
        this.fire([ADataProvider.EVENT_SHOWTOPN_CHANGED, ADataProvider.EVENT_DIRTY_VALUES, ADataProvider.EVENT_DIRTY], this.showTopN, (this.showTopN = value));
    };
    /**
     * is the given row selected
     * @param index
     * @return {boolean}
     */
    ADataProvider.prototype.isSelected = function (index) {
        return this.selection.has(index);
    };
    /**
     * also select the given row
     * @param index
     */
    ADataProvider.prototype.select = function (index) {
        if (this.selection.has(index)) {
            return; //no change
        }
        if (this.options.singleSelection === true && this.selection.size > 0) {
            this.selection.clear();
        }
        this.selection.add(index);
        this.fire(ADataProvider.EVENT_SELECTION_CHANGED, this.getSelection());
    };
    ADataProvider.prototype.jumpToNearest = function (indices) {
        if (indices.length === 0) {
            return;
        }
        this.fire(ADataProvider.EVENT_JUMP_TO_NEAREST, indices);
    };
    /**
     * also select all the given rows
     * @param indices
     */
    ADataProvider.prototype.selectAll = function (indices) {
        var _this = this;
        if (everyIndices(indices, function (i) { return _this.selection.has(i); })) {
            return; //no change
        }
        if (this.options.singleSelection === true) {
            this.selection.clear();
            if (indices.length > 0) {
                this.selection.add(indices[0]);
            }
        }
        else {
            forEachIndices(indices, function (index) {
                _this.selection.add(index);
            });
        }
        this.fire(ADataProvider.EVENT_SELECTION_CHANGED, this.getSelection());
    };
    ADataProvider.prototype.selectAllOf = function (ranking) {
        this.setSelection(Array.from(ranking.getOrder()));
    };
    /**
     * set the selection to the given rows
     * @param indices
     */
    ADataProvider.prototype.setSelection = function (indices) {
        var _this = this;
        if (indices.length === 0) {
            return this.clearSelection();
        }
        if (this.selection.size === indices.length && indices.every(function (i) { return _this.selection.has(i); })) {
            return; //no change
        }
        this.selection.clear();
        this.selectAll(indices);
    };
    /**
     * toggles the selection of the given data index
     * @param index
     * @param additional just this element or all
     * @returns {boolean} whether the index is currently selected
     */
    ADataProvider.prototype.toggleSelection = function (index, additional) {
        if (additional === void 0) { additional = false; }
        if (this.isSelected(index)) {
            if (additional) {
                this.deselect(index);
            }
            else {
                this.clearSelection();
            }
            return false;
        }
        if (additional) {
            this.select(index);
        }
        else {
            this.setSelection([index]);
        }
        return true;
    };
    /**
     * deselect the given row
     * @param index
     */
    ADataProvider.prototype.deselect = function (index) {
        if (!this.selection.has(index)) {
            return; //no change
        }
        this.selection.delete(index);
        this.fire(ADataProvider.EVENT_SELECTION_CHANGED, this.getSelection());
    };
    /**
     * also select all the given rows
     * @param indices
     */
    ADataProvider.prototype.deselectAll = function (indices) {
        var _this = this;
        if (everyIndices(indices, function (i) { return !_this.selection.has(i); })) {
            return; //no change
        }
        forEachIndices(indices, function (index) {
            _this.selection.delete(index);
        });
        this.fire(ADataProvider.EVENT_SELECTION_CHANGED, this.getSelection());
    };
    /**
     * returns a promise containing the selected rows
     * @return {Promise<any[]>}
     */
    ADataProvider.prototype.selectedRows = function () {
        if (this.selection.size === 0) {
            return [];
        }
        return this.view(this.getSelection());
    };
    /**
     * returns the currently selected indices
     * @returns {Array}
     */
    ADataProvider.prototype.getSelection = function () {
        return Array.from(this.selection);
    };
    /**
     * clears the selection
     */
    ADataProvider.prototype.clearSelection = function () {
        if (this.selection.size === 0) {
            return; //no change
        }
        this.selection.clear();
        this.fire(ADataProvider.EVENT_SELECTION_CHANGED, [], false);
    };
    /**
     * utility to export a ranking to a table with the given separator
     * @param ranking
     * @param options
     * @returns {Promise<string>}
     */
    ADataProvider.prototype.exportTable = function (ranking, options) {
        if (options === void 0) { options = {}; }
        var data = this.view(ranking.getOrder());
        if (isPromiseLike(data)) {
            return data.then(function (dataImpl) { return exportRanking(ranking, dataImpl, options); });
        }
        return exportRanking(ranking, data, options);
    };
    /**
     * utility to export the selection within the given ranking to a table with the given separator
     * @param ranking
     * @param options
     * @returns {Promise<string>}
     */
    ADataProvider.prototype.exportSelection = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var selection = this.getSelection();
        var ranking = options.ranking || this.getFirstRanking();
        if (!ranking) {
            return '';
        }
        var rows = selection.map(function (s) { return _this.getRow(s); });
        if (rows.some(function (row) { return isPromiseLike(row); })) {
            return Promise.all(rows).then(function (data) {
                return exportTable(ranking, data, options);
            });
        }
        return exportTable(ranking, rows, options);
    };
    ADataProvider.EVENT_SELECTION_CHANGED = 'selectionChanged';
    ADataProvider.EVENT_DATA_CHANGED = 'dataChanged';
    ADataProvider.EVENT_ADD_COLUMN = Ranking.EVENT_ADD_COLUMN;
    ADataProvider.EVENT_MOVE_COLUMN = Ranking.EVENT_MOVE_COLUMN;
    ADataProvider.EVENT_REMOVE_COLUMN = Ranking.EVENT_REMOVE_COLUMN;
    ADataProvider.EVENT_ADD_RANKING = 'addRanking';
    ADataProvider.EVENT_REMOVE_RANKING = 'removeRanking';
    ADataProvider.EVENT_DIRTY = Ranking.EVENT_DIRTY;
    ADataProvider.EVENT_DIRTY_HEADER = Ranking.EVENT_DIRTY_HEADER;
    ADataProvider.EVENT_DIRTY_VALUES = Ranking.EVENT_DIRTY_VALUES;
    ADataProvider.EVENT_DIRTY_CACHES = Ranking.EVENT_DIRTY_CACHES;
    ADataProvider.EVENT_ORDER_CHANGED = Ranking.EVENT_ORDER_CHANGED;
    ADataProvider.EVENT_SHOWTOPN_CHANGED = 'showTopNChanged';
    ADataProvider.EVENT_ADD_DESC = 'addDesc';
    ADataProvider.EVENT_CLEAR_DESC = 'clearDesc';
    ADataProvider.EVENT_REMOVE_DESC = 'removeDesc';
    ADataProvider.EVENT_JUMP_TO_NEAREST = 'jumpToNearest';
    ADataProvider.EVENT_GROUP_AGGREGATION_CHANGED = AggregateGroupColumn.EVENT_AGGREGATE;
    ADataProvider.EVENT_BUSY = 'busy';
    ADataProvider.FORWARD_RANKING_EVENTS = suffix('.provider', Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_DIRTY, Ranking.EVENT_DIRTY_HEADER, Ranking.EVENT_MOVE_COLUMN, Ranking.EVENT_ORDER_CHANGED, Ranking.EVENT_DIRTY_VALUES, Ranking.EVENT_DIRTY_CACHES);
    return ADataProvider;
}(AEventDispatcher));
export default ADataProvider;
//# sourceMappingURL=ADataProvider.js.map