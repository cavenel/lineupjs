import { AEventDispatcher, type ISequence, type IEventListener } from '../internal';
import { type IColumnDump, ECompareValueType, type IColumnDesc, type IDataRow, type IGroup, type IColumnParent, type IColumnMetaData, type IFlatColumn, type ICompareValue, type ITypeFactory } from './interfaces';
import type Ranking from './Ranking';
/**
 * default color that should be used
 * @type {string}
 */
export declare const DEFAULT_COLOR = "#a0a0a0";
/**
 * emitted when the width property changes
 * @asMemberOf Column
 * @event
 */
export declare function widthChanged(previous: number, current: number): void;
/**
 * emitted when the label property changes
 * @asMemberOf Column
 * @event
 */
export declare function labelChanged(previous: string, current: string): void;
/**
 * emitted when the meta data property changes
 * @asMemberOf Column
 * @event
 */
export declare function metaDataChanged(previous: IColumnMetaData, current: IColumnMetaData): void;
/**
 * emitted when state of the column is dirty
 * @asMemberOf Column
 * @event
 */
export declare function dirty(): void;
/**
 * emitted when state of the column related to its header is dirty
 * @asMemberOf Column
 * @event
 */
export declare function dirtyHeader(): void;
/**
 * emitted when state of the column related to its values is dirty
 * @asMemberOf Column
 * @event
 */
export declare function dirtyValues(): void;
/**
 * emitted when state of the column related to cached values (hist, compare, ...) is dirty
 * @asMemberOf Column
 * @event
 */
export declare function dirtyCaches(): void;
/**
 * emitted when the renderer type property changes
 * @asMemberOf Column
 * @event
 */
export declare function rendererTypeChanged(previous: string, current: string): void;
/**
 * emitted when the group renderer property changes
 * @asMemberOf Column
 * @event
 */
export declare function groupRendererChanged(previous: string, current: string): void;
/**
 * emitted when the pattern property changes
 * @asMemberOf Column
 * @event
 */
export declare function summaryRendererChanged(previous: string, current: string): void;
/**
 * emitted when the visibility of this column changes
 * @asMemberOf Column
 * @event
 */
export declare function visibilityChanged(previous: boolean, current: boolean): void;
/**
 * a column in LineUp
 */
