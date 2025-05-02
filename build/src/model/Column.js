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
import { AEventDispatcher, similar, fixCSS } from '../internal';
import { isSortingAscByDefault } from './annotations';
import { defaultGroup, ECompareValueType, } from './interfaces';
/**
 * default color that should be used
 * @type {string}
 */
export var DEFAULT_COLOR = '#a0a0a0';
/**
 * a column in LineUp
 */
var Column = /** @class */ (function (_super) {
    __extends(Column, _super);
    function Column(id, desc) {
        var _this = _super.call(this) || this;
        _this.desc = desc;
        /**
         * width of the column
         * @type {number}
         * @private
         */
        _this.width = 100;
        /**
         * parent column of this column, set when added to a ranking or combined column
         */
        _this.parent = null;
        _this.uid = fixCSS(id);
        _this.renderer = _this.desc.renderer || _this.desc.type;
        _this.groupRenderer = _this.desc.groupRenderer || _this.desc.type;
        _this.summaryRenderer = _this.desc.summaryRenderer || _this.desc.type;
        _this.width = _this.desc.width != null && _this.desc.width > 0 ? _this.desc.width : 100;
        _this.visible = _this.desc.visible !== false;
        _this.metadata = {
            label: desc.label || _this.id,
            summary: desc.summary || '',
            description: desc.description || '',
        };
        return _this;
    }
    Object.defineProperty(Column.prototype, "fixed", {
        get: function () {
            return Boolean(this.desc.fixed);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "frozen", {
        get: function () {
            return Boolean(this.desc.frozen);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "id", {
        get: function () {
            return this.uid;
        },
        enumerable: false,
        configurable: true
    });
    Column.prototype.assignNewId = function (idGenerator) {
        this.uid = fixCSS(idGenerator());
    };
    Object.defineProperty(Column.prototype, "label", {
        get: function () {
            return this.metadata.label;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "description", {
        get: function () {
            return this.metadata.description;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "fqid", {
        /**
         * returns the fully qualified id i.e. path the parent
         * @returns {string}
         */
        get: function () {
            return this.parent ? "".concat(this.parent.fqid, "_").concat(this.id) : this.id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "fqpath", {
        get: function () {
            return this.parent ? "".concat(this.parent.fqpath, "@").concat(this.parent.indexOf(this)) : '';
        },
        enumerable: false,
        configurable: true
    });
    Column.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
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
    };
    Column.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    Column.prototype.getWidth = function () {
        return this.width;
    };
    Column.prototype.hide = function () {
        this.setVisible(false);
    };
    Column.prototype.show = function () {
        this.setVisible(true);
    };
    Column.prototype.isVisible = function () {
        return this.visible;
    };
    Column.prototype.getVisible = function () {
        return this.isVisible();
    };
    Column.prototype.setVisible = function (value) {
        if (this.visible === value) {
            return;
        }
        this.fire([Column.EVENT_VISIBILITY_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.visible, (this.visible = value));
    };
    /**
     * visitor pattern for flattening the columns
     * @param {IFlatColumn} r the result array
     * @param {number} offset left offset
     * @param {number} _levelsToGo how many levels down
     * @param {number} _padding padding between columns
     * @returns {number} the used width by this column
     */
    Column.prototype.flatten = function (r, offset, _levelsToGo, _padding) {
        if (_levelsToGo === void 0) { _levelsToGo = 0; }
        if (_padding === void 0) { _padding = 0; }
        var w = this.getWidth();
        r.push({ col: this, offset: offset, width: w });
        return w;
    };
    Column.prototype.setWidth = function (value) {
        if (similar(this.width, value, 0.5)) {
            return;
        }
        this.fire([Column.EVENT_WIDTH_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.width, (this.width = value));
    };
    Column.prototype.setWidthImpl = function (value) {
        this.width = value;
    };
    Column.prototype.setMetaData = function (value) {
        if (value.label === this.label &&
            this.description === value.description &&
            this.metadata.summary === value.summary) {
            return;
        }
        var bak = this.getMetaData();
        //copy to avoid reference
        this.metadata = {
            label: value.label,
            summary: value.summary,
            description: value.description,
        };
        this.fire([Column.EVENT_LABEL_CHANGED, Column.EVENT_METADATA_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY], bak, this.getMetaData());
    };
    Column.prototype.getMetaData = function () {
        return Object.assign({}, this.metadata);
    };
    /**
     * triggers that the ranking is sorted by this column
     * @param ascending ascending order?
     * @param priority sorting priority
     * @returns {boolean} was successful
     */
    Column.prototype.sortByMe = function (ascending, priority) {
        if (ascending === void 0) { ascending = isSortingAscByDefault(this); }
        if (priority === void 0) { priority = 0; }
        var r = this.findMyRanker();
        if (r) {
            return r.sortBy(this, ascending, priority);
        }
        return false;
    };
    Column.prototype.groupByMe = function () {
        var r = this.findMyRanker();
        if (r) {
            return r.toggleGrouping(this);
        }
        return false;
    };
    /**
     *
     * @return {number}
     */
    Column.prototype.isGroupedBy = function () {
        var r = this.findMyRanker();
        if (!r) {
            return -1;
        }
        return r.getGroupCriteria().indexOf(this);
    };
    /**
     * toggles the sorting order of this column in the ranking
     * @returns {boolean} was successful
     */
    Column.prototype.toggleMySorting = function () {
        var r = this.findMyRanker();
        if (r) {
            return r.toggleSorting(this);
        }
        return false;
    };
    Column.prototype.isSortedByMeImpl = function (selector) {
        var _this = this;
        var ranker = this.findMyRanker();
        if (!ranker) {
            return { asc: undefined, priority: undefined };
        }
        var criterias = selector(ranker);
        var index = criterias.findIndex(function (c) { return c.col === _this; });
        if (index < 0) {
            return { asc: undefined, priority: undefined };
        }
        return {
            asc: criterias[index].asc ? 'asc' : 'desc',
            priority: index,
        };
    };
    Column.prototype.isSortedByMe = function () {
        return this.isSortedByMeImpl(function (r) { return r.getSortCriteria(); });
    };
    Column.prototype.groupSortByMe = function (ascending, priority) {
        if (ascending === void 0) { ascending = isSortingAscByDefault(this); }
        if (priority === void 0) { priority = 0; }
        var r = this.findMyRanker();
        if (r) {
            return r.groupSortBy(this, ascending, priority);
        }
        return false;
    };
    Column.prototype.toggleMyGroupSorting = function () {
        var r = this.findMyRanker();
        if (r) {
            return r.toggleGroupSorting(this);
        }
        return false;
    };
    Column.prototype.isGroupSortedByMe = function () {
        return this.isSortedByMeImpl(function (r) { return r.getGroupSortCriteria(); });
    };
    /**
     * removes the column from the ranking
     * @returns {boolean} was successful
     */
    Column.prototype.removeMe = function () {
        if (this.fixed) {
            return false;
        }
        if (this.parent) {
            return this.parent.remove(this);
        }
        return false;
    };
    /**
     * called when the columns added to a ranking
     */
    Column.prototype.attach = function (parent) {
        this.parent = parent;
    };
    /**
     * called when the column is removed from the ranking
     */
    Column.prototype.detach = function () {
        this.parent = null;
    };
    /**
     * inserts the given column after itself
     * @param col the column to insert
     * @returns {boolean} was successful
     */
    Column.prototype.insertAfterMe = function (col) {
        if (this.parent) {
            return this.parent.insertAfter(col, this) != null;
        }
        return false;
    };
    /**
     * inserts the given column before itself
     * @param col the column to insert
     * @returns {boolean} was successful
     */
    Column.prototype.insertBeforeMe = function (col) {
        if (this.parent) {
            return this.parent.insertBefore(col, this) != null;
        }
        return false;
    };
    /**
     * returns the next sibling
     * @returns {Column | null}
     */
    Column.prototype.nextSibling = function () {
        var _a;
        if (this.parent) {
            var index = this.parent.indexOf(this);
            return index < 0 ? null : ((_a = this.parent.at(index + 1)) !== null && _a !== void 0 ? _a : null);
        }
        return null;
    };
    /**
     * returns the previous sibling
     * @returns {Column | null}
     */
    Column.prototype.previousSibling = function () {
        var _a;
        if (this.parent) {
            var index = this.parent.indexOf(this);
            return index < 1 ? null : ((_a = this.parent.at(index - 1)) !== null && _a !== void 0 ? _a : null);
        }
        return null;
    };
    /**
     * finds the underlying ranking column
     * @returns {Ranking|null} my current ranking
     */
    Column.prototype.findMyRanker = function () {
        if (this.parent) {
            return this.parent.findMyRanker();
        }
        return null;
    };
    /**
     * dumps this column to JSON compatible format
     * @param toDescRef helper mapping function
     * @returns {any} dump of this column
     */
    Column.prototype.dump = function (toDescRef) {
        var r = {
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
    };
    /**
     * restore the column content from a dump
     * @param dump column dump
     * @param _factory helper for creating columns
     */
    Column.prototype.restore = function (dump, _factory) {
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
    };
    /**
     * return the label of a given row for the current column
     * @param row the current row
     * @return {string} the label of this column at the specified row
     */
    Column.prototype.getLabel = function (row) {
        var v = this.getValue(row);
        return v == null ? '' : String(v);
    };
    /**
     * return the value of a given row for the current column
     * @param _row the current row
     * @return the value of this column at the specified row
     */
    Column.prototype.getValue = function (_row) {
        return ''; //no value
    };
    /**
     * returns the value to be used when exporting
     * @param format format hint
     */
    Column.prototype.getExportValue = function (row, format) {
        return format === 'text' ? this.getLabel(row) : this.getValue(row);
    };
    Column.prototype.getColor = function (_row) {
        return DEFAULT_COLOR;
    };
    Column.prototype.toCompareValue = function (_row, _valueCache) {
        return 0;
    };
    Column.prototype.toCompareValueType = function () {
        return ECompareValueType.UINT8;
    };
    /**
     * group the given row into a bin/group
     * @param _row
     * @return {IGroup}
     */
    Column.prototype.group = function (_row, _valueCache) {
        return Object.assign({}, defaultGroup);
    };
    Column.prototype.toCompareGroupValue = function (_rows, group, _valueCache) {
        return group.name.toLowerCase();
    };
    Column.prototype.toCompareGroupValueType = function () {
        return ECompareValueType.STRING;
    };
    /**
     * flag whether any filter is applied
     * @return {boolean}
     */
    Column.prototype.isFiltered = function () {
        return false;
    };
    /**
     * clear the filter
     * @return {boolean} whether the filtered needed to be reset
     */
    Column.prototype.clearFilter = function () {
        // hook to clear the filter
        return false;
    };
    /**
     * predicate whether the current row should be included
     * @param row
     * @return {boolean}
     */
    Column.prototype.filter = function (row, _valueCache) {
        return row != null;
    };
    /**
     * determines the renderer type that should be used to render this column. By default the same type as the column itself
     * @return {string}
     */
    Column.prototype.getRenderer = function () {
        return this.renderer;
    };
    Column.prototype.getGroupRenderer = function () {
        return this.groupRenderer;
    };
    Column.prototype.getSummaryRenderer = function () {
        return this.summaryRenderer;
    };
    Column.prototype.setRenderer = function (renderer) {
        if (renderer === this.renderer) {
            // nothing changes
            return;
        }
        this.fire([Column.EVENT_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.renderer, (this.renderer = renderer));
    };
    Column.prototype.setGroupRenderer = function (renderer) {
        if (renderer === this.groupRenderer) {
            // nothing changes
            return;
        }
        this.fire([Column.EVENT_GROUP_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.groupRenderer, (this.groupRenderer = renderer));
    };
    Column.prototype.setSummaryRenderer = function (renderer) {
        if (renderer === this.summaryRenderer) {
            // nothing changes
            return;
        }
        this.fire([Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY], this.summaryRenderer, (this.summaryRenderer = renderer));
    };
    /**
     * marks the header, values, or both as dirty such that the values are reevaluated
     * @param type specify in more detail what is dirty, by default whole column
     */
    Column.prototype.markDirty = function (type) {
        if (type === void 0) { type = 'all'; }
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
    };
    Column.prototype.getHeaderLabel = function (ctx) {
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
    };
    Column.prototype.getSummaryLabel = function (ctx, fallback) {
        if (fallback === void 0) { fallback = false; }
        var summary = this.desc.summary;
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
    };
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
    return Column;
}(AEventDispatcher));
export default Column;
//# sourceMappingURL=Column.js.map