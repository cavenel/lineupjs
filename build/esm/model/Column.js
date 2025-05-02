import { AEventDispatcher, similar, fixCSS } from '../internal';
import { isSortingAscByDefault } from './annotations';
import { defaultGroup, ECompareValueType, } from './interfaces';
/**
 * default color that should be used
 * @type {string}
 */
export const DEFAULT_COLOR = '#a0a0a0';
/**
 * a column in LineUp
 */
class Column extends AEventDispatcher {
    constructor(id, desc) {
        super();
        this.desc = desc;
        /**
         * width of the column
         * @type {number}
         * @private
         */
        this.width = 100;
        /**
         * parent column of this column, set when added to a ranking or combined column
         */
        this.parent = null;
        this.uid = fixCSS(id);
        this.renderer = this.desc.renderer || this.desc.type;
        this.groupRenderer = this.desc.groupRenderer || this.desc.type;
        this.summaryRenderer = this.desc.summaryRenderer || this.desc.type;
        this.width = this.desc.width != null && this.desc.width > 0 ? this.desc.width : 100;
        this.visible = this.desc.visible !== false;
        this.metadata = {
            label: desc.label || this.id,
            summary: desc.summary || '',
            description: desc.description || '',
        };
    }
    get fixed() {
        return Boolean(this.desc.fixed);
    }
    get frozen() {
        return Boolean(this.desc.frozen);
    }
    get id() {
        return this.uid;
    }
    assignNewId(idGenerator) {
        this.uid = fixCSS(idGenerator());
    }
    get label() {
        return this.metadata.label;
    }
    get description() {
        return this.metadata.description;
    }
    /**
     * returns the fully qualified id i.e. path the parent
     * @returns {string}
     */
    get fqid() {
        return this.parent ? `${this.parent.fqid}_${this.id}` : this.id;
    }
    get fqpath() {
        return this.parent ? `${this.parent.fqpath}@${this.parent.indexOf(this)}` : '';
    }
    createEventList() {
        return super
            .createEventList()
            .concat([
            Column.EVENT_WIDTH_CHANGED,
            Column.EVENT_LABEL_CHANGED,
            Column.EVENT_METADATA_CHANGED,
            Column.EVENT_VISIBILITY_CHANGED,
            Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED,
            Column.EVENT_RENDERER_TYPE_CHANGED,
            Column.EVENT_GROUP_RENDERER_TYPE_CHANGED,
            Column.EVENT_DIRTY,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
        ]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getWidth() {
        return this.width;
    }
    hide() {
        this.setVisible(false);
    }
    show() {
        this.setVisible(true);
    }
    isVisible() {
        return this.visible;
    }
    getVisible() {
        return this.isVisible();
    }
    setVisible(value) {
        if (this.visible === value) {
            return;
        }
        this.fire([Column.EVENT_VISIBILITY_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.visible, (this.visible = value));
    }
    /**
     * visitor pattern for flattening the columns
     * @param {IFlatColumn} r the result array
     * @param {number} offset left offset
     * @param {number} _levelsToGo how many levels down
     * @param {number} _padding padding between columns
     * @returns {number} the used width by this column
     */
    flatten(r, offset, _levelsToGo = 0, _padding = 0) {
        const w = this.getWidth();
        r.push({ col: this, offset, width: w });
        return w;
    }
    setWidth(value) {
        if (similar(this.width, value, 0.5)) {
            return;
        }
        this.fire([Column.EVENT_WIDTH_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.width, (this.width = value));
    }
    setWidthImpl(value) {
        this.width = value;
    }
    setMetaData(value) {
        if (value.label === this.label &&
            this.description === value.description &&
            this.metadata.summary === value.summary) {
            return;
        }
        const bak = this.getMetaData();
        //copy to avoid reference
        this.metadata = {
            label: value.label,
            summary: value.summary,
            description: value.description,
        };
        this.fire([Column.EVENT_LABEL_CHANGED, Column.EVENT_METADATA_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY], bak, this.getMetaData());
    }
    getMetaData() {
        return Object.assign({}, this.metadata);
    }
    /**
     * triggers that the ranking is sorted by this column
     * @param ascending ascending order?
     * @param priority sorting priority
     * @returns {boolean} was successful
     */
    sortByMe(ascending = isSortingAscByDefault(this), priority = 0) {
        const r = this.findMyRanker();
        if (r) {
            return r.sortBy(this, ascending, priority);
        }
        return false;
    }
    groupByMe() {
        const r = this.findMyRanker();
        if (r) {
            return r.toggleGrouping(this);
        }
        return false;
    }
    /**
     *
     * @return {number}
     */
    isGroupedBy() {
        const r = this.findMyRanker();
        if (!r) {
            return -1;
        }
        return r.getGroupCriteria().indexOf(this);
    }
    /**
     * toggles the sorting order of this column in the ranking
     * @returns {boolean} was successful
     */
    toggleMySorting() {
        const r = this.findMyRanker();
        if (r) {
            return r.toggleSorting(this);
        }
        return false;
    }
    isSortedByMeImpl(selector) {
        const ranker = this.findMyRanker();
        if (!ranker) {
            return { asc: undefined, priority: undefined };
        }
        const criterias = selector(ranker);
        const index = criterias.findIndex((c) => c.col === this);
        if (index < 0) {
            return { asc: undefined, priority: undefined };
        }
        return {
            asc: criterias[index].asc ? 'asc' : 'desc',
            priority: index,
        };
    }
    isSortedByMe() {
        return this.isSortedByMeImpl((r) => r.getSortCriteria());
    }
    groupSortByMe(ascending = isSortingAscByDefault(this), priority = 0) {
        const r = this.findMyRanker();
        if (r) {
            return r.groupSortBy(this, ascending, priority);
        }
        return false;
    }
    toggleMyGroupSorting() {
        const r = this.findMyRanker();
        if (r) {
            return r.toggleGroupSorting(this);
        }
        return false;
    }
    isGroupSortedByMe() {
        return this.isSortedByMeImpl((r) => r.getGroupSortCriteria());
    }
    /**
     * removes the column from the ranking
     * @returns {boolean} was successful
     */
    removeMe() {
        if (this.fixed) {
            return false;
        }
        if (this.parent) {
            return this.parent.remove(this);
        }
        return false;
    }
    /**
     * called when the columns added to a ranking
     */
    attach(parent) {
        this.parent = parent;
    }
    /**
     * called when the column is removed from the ranking
     */
    detach() {
        this.parent = null;
    }
    /**
     * inserts the given column after itself
     * @param col the column to insert
     * @returns {boolean} was successful
     */
    insertAfterMe(col) {
        if (this.parent) {
            return this.parent.insertAfter(col, this) != null;
        }
        return false;
    }
    /**
     * inserts the given column before itself
     * @param col the column to insert
     * @returns {boolean} was successful
     */
    insertBeforeMe(col) {
        if (this.parent) {
            return this.parent.insertBefore(col, this) != null;
        }
        return false;
    }
    /**
     * returns the next sibling
     * @returns {Column | null}
     */
    nextSibling() {
        var _a;
        if (this.parent) {
            const index = this.parent.indexOf(this);
            return index < 0 ? null : ((_a = this.parent.at(index + 1)) !== null && _a !== void 0 ? _a : null);
        }
        return null;
    }
    /**
     * returns the previous sibling
     * @returns {Column | null}
     */
    previousSibling() {
        var _a;
        if (this.parent) {
            const index = this.parent.indexOf(this);
            return index < 1 ? null : ((_a = this.parent.at(index - 1)) !== null && _a !== void 0 ? _a : null);
        }
        return null;
    }
    /**
     * finds the underlying ranking column
     * @returns {Ranking|null} my current ranking
     */
    findMyRanker() {
        if (this.parent) {
            return this.parent.findMyRanker();
        }
        return null;
    }
    /**
     * dumps this column to JSON compatible format
     * @param toDescRef helper mapping function
     * @returns {any} dump of this column
     */
    dump(toDescRef) {
        const r = {
            id: this.id,
            desc: toDescRef(this.desc),
            width: this.width,
        };
        if (this.label !== (this.desc.label || this.id)) {
            r.label = this.label;
        }
        if (this.metadata.summary) {
            r.summary = this.metadata.summary;
        }
        if (this.getRenderer() !== this.desc.type) {
            r.renderer = this.getRenderer();
        }
        if (this.getGroupRenderer() !== this.desc.type) {
            r.groupRenderer = this.getGroupRenderer();
        }
        if (this.getSummaryRenderer() !== this.desc.type) {
            r.summaryRenderer = this.getSummaryRenderer();
        }
        return r;
    }
    /**
     * restore the column content from a dump
     * @param dump column dump
     * @param _factory helper for creating columns
     */
    restore(dump, _factory) {
        this.uid = dump.id;
        this.width = dump.width || this.width;
        this.metadata = {
            label: dump.label || this.label,
            summary: dump.summary || '',
            description: this.description,
        };
        if (dump.renderer || dump.rendererType) {
            this.renderer = dump.renderer || dump.rendererType || this.renderer;
        }
        if (dump.groupRenderer) {
            this.groupRenderer = dump.groupRenderer;
        }
        if (dump.summaryRenderer) {
            this.summaryRenderer = dump.summaryRenderer;
        }
    }
    /**
     * return the label of a given row for the current column
     * @param row the current row
     * @return {string} the label of this column at the specified row
     */
    getLabel(row) {
        const v = this.getValue(row);
        return v == null ? '' : String(v);
    }
    /**
     * return the value of a given row for the current column
     * @param _row the current row
     * @return the value of this column at the specified row
     */
    getValue(_row) {
        return ''; //no value
    }
    /**
     * returns the value to be used when exporting
     * @param format format hint
     */
    getExportValue(row, format) {
        return format === 'text' ? this.getLabel(row) : this.getValue(row);
    }
    getColor(_row) {
        return DEFAULT_COLOR;
    }
    toCompareValue(_row, _valueCache) {
        return 0;
    }
    toCompareValueType() {
        return ECompareValueType.UINT8;
    }
    /**
     * group the given row into a bin/group
     * @param _row
     * @return {IGroup}
     */
    group(_row, _valueCache) {
        return Object.assign({}, defaultGroup);
    }
    toCompareGroupValue(_rows, group, _valueCache) {
        return group.name.toLowerCase();
    }
    toCompareGroupValueType() {
        return ECompareValueType.STRING;
    }
    /**
     * flag whether any filter is applied
     * @return {boolean}
     */
    isFiltered() {
        return false;
    }
    /**
     * clear the filter
     * @return {boolean} whether the filtered needed to be reset
     */
    clearFilter() {
        // hook to clear the filter
        return false;
    }
    /**
     * predicate whether the current row should be included
     * @param row
     * @return {boolean}
     */
    filter(row, _valueCache) {
        return row != null;
    }
    /**
     * determines the renderer type that should be used to render this column. By default the same type as the column itself
     * @return {string}
     */
    getRenderer() {
        return this.renderer;
    }
    getGroupRenderer() {
        return this.groupRenderer;
    }
    getSummaryRenderer() {
        return this.summaryRenderer;
    }
    setRenderer(renderer) {
        if (renderer === this.renderer) {
            // nothing changes
            return;
        }
        this.fire([Column.EVENT_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.renderer, (this.renderer = renderer));
    }
    setGroupRenderer(renderer) {
        if (renderer === this.groupRenderer) {
            // nothing changes
            return;
        }
        this.fire([Column.EVENT_GROUP_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.groupRenderer, (this.groupRenderer = renderer));
    }
    setSummaryRenderer(renderer) {
        if (renderer === this.summaryRenderer) {
            // nothing changes
            return;
        }
        this.fire([Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY], this.summaryRenderer, (this.summaryRenderer = renderer));
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
                return this.fire([Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY_CACHES, Column.EVENT_DIRTY]);
            default:
                return this.fire([
                    Column.EVENT_DIRTY_HEADER,
                    Column.EVENT_DIRTY_VALUES,
                    Column.EVENT_DIRTY_CACHES,
                    Column.EVENT_DIRTY,
                ]);
        }
    }
    getHeaderLabel(ctx) {
        if (this.desc.labelAsHTML === true) {
            return {
                content: this.label,
                asHTML: true,
            };
        }
        if (typeof this.desc.labelAsHTML === 'function') {
            return {
                content: this.desc.labelAsHTML(this, ctx),
                asHTML: true,
            };
        }
        return {
            content: this.label,
            asHTML: false,
        };
    }
    getSummaryLabel(ctx, fallback = false) {
        let summary = this.desc.summary;
        if (!summary && fallback) {
            summary = this.description;
        }
        if (this.desc.summaryAsHTML === true) {
            return {
                content: summary,
                asHTML: true,
            };
        }
        if (typeof this.desc.summaryAsHTML === 'function') {
            return {
                content: this.desc.summaryAsHTML(this, ctx),
                asHTML: true,
            };
        }
        return {
            content: summary,
            asHTML: false,
        };
    }
}
/**
 * magic variable for showing all columns
 * @type {number}
 */
Column.FLAT_ALL_COLUMNS = -1;
Column.EVENT_WIDTH_CHANGED = 'widthChanged';
Column.EVENT_LABEL_CHANGED = 'labelChanged';
Column.EVENT_METADATA_CHANGED = 'metaDataChanged';
Column.EVENT_DIRTY = 'dirty';
Column.EVENT_DIRTY_HEADER = 'dirtyHeader';
Column.EVENT_DIRTY_VALUES = 'dirtyValues';
Column.EVENT_DIRTY_CACHES = 'dirtyCaches';
Column.EVENT_RENDERER_TYPE_CHANGED = 'rendererTypeChanged';
Column.EVENT_GROUP_RENDERER_TYPE_CHANGED = 'groupRendererChanged';
Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED = 'summaryRendererChanged';
Column.EVENT_VISIBILITY_CHANGED = 'visibilityChanged';
export default Column;