export default class Column extends AEventDispatcher {
    readonly desc: Readonly<IColumnDesc>;
    /**
     * magic variable for showing all columns
     * @type {number}
     */
    static readonly FLAT_ALL_COLUMNS = -1;
    static readonly EVENT_WIDTH_CHANGED = "widthChanged";
    static readonly EVENT_LABEL_CHANGED = "labelChanged";
    static readonly EVENT_METADATA_CHANGED = "metaDataChanged";
    static readonly EVENT_DIRTY = "dirty";
    static readonly EVENT_DIRTY_HEADER = "dirtyHeader";
    static readonly EVENT_DIRTY_VALUES = "dirtyValues";
    static readonly EVENT_DIRTY_CACHES = "dirtyCaches";
    static readonly EVENT_RENDERER_TYPE_CHANGED = "rendererTypeChanged";
    static readonly EVENT_GROUP_RENDERER_TYPE_CHANGED = "groupRendererChanged";
    static readonly EVENT_SUMMARY_RENDERER_TYPE_CHANGED = "summaryRendererChanged";
    static readonly EVENT_VISIBILITY_CHANGED = "visibilityChanged";
    /**
     * the id of this column
     */
    private uid;
    /**
     * width of the column
     * @type {number}
     * @private
     */
    private width;
    /**
     * parent column of this column, set when added to a ranking or combined column
     */
    parent: Readonly<IColumnParent> | null;
    private metadata;
    private renderer;
    private groupRenderer;
    private summaryRenderer;
    private visible;
    constructor(id: string, desc: Readonly<IColumnDesc>);
    get fixed(): boolean;
    get frozen(): boolean;
    get id(): string;
    assignNewId(idGenerator: () => string): void;
    get label(): string;
    get description(): string;
    /**
     * returns the fully qualified id i.e. path the parent
     * @returns {string}
     */
    get fqid(): string;
    get fqpath(): string;
    protected createEventList(): string[];
    on(type: typeof Column.EVENT_WIDTH_CHANGED, listener: typeof widthChanged | null): this;
    on(type: typeof Column.EVENT_LABEL_CHANGED, listener: typeof labelChanged | null): this;
    on(type: typeof Column.EVENT_METADATA_CHANGED, listener: typeof metaDataChanged | null): this;
    on(type: typeof Column.EVENT_DIRTY, listener: typeof dirty | null): this;
    on(type: typeof Column.EVENT_DIRTY_HEADER, listener: typeof dirtyHeader | null): this;
    on(type: typeof Column.EVENT_DIRTY_VALUES, listener: typeof dirtyValues | null): this;
    on(type: typeof Column.EVENT_DIRTY_CACHES, listener: typeof dirtyCaches | null): this;
    on(type: typeof Column.EVENT_RENDERER_TYPE_CHANGED, listener: typeof rendererTypeChanged | null): this;
    on(type: typeof Column.EVENT_GROUP_RENDERER_TYPE_CHANGED, listener: typeof groupRendererChanged | null): this;
    on(type: typeof Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, listener: typeof summaryRendererChanged | null): this;
    on(type: typeof Column.EVENT_VISIBILITY_CHANGED, listener: typeof visibilityChanged | null): this;
    on(type: string | string[], listener: IEventListener | null): this;
    getWidth(): number;
    hide(): void;
    show(): void;
    isVisible(): boolean;
    getVisible(): boolean;
    setVisible(value: boolean): void;
    /**
     * visitor pattern for flattening the columns
     * @param {IFlatColumn} r the result array
     * @param {number} offset left offset
     * @param {number} _levelsToGo how many levels down
     * @param {number} _padding padding between columns
     * @returns {number} the used width by this column
     */
    flatten(r: IFlatColumn[], offset: number, _levelsToGo?: number, _padding?: number): number;
    setWidth(value: number): void;
    setWidthImpl(value: number): void;
    setMetaData(value: Readonly<IColumnMetaData>): void;
    getMetaData(): Readonly<IColumnMetaData>;
    /**
     * triggers that the ranking is sorted by this column
     * @param ascending ascending order?
     * @param priority sorting priority
     * @returns {boolean} was successful
     */
    sortByMe(ascending?: boolean, priority?: number): boolean;
    groupByMe(): boolean;
    /**
     *
     * @return {number}
     */
    isGroupedBy(): number;
    /**
     * toggles the sorting order of this column in the ranking
     * @returns {boolean} was successful
     */
    toggleMySorting(): boolean;
    private isSortedByMeImpl;
    isSortedByMe(): {
        asc: "asc" | "desc" | undefined;
        priority: number | undefined;
    };
    groupSortByMe(ascending?: boolean, priority?: number): boolean;
    toggleMyGroupSorting(): boolean;
    isGroupSortedByMe(): {
        asc: "asc" | "desc" | undefined;
        priority: number | undefined;
    };
    /**
     * removes the column from the ranking
     * @returns {boolean} was successful
     */
    removeMe(): boolean;
    /**
     * called when the columns added to a ranking
     */
    attach(parent: IColumnParent): void;
    /**
     * called when the column is removed from the ranking
     */
    detach(): void;
    /**
     * inserts the given column after itself
     * @param col the column to insert
     * @returns {boolean} was successful
     */
    insertAfterMe(col: Column): boolean;
    /**
     * inserts the given column before itself
     * @param col the column to insert
     * @returns {boolean} was successful
     */
    insertBeforeMe(col: Column): boolean;
    /**
     * returns the next sibling
     * @returns {Column | null}
     */
    nextSibling(): Column | null;
    /**
     * returns the previous sibling
     * @returns {Column | null}
     */
    previousSibling(): Column | null;
    /**
     * finds the underlying ranking column
     * @returns {Ranking|null} my current ranking
     */
    findMyRanker(): Ranking | null;
    /**
     * dumps this column to JSON compatible format
     * @param toDescRef helper mapping function
     * @returns {any} dump of this column
     */
    dump(toDescRef: (desc: any) => any): any;
    /**
     * restore the column content from a dump
     * @param dump column dump
     * @param _factory helper for creating columns
     */
    restore(dump: IColumnDump, _factory: ITypeFactory): void;
    /**
     * return the label of a given row for the current column
     * @param row the current row
     * @return {string} the label of this column at the specified row
     */
    getLabel(row: IDataRow): string;
    /**
     * return the value of a given row for the current column
     * @param _row the current row
     * @return the value of this column at the specified row
     */
    getValue(_row: IDataRow): any | null;
    /**
     * returns the value to be used when exporting
     * @param format format hint
     */
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
    getColor(_row: IDataRow): string;
    toCompareValue(_row: IDataRow, _valueCache?: any): ICompareValue | ICompareValue[];
    toCompareValueType(): ECompareValueType | ECompareValueType[];
    /**
     * group the given row into a bin/group
     * @param _row
     * @return {IGroup}
     */
    group(_row: IDataRow, _valueCache?: any): IGroup;
    toCompareGroupValue(_rows: ISequence<IDataRow>, group: IGroup, _valueCache?: ISequence<any>): ICompareValue | ICompareValue[];
    toCompareGroupValueType(): ECompareValueType | ECompareValueType[];
    /**
     * flag whether any filter is applied
     * @return {boolean}
     */
    isFiltered(): boolean;
    /**
     * clear the filter
     * @return {boolean} whether the filtered needed to be reset
     */
    clearFilter(): boolean;
    /**
     * predicate whether the current row should be included
     * @param row
     * @return {boolean}
     */
    filter(row: IDataRow, _valueCache?: any): boolean;
    /**
     * determines the renderer type that should be used to render this column. By default the same type as the column itself
     * @return {string}
     */
    getRenderer(): string;
    getGroupRenderer(): string;
    getSummaryRenderer(): string;
    setRenderer(renderer: string): void;
    setGroupRenderer(renderer: string): void;
    setSummaryRenderer(renderer: string): void;
    /**
     * marks the header, values, or both as dirty such that the values are reevaluated
     * @param type specify in more detail what is dirty, by default whole column
     */
    markDirty(type?: 'header' | 'values' | 'all'): void;
    getHeaderLabel(ctx: 'header' | 'sidePanel' | 'reorder'): {
        content: string;
        asHTML: boolean;
    };
    getSummaryLabel(ctx: 'header' | 'sidePanel' | 'reorder', fallback?: boolean): {
        content: string;
        asHTML: boolean;
    };
}
//# sourceMappingURL=Column.d.ts.map