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
    const primary = ctx.primaryType;
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
    const currentReason = toDirtyReason(current.self);
    const nextReason = toDirtyReason(next.self);
    const combined = new Set(currentReason);
    for (const r of nextReason) {
        combined.add(r);
    }
    const args = [Array.from(combined)];
    return {
        self: {
            primaryType: Ranking.EVENT_DIRTY_ORDER,
            args,
        },
        args,
    };
}
/**
 * a basic data provider holding the data and rankings
 */
class ADataProvider extends AEventDispatcher {
    constructor(options = {}) {
        super();
        /**
         * all rankings
         * @type {Array}
         * @private
         */
        this.rankings = [];
        /**
         * the current selected indices
         * @type {OrderedSet}
         */
        this.selection = new OrderedSet();
        //Map<ranking.id@group.name, -1=expand,0=collapse,N=topN>
        this.aggregations = new Map(); // not part of = show all
        this.uid = 0;
        this.options = {
            columnTypes: {},
            colorMappingFunctionTypes: {},
            mappingFunctionTypes: {},
            singleSelection: false,
            showTopN: 10,
            aggregationStrategy: 'item',
            propagateAggregationState: true,
        };
        Object.assign(this.options, options);
        this.columnTypes = Object.assign(models(), this.options.columnTypes);
        this.colorMappingFunctionTypes = Object.assign(colorMappingFunctions(), this.options.colorMappingFunctionTypes);
        this.mappingFunctionTypes = Object.assign(mappingFunctions(), this.options.mappingFunctionTypes);
        this.showTopN = this.options.showTopN;
        this.typeFactory = this.createTypeFactory();
    }
    createTypeFactory() {
        const factory = ((d) => {
            const desc = this.fromDescRef(d.desc);
            if (!desc || !desc.type) {
                console.warn('cannot restore column dump', d);
                return new Column(d.id || '', d.desc || {});
            }
            this.fixDesc(desc);
            const type = this.columnTypes[desc.type];
            if (type == null) {
                console.warn('invalid column type in column dump using column', d);
                return new Column(d.id || '', desc);
            }
            const c = this.instantiateColumn(type, '', desc, this.typeFactory);
            c.restore(d, factory);
            return this.patchColumn(c);
        });
        factory.colorMappingFunction = createColorMappingFunction(this.colorMappingFunctionTypes, factory);
        factory.mappingFunction = createMappingFunction(this.mappingFunctionTypes);
        factory.categoricalColorMappingFunction = restoreCategoricalColorMapping;
        return factory;
    }
    getTypeFactory() {
        return this.typeFactory;
    }
    /**
     * events:
     *  * column changes: addColumn, removeColumn
     *  * ranking changes: addRanking, removeRanking
     *  * dirty: dirty, dirtyHeder, dirtyValues
     *  * selectionChanged
     * @returns {string[]}
     */
    createEventList() {
        return super
            .createEventList()
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
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    /**
     * adds a new ranking
     * @param existing an optional existing ranking to clone
     * @return the new ranking
     */
    pushRanking(existing) {
        const r = this.cloneRanking(existing);
        this.insertRanking(r);
        return r;
    }
    fireBusy(busy) {
        this.fire(ADataProvider.EVENT_BUSY, busy);
    }
    takeSnapshot(col) {
        this.fireBusy(true);
        const r = this.cloneRanking();
        const ranking = col.findMyRanker();
        // by convention copy all support types and the first string column
        let hasString = col.desc.type === 'string';
        let hasColumn = false;
        const toClone = !ranking
            ? [col]
            : ranking.children.filter((c) => {
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
        toClone.forEach((c) => {
            const clone = this.clone(c);
            r.push(clone);
            if (c === col) {
                clone.sortByMe();
            }
        });
        this.insertRanking(r);
        this.fireBusy(false);
        return r;
    }
    insertRanking(r, index = this.rankings.length) {
        this.rankings.splice(index, 0, r);
        this.forward(r, ...ADataProvider.FORWARD_RANKING_EVENTS);
        //delayed reordering per ranking
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        r.on(`${Ranking.EVENT_DIRTY_ORDER}.provider`, debounce(function () {
            that.triggerReorder(r, toDirtyReason(this));
        }, 100, mergeDirtyOrderContext));
        this.fire([
            ADataProvider.EVENT_ADD_RANKING,
            ADataProvider.EVENT_DIRTY_HEADER,
            ADataProvider.EVENT_DIRTY_VALUES,
            ADataProvider.EVENT_DIRTY,
        ], r, index);
        this.triggerReorder(r);
    }
    triggerReorder(ranking, dirtyReason) {
        this.fireBusy(true);
        const reason = dirtyReason || [EDirtyReason.UNKNOWN];
        Promise.resolve(this.sort(ranking, reason)).then(({ groups, index2pos }) => {
            if (ranking.getGroupSortCriteria().length === 0) {
                groups = unifyParents(groups);
            }
            this.initAggregateState(ranking, groups);
            ranking.setGroups(groups, index2pos, reason);
            this.fireBusy(false);
        });
    }
    /**
     * removes a ranking from this data provider
     * @param ranking
     * @returns {boolean}
     */
    removeRanking(ranking) {
        const i = this.rankings.indexOf(ranking);
        if (i < 0) {
            return false;
        }
        this.unforward(ranking, ...ADataProvider.FORWARD_RANKING_EVENTS);
        this.rankings.splice(i, 1);
        ranking.on(`${Ranking.EVENT_DIRTY_ORDER}.provider`, null);
        this.cleanUpRanking(ranking);
        this.fire([
            ADataProvider.EVENT_REMOVE_RANKING,
            ADataProvider.EVENT_DIRTY_HEADER,
            ADataProvider.EVENT_DIRTY_VALUES,
            ADataProvider.EVENT_DIRTY,
        ], ranking, i);
        return true;
    }
    /**
     * removes all rankings
     */
    clearRankings() {
        this.rankings.forEach((ranking) => {
            this.unforward(ranking, ...ADataProvider.FORWARD_RANKING_EVENTS);
            ranking.on(`${Ranking.EVENT_DIRTY_ORDER}.provider`, null);
            this.cleanUpRanking(ranking);
        });
        // clear
        this.rankings.splice(0, this.rankings.length);
        this.fire([
            ADataProvider.EVENT_REMOVE_RANKING,
            ADataProvider.EVENT_DIRTY_HEADER,
            ADataProvider.EVENT_DIRTY_VALUES,
            ADataProvider.EVENT_DIRTY,
        ], null, -1);
    }
    clearFilters() {
        this.rankings.forEach((ranking) => ranking.clearFilters());
    }
    /**
     * returns a list of all current rankings
     * @returns {Ranking[]}
     */
    getRankings() {
        return this.rankings.slice();
    }
    /**
     * returns the last ranking for quicker access
     * @returns {Ranking}
     */
    getFirstRanking() {
        return this.rankings[0] || null;
    }
    /**
     * returns the last ranking for quicker access
     * @returns {Ranking}
     */
    getLastRanking() {
        return this.rankings[this.rankings.length - 1];
    }
    ensureOneRanking() {
        if (this.rankings.length === 0) {
            const r = this.pushRanking();
            this.push(r, createRankDesc());
        }
    }
    destroy() {
        // dummy
    }
    /**
     * hook method for cleaning up a ranking
     * @param _ranking
     */
    cleanUpRanking(_ranking) {
        // dummy
    }
    /**
     * adds a column to a ranking described by its column description
     * @param ranking the ranking to add the column to
     * @param desc the description of the column
     * @return {Column} the newly created column or null
     */
    push(ranking, desc) {
        const r = this.create(desc);
        if (r) {
            ranking.push(r);
            return r;
        }
        return null;
    }
    /**
     * adds a column to a ranking described by its column description
     * @param ranking the ranking to add the column to
     * @param index the position to insert the column
     * @param desc the description of the column
     * @return {Column} the newly created column or null
     */
    insert(ranking, index, desc) {
        const r = this.create(desc);
        if (r) {
            ranking.insert(r, index);
            return r;
        }
        return null;
    }
    /**
     * creates a new unique id for a column
     * @returns {string}
     */
    nextId() {
        return `col${this.uid++}`;
    }
    fixDesc(desc) {
        //hacks for provider dependent descriptors
        if (desc.type === 'selection') {
            desc.accessor = (row) => this.isSelected(row.i);
            desc.setter = (index, value) => value ? this.select(index) : this.deselect(index);
            desc.setterAll = (indices, value) => value ? this.selectAll(indices) : this.deselectAll(indices);
        }
        else if (desc.type === 'aggregate') {
            desc.isAggregated = (ranking, group) => this.getAggregationState(ranking, group);
            desc.setAggregated = (ranking, group, value) => this.setAggregationState(ranking, group, value);
        }
        return desc;
    }
    cleanDesc(desc) {
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
    }
    /**
     * creates an internal column model out of the given column description
     * @param desc
     * @returns {Column} the new column or null if it can't be created
     */
    create(desc) {
        this.fixDesc(desc);
        //find by type and instantiate
        const type = this.columnTypes[desc.type];
        if (type) {
            return this.patchColumn(this.instantiateColumn(type, this.nextId(), desc, this.typeFactory));
        }
        return null;
    }
    patchColumn(column) {
        // hook for adapting columns
        return column;
    }
    instantiateColumn(type, id, desc, typeFactory) {
        return new type(id, desc, typeFactory);
    }
    /**
     * clones a column by dumping and restoring
     * @param col
     * @returns {Column}
     */
    clone(col) {
        const dump = this.dumpColumn(col);
        return this.restoreColumn(dump);
    }
    /**
     * restores a column from a dump
     * @param dump
     * @returns {Column}
     */
    restoreColumn(dump) {
        const c = this.typeFactory(dump);
        c.assignNewId(this.nextId.bind(this));
        return c;
    }
    /**
     * finds a column in all rankings returning the first match
     * @param idOrFilter by id or by a filter function
     * @returns {Column}
     */
    find(idOrFilter) {
        //convert to function
        const filter = typeof idOrFilter === 'string' ? (col) => col.id === idOrFilter : idOrFilter;
        for (const ranking of this.rankings) {
            const r = ranking.find(filter);
            if (r) {
                return r;
            }
        }
        return null;
    }
    /**
     * dumps this whole provider including selection and the rankings
     * @returns {{uid: number, selection: number[], rankings: *[]}}
     */
    dump() {
        return {
            $schema: SCHEMA_REF,
            uid: this.uid,
            selection: this.getSelection(),
            aggregations: map2Object(this.aggregations),
            rankings: this.rankings.map((r) => r.dump(this.toDescRef.bind(this))),
            showTopN: this.showTopN,
        };
    }
    /**
     * dumps a specific column
     */
    dumpColumn(col) {
        return col.dump(this.toDescRef.bind(this));
    }
    /**
     * for better dumping describe reference, by default just return the description
     */
    toDescRef(desc) {
        return desc;
    }
    /**
     * inverse operation of toDescRef
     */
    fromDescRef(descRef) {
        return descRef;
    }
    restoreRanking(dump) {
        const ranking = this.cloneRanking();
        ranking.restore(dump, this.typeFactory);
        const idGenerator = this.nextId.bind(this);
        ranking.children.forEach((c) => c.assignNewId(idGenerator));
        return ranking;
    }
    restore(dump) {
        //clean old
        this.clearRankings();
        //restore selection
        this.uid = dump.uid || 0;
        if (dump.selection) {
            dump.selection.forEach((s) => this.selection.add(s));
        }
        if (dump.showTopN != null) {
            this.showTopN = dump.showTopN;
        }
        if (dump.aggregations) {
            this.aggregations.clear();
            if (Array.isArray(dump.aggregations)) {
                dump.aggregations.forEach((a) => this.aggregations.set(a, 0));
            }
            else {
                object2Map(dump.aggregations).forEach((v, k) => this.aggregations.set(k, v));
            }
        }
        //restore rankings
        if (dump.rankings) {
            dump.rankings.forEach((r) => {
                const ranking = this.cloneRanking();
                ranking.restore(r, this.typeFactory);
                //if no rank column add one
                if (!ranking.children.some((d) => d instanceof RankColumn)) {
                    ranking.insert(this.create(createRankDesc()), 0);
                }
                this.insertRanking(ranking);
            });
        }
        //assign new ids
        const idGenerator = this.nextId.bind(this);
        this.rankings.forEach((r) => {
            r.children.forEach((c) => c.assignNewId(idGenerator));
        });
    }
    /**
     * generates a default ranking by using all column descriptions ones
     */
    deriveDefault(addSupportType = true) {
        const r = this.pushRanking();
        if (addSupportType) {
            r.push(this.create(createAggregateDesc()));
            r.push(this.create(createRankDesc()));
            if (this.options.singleSelection !== true) {
                r.push(this.create(createSelectionDesc()));
            }
        }
        this.getColumns().forEach((col) => {
            const c = this.create(col);
            if (!c || isSupportType(c)) {
                return;
            }
            r.push(c);
        });
        return r;
    }
    isAggregated(ranking, group) {
        return this.getTopNAggregated(ranking, group) >= 0;
    }
    getAggregationState(ranking, group) {
        const n = this.getTopNAggregated(ranking, group);
        return n < 0 ? EAggregationState.EXPAND : n === 0 ? EAggregationState.COLLAPSE : EAggregationState.EXPAND_TOP_N;
    }
    setAggregated(ranking, group, value) {
        return this.setAggregationState(ranking, group, value ? EAggregationState.COLLAPSE : EAggregationState.EXPAND);
    }
    setAggregationState(ranking, group, value) {
        this.setTopNAggregated(ranking, group, value === EAggregationState.COLLAPSE ? 0 : value === EAggregationState.EXPAND_TOP_N ? this.showTopN : -1);
    }
    getTopNAggregated(ranking, group) {
        let g = group;
        while (g) {
            const key = `${ranking.id}@${toGroupID(g)}`;
            if (this.aggregations.has(key)) {
                // propagate to leaf
                const v = this.aggregations.get(key);
                if (this.options.propagateAggregationState && group !== g) {
                    this.aggregations.set(`${ranking.id}@${toGroupID(group)}`, v);
                }
                return v;
            }
            g = g.parent;
        }
        return -1;
    }
    unaggregateParents(ranking, group) {
        let g = group.parent;
        let changed = false;
        while (g) {
            changed = this.aggregations.delete(`${ranking.id}@${toGroupID(g)}`) || changed;
            g = g.parent;
        }
        return changed;
    }
    getAggregationStrategy() {
        return this.options.aggregationStrategy;
    }
    initAggregateState(ranking, groups) {
        let initial = -1;
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
        for (const group of groups) {
            const key = `${ranking.id}@${toGroupID(group)}`;
            if (!this.aggregations.has(key) && initial >= 0) {
                this.aggregations.set(key, initial);
            }
        }
    }
    setTopNAggregated(ranking, group, value) {
        const groups = Array.isArray(group) ? group : [group];
        const changed = [];
        const previous = [];
        let changedParents = false;
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const target = typeof value === 'number' ? value : value[i];
            changedParents = this.unaggregateParents(ranking, group) || changedParents;
            const current = this.getTopNAggregated(ranking, group);
            if (current === target) {
                continue;
            }
            changed.push(group);
            previous.push(current);
            const key = `${ranking.id}@${toGroupID(group)}`;
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
    }
    aggregateAllOf(ranking, aggregateAll, groups = ranking.getGroups()) {
        const value = convertAggregationState(aggregateAll, this.showTopN);
        this.setTopNAggregated(ranking, groups, value);
    }
    getShowTopN() {
        return this.showTopN;
    }
    setShowTopN(value) {
        if (this.showTopN === value) {
            return;
        }
        // update entries
        for (const [k, v] of Array.from(this.aggregations.entries())) {
            if (v === this.showTopN) {
                this.aggregations.set(k, value);
            }
        }
        this.fire([ADataProvider.EVENT_SHOWTOPN_CHANGED, ADataProvider.EVENT_DIRTY_VALUES, ADataProvider.EVENT_DIRTY], this.showTopN, (this.showTopN = value));
    }
    /**
     * is the given row selected
     * @param index
     * @return {boolean}
     */
    isSelected(index) {
        return this.selection.has(index);
    }
    /**
     * also select the given row
     * @param index
     */
    select(index) {
        if (this.selection.has(index)) {
            return; //no change
        }
        if (this.options.singleSelection === true && this.selection.size > 0) {
            this.selection.clear();
        }
        this.selection.add(index);
        this.fire(ADataProvider.EVENT_SELECTION_CHANGED, this.getSelection());
    }
    jumpToNearest(indices) {
        if (indices.length === 0) {
            return;
        }
        this.fire(ADataProvider.EVENT_JUMP_TO_NEAREST, indices);
    }
    /**
     * also select all the given rows
     * @param indices
     */
    selectAll(indices) {
        if (everyIndices(indices, (i) => this.selection.has(i))) {
            return; //no change
        }
        if (this.options.singleSelection === true) {
            this.selection.clear();
            if (indices.length > 0) {
                this.selection.add(indices[0]);
            }
        }
        else {
            forEachIndices(indices, (index) => {
                this.selection.add(index);
            });
        }
        this.fire(ADataProvider.EVENT_SELECTION_CHANGED, this.getSelection());
    }
    selectAllOf(ranking) {
        this.setSelection(Array.from(ranking.getOrder()));
    }
    /**
     * set the selection to the given rows
     * @param indices
     */
    setSelection(indices) {
        if (indices.length === 0) {
            return this.clearSelection();
        }
        if (this.selection.size === indices.length && indices.every((i) => this.selection.has(i))) {
            return; //no change
        }
        this.selection.clear();
        this.selectAll(indices);
    }
    /**
     * toggles the selection of the given data index
     * @param index
     * @param additional just this element or all
     * @returns {boolean} whether the index is currently selected
     */
    toggleSelection(index, additional = false) {
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
    }
    /**
     * deselect the given row
     * @param index
     */
    deselect(index) {
        if (!this.selection.has(index)) {
            return; //no change
        }
        this.selection.delete(index);
        this.fire(ADataProvider.EVENT_SELECTION_CHANGED, this.getSelection());
    }
    /**
     * also select all the given rows
     * @param indices
     */
    deselectAll(indices) {
        if (everyIndices(indices, (i) => !this.selection.has(i))) {
            return; //no change
        }
        forEachIndices(indices, (index) => {
            this.selection.delete(index);
        });
        this.fire(ADataProvider.EVENT_SELECTION_CHANGED, this.getSelection());
    }
    /**
     * returns a promise containing the selected rows
     * @return {Promise<any[]>}
     */
    selectedRows() {
        if (this.selection.size === 0) {
            return [];
        }
        return this.view(this.getSelection());
    }
    /**
     * returns the currently selected indices
     * @returns {Array}
     */
    getSelection() {
        return Array.from(this.selection);
    }
    /**
     * clears the selection
     */
    clearSelection() {
        if (this.selection.size === 0) {
            return; //no change
        }
        this.selection.clear();
        this.fire(ADataProvider.EVENT_SELECTION_CHANGED, [], false);
    }
    /**
     * utility to export a ranking to a table with the given separator
     * @param ranking
     * @param options
     * @returns {Promise<string>}
     */
    exportTable(ranking, options = {}) {
        const data = this.view(ranking.getOrder());
        if (isPromiseLike(data)) {
            return data.then((dataImpl) => exportRanking(ranking, dataImpl, options));
        }
        return exportRanking(ranking, data, options);
    }
    /**
     * utility to export the selection within the given ranking to a table with the given separator
     * @param ranking
     * @param options
     * @returns {Promise<string>}
     */
    exportSelection(options = {}) {
        const selection = this.getSelection();
        const ranking = options.ranking || this.getFirstRanking();
        if (!ranking) {
            return '';
        }
        const rows = selection.map((s) => this.getRow(s));
        if (rows.some((row) => isPromiseLike(row))) {
            return Promise.all(rows).then((data) => {
                return exportTable(ranking, data, options);
            });
        }
        return exportTable(ranking, rows, options);
    }
}
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
export default ADataProvider;
