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
class Ranking extends AEventDispatcher {
    constructor(id) {
        super();
        this.id = id;
        this.sortCriteria = [];
        this.groupColumns = [];
        this.groupSortCriteria = [];
        /**
         * columns of this ranking
         * @type {Array}
         * @private
         */
        this.columns = [];
        this.dirtyOrder = (reason) => {
            this.fire([Ranking.EVENT_DIRTY_ORDER, Ranking.EVENT_DIRTY_VALUES, Ranking.EVENT_DIRTY], reason);
        };
        this.dirtyOrderSortDirty = () => this.dirtyOrder([EDirtyReason.SORT_CRITERIA_DIRTY]);
        this.dirtyOrderGroupDirty = () => this.dirtyOrder([EDirtyReason.GROUP_CRITERIA_DIRTY]);
        this.dirtyOrderGroupSortDirty = () => this.dirtyOrder([EDirtyReason.GROUP_SORT_CRITERIA_DIRTY]);
        this.dirtyOrderFiltering = () => this.dirtyOrder([EDirtyReason.FILTER_CHANGED]);
        /**
         * the current ordering as an sorted array of indices
         * @type {Array}
         */
        this.groups = [Object.assign({ order: [] }, defaultGroup)];
        this.order = [];
        this.index2pos = [];
        this.id = fixCSS(id);
        this.label = `Ranking ${id.startsWith('rank') ? id.slice(4) : id}`;
    }
    createEventList() {
        return super
            .createEventList()
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
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    assignNewId(idGenerator) {
        this.id = fixCSS(idGenerator());
        this.columns.forEach((c) => c.assignNewId(idGenerator));
    }
    getLabel() {
        return this.label;
    }
    setLabel(value) {
        if (value === this.label) {
            return;
        }
        this.fire(Ranking.EVENT_LABEL_CHANGED, this.label, (this.label = value));
    }
    setGroups(groups, index2pos, dirtyReason) {
        const old = this.order;
        const oldGroups = this.groups;
        this.groups = groups;
        this.index2pos = index2pos;
        this.order = joinIndexArrays(groups.map((d) => d.order));
        // replace with subarrays to save memory
        if (groups.length > 1) {
            this.unifyGroups(groups);
        }
        else if (groups.length === 1) {
            // propagate to the top
            let p = groups[0].parent;
            while (p) {
                p.order = this.order;
                p = p.parent;
            }
        }
        this.fire([Ranking.EVENT_ORDER_CHANGED, Ranking.EVENT_GROUPS_CHANGED, Ranking.EVENT_DIRTY_VALUES, Ranking.EVENT_DIRTY], old, this.order, oldGroups, groups, dirtyReason);
    }
    unifyGroups(groups) {
        let offset = 0;
        const order = this.order;
        const offsets = new Map();
        for (const group of groups) {
            const size = group.order.length;
            group.order = order.subarray(offset, offset + size);
            offsets.set(group, { offset, size });
            offset += size;
        }
        // propagate also to the top with views
        const roots = groupRoots(groups);
        const resolve = (g) => {
            if (offsets.has(g)) {
                // leaf
                return offsets.get(g);
            }
            const subs = g.subGroups.map((gi) => resolve(gi));
            const offset = subs.length > 0 ? subs[0].offset : 0;
            const size = subs.reduce((a, b) => a + b.size, 0);
            const r = { offset, size };
            offsets.set(g, r);
            g.order = order.subarray(offset, offset + size);
            return r;
        };
        for (const root of roots) {
            resolve(root);
        }
    }
    getRank(dataIndex) {
        if (dataIndex < 0 || dataIndex > this.index2pos.length) {
            return -1;
        }
        const v = this.index2pos[dataIndex];
        return v != null && !Number.isNaN(v) && v > 0 ? v : -1;
    }
    getOrder() {
        return this.order;
    }
    getOrderLength() {
        return this.order.length;
    }
    getGroups() {
        return this.groups.slice();
    }
    /**
     * Returns the flat group tree in depth first search (DFS).
     */
    getFlatGroups() {
        const r = [];
        traverseGroupsDFS(this.groups, (v) => {
            r.push(v);
        });
        return r;
    }
    dump(toDescRef) {
        const r = {};
        r.columns = this.columns.map((d) => d.dump(toDescRef));
        r.sortCriteria = this.sortCriteria.map((s) => ({ asc: s.asc, sortBy: s.col.id }));
        r.groupSortCriteria = this.groupSortCriteria.map((s) => ({ asc: s.asc, sortBy: s.col.id }));
        r.groupColumns = this.groupColumns.map((d) => d.id);
        return r;
    }
    restore(dump, factory) {
        this.clear();
        (dump.columns || []).forEach((child) => {
            const c = factory(child);
            if (c) {
                this.push(c);
            }
        });
        // compatibility case
        if (dump.sortColumn && dump.sortColumn.sortBy) {
            const help = this.columns.find((d) => d.id === dump.sortColumn.sortBy);
            if (help) {
                this.sortBy(help, dump.sortColumn.asc);
            }
        }
        if (dump.groupColumns) {
            const groupColumns = dump.groupColumns
                .map((id) => this.columns.find((d) => d.id === id))
                .filter((d) => d != null);
            this.setGroupCriteria(groupColumns);
        }
        const restoreSortCriteria = (dumped) => {
            return dumped
                .map((s) => {
                return {
                    asc: s.asc,
                    col: this.columns.find((d) => d.id === s.sortBy) || null,
                };
            })
                .filter((s) => s.col);
        };
        if (dump.sortCriteria) {
            this.setSortCriteria(restoreSortCriteria(dump.sortCriteria));
        }
        if (dump.groupSortCriteria) {
            this.setGroupSortCriteria(restoreSortCriteria(dump.groupSortCriteria));
        }
    }
    flatten(r, offset, levelsToGo = 0, padding = 0) {
        let acc = offset; // + this.getWidth() + padding;
        if (levelsToGo > 0 || levelsToGo <= Column.FLAT_ALL_COLUMNS) {
            this.columns.forEach((c) => {
                if (c.getVisible() && levelsToGo <= Column.FLAT_ALL_COLUMNS) {
                    acc += c.flatten(r, acc, levelsToGo - 1, padding) + padding;
                }
            });
        }
        return acc - offset;
    }
    getPrimarySortCriteria() {
        if (this.sortCriteria.length === 0) {
            return null;
        }
        return this.sortCriteria[0];
    }
    getSortCriteria() {
        return this.sortCriteria.map((d) => Object.assign({}, d));
    }
    getGroupSortCriteria() {
        return this.groupSortCriteria.map((d) => Object.assign({}, d));
    }
    toggleSorting(col) {
        return this.setSortCriteria(this.toggleSortingLogic(col, this.sortCriteria));
    }
    toggleSortingLogic(col, sortCriteria) {
        const newSort = sortCriteria.slice();
        const current = newSort.findIndex((d) => d.col === col);
        const defaultAsc = isSortingAscByDefault(col);
        if (current < 0) {
            newSort.splice(0, newSort.length, { col, asc: defaultAsc });
        }
        else if (newSort[current].asc === defaultAsc) {
            // asc -> desc, or desc -> asc
            newSort.splice(current, 1, { col, asc: !defaultAsc });
        }
        else {
            // remove
            newSort.splice(current, 1);
        }
        return newSort;
    }
    toggleGrouping(col) {
        const old = this.groupColumns.indexOf(col);
        if (old >= 0) {
            const newGroupings = this.groupColumns.slice();
            newGroupings.splice(old, 1);
            return this.setGroupCriteria(newGroupings);
        }
        return this.setGroupCriteria([col]);
    }
    getGroupCriteria() {
        return this.groupColumns.slice();
    }
    /**
     * replaces, moves, or remove the given column in the sorting hierarchy
     * @param col
     * @param priority when priority < 0 remove the column only else replace at the given priority
     */
    sortBy(col, ascending = false, priority = 0) {
        if (col.findMyRanker() !== this) {
            return false; //not one of mine
        }
        return this.setSortCriteria(this.hierarchyLogic(this.sortCriteria, this.sortCriteria.findIndex((d) => d.col === col), { col, asc: ascending }, priority));
    }
    /**
     * replaces, moves, or remove the given column in the group sorting hierarchy
     * @param col
     * @param priority when priority < 0 remove the column only else replace at the given priority
     */
    groupSortBy(col, ascending = false, priority = 0) {
        if (col.findMyRanker() !== this) {
            return false; //not one of mine
        }
        return this.setGroupSortCriteria(this.hierarchyLogic(this.groupSortCriteria, this.groupSortCriteria.findIndex((d) => d.col === col), { col, asc: ascending }, priority));
    }
    hierarchyLogic(entries, index, entry, priority) {
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
    }
    /**
     * replaces, moves, or remove the given column in the grouping hierarchy
     * @param col
     * @param priority when priority < 0 remove the column only else replace at the given priority
     */
    groupBy(col, priority = 0) {
        if (col.findMyRanker() !== this) {
            return false; //not one of mine
        }
        return this.setGroupCriteria(this.hierarchyLogic(this.groupColumns, this.groupColumns.indexOf(col), col, priority));
    }
    setSortCriteria(value) {
        const values = Array.isArray(value) ? value.slice() : [value];
        const bak = this.sortCriteria.slice();
        if (equalCriteria(values, bak)) {
            return false;
        }
        // update listener
        bak.forEach((d) => {
            d.col.on(Ranking.COLUMN_SORT_DIRTY, null);
        });
        values.forEach((d) => {
            d.col.on(Ranking.COLUMN_SORT_DIRTY, this.dirtyOrderSortDirty);
        });
        this.sortCriteria.splice(0, this.sortCriteria.length, ...values.slice());
        this.triggerResort(bak);
        return true;
    }
    setGroupCriteria(column) {
        const cols = Array.isArray(column) ? column : [column];
        if (equalArrays(this.groupColumns, cols)) {
            return true; //same
        }
        this.groupColumns.forEach((groupColumn) => {
            groupColumn.on(Ranking.COLUMN_GROUP_DIRTY, null);
        });
        const bak = this.groupColumns.slice();
        this.groupColumns.splice(0, this.groupColumns.length, ...cols);
        this.groupColumns.forEach((groupColumn) => {
            groupColumn.on(Ranking.COLUMN_GROUP_DIRTY, this.dirtyOrderGroupDirty);
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
    }
    autoAdaptAggregationColumn() {
        // set column auto adds two levels
        const length = this.groupColumns.reduce((acc, c) => acc + (c instanceof SetColumn ? 2 : 1), 0);
        const col = this.children.find((d) => d instanceof AggregateGroupColumn);
        if (!col) {
            return;
        }
        const targetWidth = length * AGGREGATION_LEVEL_WIDTH;
        if (targetWidth > col.getWidth()) {
            col.setWidth(targetWidth);
        }
    }
    toggleGroupSorting(col) {
        return this.setGroupSortCriteria(this.toggleSortingLogic(col, this.groupSortCriteria));
    }
    setGroupSortCriteria(value) {
        const values = Array.isArray(value) ? value.slice() : [value];
        const bak = this.groupSortCriteria.slice();
        if (equalCriteria(values, bak)) {
            return false;
        }
        bak.forEach((d) => {
            d.col.on(Ranking.COLUMN_GROUP_SORT_DIRTY, null);
        });
        values.forEach((d) => {
            d.col.on(Ranking.COLUMN_GROUP_SORT_DIRTY, this.dirtyOrderGroupSortDirty);
        });
        this.groupSortCriteria.splice(0, this.groupSortCriteria.length, ...values.slice());
        this.triggerGroupResort(bak);
        return true;
    }
    triggerGroupResort(bak) {
        const sortCriterias = this.getGroupSortCriteria();
        const bakMulti = Array.isArray(bak) ? bak : sortCriterias;
        this.fire([
            Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED,
            Ranking.EVENT_DIRTY_ORDER,
            Ranking.EVENT_DIRTY_HEADER,
            Ranking.EVENT_DIRTY_VALUES,
            Ranking.EVENT_DIRTY,
        ], bakMulti, sortCriterias);
    }
    triggerResort(bak) {
        const sortCriterias = this.getSortCriteria();
        const bakMulti = Array.isArray(bak) ? bak : sortCriterias;
        this.fire([
            Ranking.EVENT_SORT_CRITERIA_CHANGED,
            Ranking.EVENT_DIRTY_ORDER,
            Ranking.EVENT_DIRTY_HEADER,
            Ranking.EVENT_DIRTY_VALUES,
            Ranking.EVENT_DIRTY,
        ], bakMulti, sortCriterias);
    }
    get children() {
        return this.columns.slice();
    }
    get length() {
        return this.columns.length;
    }
    insert(col, index = this.columns.length) {
        this.columns.splice(index, 0, col);
        col.attach(this);
        this.forward(col, ...Ranking.FORWARD_COLUMN_EVENTS);
        col.on(`${Ranking.EVENT_FILTER_CHANGED}.order`, this.dirtyOrderFiltering);
        col.on(`${Column.EVENT_VISIBILITY_CHANGED}.ranking`, (oldValue, newValue) => this.fire([
            Ranking.EVENT_COLUMN_VISIBILITY_CHANGED,
            Ranking.EVENT_DIRTY_HEADER,
            Ranking.EVENT_DIRTY_VALUES,
            Ranking.EVENT_DIRTY,
        ], col, oldValue, newValue));
        this.fire([Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_DIRTY_HEADER, Ranking.EVENT_DIRTY_VALUES, Ranking.EVENT_DIRTY], col, index);
        if (col.isFiltered()) {
            this.dirtyOrderFiltering();
        }
        return col;
    }
    move(col, index = this.columns.length) {
        if (col.parent !== this) {
            // not a move operation!
            console.error('invalid move operation: ', col);
            return null;
        }
        const old = this.columns.indexOf(col);
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
    }
    moveAfter(col, reference) {
        const i = this.columns.indexOf(reference);
        if (i < 0) {
            return null;
        }
        return this.move(col, i + 1);
    }
    moveBefore(col, reference) {
        const i = this.columns.indexOf(reference);
        if (i < 0) {
            return null;
        }
        return this.move(col, i);
    }
    get fqpath() {
        return '';
    }
    findByPath(fqpath) {
        let p = this;
        const indices = fqpath.split('@').map(Number).slice(1); //ignore the first entry = ranking
        while (indices.length > 0) {
            const i = indices.shift();
            p = p.at(i);
        }
        return p;
    }
    indexOf(col) {
        return this.columns.indexOf(col);
    }
    at(index) {
        return this.columns[index];
    }
    insertAfter(col, ref) {
        const i = this.columns.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.insert(col, i + 1);
    }
    insertBefore(col, ref) {
        const i = this.columns.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.insert(col, i);
    }
    push(col) {
        return this.insert(col);
    }
    remove(col) {
        const i = this.columns.indexOf(col);
        if (i < 0) {
            return false;
        }
        this.unforward(col, ...Ranking.FORWARD_COLUMN_EVENTS);
        const isSortCriteria = this.sortCriteria.findIndex((d) => d.col === col);
        const sortCriteriaChanged = isSortCriteria >= 0;
        if (sortCriteriaChanged) {
            this.sortCriteria.splice(isSortCriteria, 1);
        }
        const isGroupSortCriteria = this.groupSortCriteria.findIndex((d) => d.col === col);
        const groupSortCriteriaChanged = isGroupSortCriteria >= 0;
        if (groupSortCriteriaChanged) {
            this.groupSortCriteria.splice(isGroupSortCriteria, 1);
        }
        let newGrouping = null;
        const isGroupColumn = this.groupColumns.indexOf(col);
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
    }
    clear() {
        if (this.columns.length === 0) {
            return;
        }
        this.sortCriteria.forEach((d) => {
            d.col.on(`${Column.EVENT_DIRTY_CACHES}.order`, null);
        });
        this.sortCriteria.splice(0, this.sortCriteria.length);
        this.groupSortCriteria.forEach((d) => {
            d.col.on(Ranking.COLUMN_GROUP_SORT_DIRTY, null);
        });
        this.groupSortCriteria.splice(0, this.groupSortCriteria.length);
        this.groupColumns.forEach((d) => {
            d.on(Ranking.COLUMN_GROUP_DIRTY, null);
        });
        this.groupColumns.splice(0, this.groupColumns.length);
        this.columns.forEach((col) => {
            this.unforward(col, ...Ranking.FORWARD_COLUMN_EVENTS);
            col.detach();
        });
        const removed = this.columns.splice(0, this.columns.length);
        this.fire([
            Ranking.EVENT_REMOVE_COLUMN,
            Ranking.EVENT_DIRTY_ORDER,
            Ranking.EVENT_DIRTY_HEADER,
            Ranking.EVENT_DIRTY_VALUES,
            Ranking.EVENT_DIRTY,
        ], removed);
    }
    get flatColumns() {
        const r = [];
        this.flatten(r, 0, Column.FLAT_ALL_COLUMNS);
        return r.map((d) => d.col);
    }
    find(idOrFilter) {
        const filter = typeof idOrFilter === 'string' ? (col) => col.id === idOrFilter : idOrFilter;
        const r = this.flatColumns;
        for (const v of r) {
            if (filter(v)) {
                return v;
            }
        }
        return null;
    }
    isFiltered() {
        return this.columns.some((d) => d.isFiltered());
    }
    filter(row) {
        return this.columns.every((d) => d.filter(row));
    }
    clearFilters() {
        return this.columns.map((d) => d.clearFilter()).some((d) => d);
    }
    findMyRanker() {
        return this;
    }
    get fqid() {
        return this.id;
    }
    /**
     * marks the header, values, or both as dirty such that the values are reevaluated
     * @param type specify in more detail what is dirty, by default whole column
     */
    markDirty(type = 'all') {
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
    }
}
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
export default Ranking;
function equalCriteria(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((ai, i) => {
        const bi = b[i];
        return ai.col === bi.col && ai.asc === bi.asc;
    });
}
