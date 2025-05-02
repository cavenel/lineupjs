import { AEventDispatcher, type ISequence, type IEventListener } from '../internal';
import { Column, type IColumnConstructor, Ranking, EDirtyReason, type IColumnDesc, type IDataRow, type IGroup, type IndicesArray, type IOrderedGroup, EAggregationState, type IColumnDump, type IRankingDump, type IColorMappingFunctionConstructor, type IMappingFunctionConstructor, type ITypeFactory } from '../model';
import { type IDataProvider, type IDataProviderDump, type IDataProviderOptions, type IExportOptions } from './interfaces';
import type { IRenderTasks } from '../renderer';
/**
 * emitted when a column has been added
 * @asMemberOf ADataProvider
 * @event
 */
export declare function addColumn(col: Column, index: number): void;
/**
 * emitted when a column has been moved within this composite column
 * @asMemberOf ADataProvider
 * @event
 */
export declare function moveColumn(col: Column, index: number, oldIndex: number): void;
/**
 * emitted when a column has been removed
 * @asMemberOf ADataProvider
 * @event
 */
export declare function removeColumn(col: Column, index: number): void;
/**
 * @asMemberOf ADataProvider
 * @event
 */
export declare function orderChanged(previous: number[], current: number[], previousGroups: IOrderedGroup[], currentGroups: IOrderedGroup[], dirtyReason: EDirtyReason[]): void;
/**
 * emitted when state of the column is dirty
 * @asMemberOf ADataProvider
 * @event
 */
export declare function dirty(): void;
/**
 * emitted when state of the column related to its header is dirty
 * @asMemberOf ADataProvider
 * @event
 */
export declare function dirtyHeader(): void;
/**
 * emitted when state of the column related to its values is dirty
 * @asMemberOf ADataProvider
 * @event
 */
export declare function dirtyValues(): void;
/**
 * emitted when state of the column related to cached values (hist, compare, ...) is dirty
 * @asMemberOf ADataProvider
 * @event
 */
export declare function dirtyCaches(): void;
/**
 * emitted when the data changes
 * @asMemberOf ADataProvider
 * @param rows the new data rows
 * @event
 */
export declare function dataChanged(rows: IDataRow[]): void;
/**
 * emitted when the selection changes
 * @asMemberOf ADataProvider
 * @param dataIndices the selected data indices
 * @event
 */
export declare function selectionChanged(dataIndices: number[]): void;
/**
 * @asMemberOf ADataProvider
 * @event
 */
export declare function addRanking(ranking: Ranking, index: number): void;
/**
 * @asMemberOf ADataProvider
 * @param ranking if null all rankings are removed else just the specific one
 * @event
 */
export declare function removeRanking(ranking: Ranking | null, index: number): void;
/**
 * @asMemberOf ADataProvider
 * @event
 */
export declare function addDesc(desc: IColumnDesc): void;
/**
 * @asMemberOf ADataProvider
 * @event
 */
export declare function removeDesc(desc: IColumnDesc): void;
/**
 * @asMemberOf ADataProvider
 * @event
 */
export declare function clearDesc(): void;
/**
 * @asMemberOf ADataProvider
 * @event
 */
export declare function showTopNChanged(previous: number, current: number): void;
/**
 * emitted when the selection changes
 * @asMemberOf ADataProvider
 * @param dataIndices the selected data indices
 * @event
 */
export declare function jumpToNearest(dataIndices: number[]): void;
/**
 * @asMemberOf ADataProvider
 * @event
 */
export declare function aggregate(ranking: Ranking, group: IGroup | IGroup[], previousTopN: number | number[], currentTopN: number | number[]): void;
/**
 * @asMemberOf ADataProvider
 * @event
 */
export declare function busy(busy: boolean): void;
/**
 * a basic data provider holding the data and rankings
 */
declare abstract class ADataProvider extends AEventDispatcher implements IDataProvider {
    static readonly EVENT_SELECTION_CHANGED = "selectionChanged";
    static readonly EVENT_DATA_CHANGED = "dataChanged";
    static readonly EVENT_ADD_COLUMN = "addColumn";
    static readonly EVENT_MOVE_COLUMN = "moveColumn";
    static readonly EVENT_REMOVE_COLUMN = "removeColumn";
    static readonly EVENT_ADD_RANKING = "addRanking";
    static readonly EVENT_REMOVE_RANKING = "removeRanking";
    static readonly EVENT_DIRTY = "dirty";
    static readonly EVENT_DIRTY_HEADER = "dirtyHeader";
    static readonly EVENT_DIRTY_VALUES = "dirtyValues";
    static readonly EVENT_DIRTY_CACHES = "dirtyCaches";
    static readonly EVENT_ORDER_CHANGED = "orderChanged";
    static readonly EVENT_SHOWTOPN_CHANGED = "showTopNChanged";
    static readonly EVENT_ADD_DESC = "addDesc";
    static readonly EVENT_CLEAR_DESC = "clearDesc";
    static readonly EVENT_REMOVE_DESC = "removeDesc";
    static readonly EVENT_JUMP_TO_NEAREST = "jumpToNearest";
    static readonly EVENT_GROUP_AGGREGATION_CHANGED = "aggregate";
    static readonly EVENT_BUSY = "busy";
    private static readonly FORWARD_RANKING_EVENTS;
    /**
     * all rankings
     * @type {Array}
     * @private
     */
    private readonly rankings;
    /**
     * the current selected indices
     * @type {OrderedSet}
     */
    private readonly selection;
    private readonly aggregations;
    private uid;
    private readonly typeFactory;
    private readonly options;
    /**
     * lookup map of a column type to its column implementation
     */
    readonly columnTypes: {
        [columnType: string]: IColumnConstructor;
    };
    readonly colorMappingFunctionTypes: {
        [colorMappingFunctionType: string]: IColorMappingFunctionConstructor;
    };
    readonly mappingFunctionTypes: {
        [mappingFunctionType: string]: IMappingFunctionConstructor;
    };
    private showTopN;
    constructor(options?: Partial<IDataProviderOptions>);
    private createTypeFactory;
    getTypeFactory(): ITypeFactory;
    /**
     * events:
     *  * column changes: addColumn, removeColumn
     *  * ranking changes: addRanking, removeRanking
     *  * dirty: dirty, dirtyHeder, dirtyValues
     *  * selectionChanged
     * @returns {string[]}
     */
    protected createEventList(): string[];
    on(type: typeof ADataProvider.EVENT_BUSY, listener: typeof busy | null): this;
    on(type: typeof ADataProvider.EVENT_DATA_CHANGED, listener: typeof dataChanged | null): this;
    on(type: typeof ADataProvider.EVENT_SHOWTOPN_CHANGED, listener: typeof showTopNChanged | null): this;
    on(type: typeof ADataProvider.EVENT_ADD_COLUMN, listener: typeof addColumn | null): this;
    on(type: typeof ADataProvider.EVENT_MOVE_COLUMN, listener: typeof moveColumn | null): this;
    on(type: typeof ADataProvider.EVENT_REMOVE_COLUMN, listener: typeof removeColumn | null): this;
    on(type: typeof ADataProvider.EVENT_ADD_RANKING, listener: typeof addRanking | null): this;
    on(type: typeof ADataProvider.EVENT_REMOVE_RANKING, listener: typeof removeRanking | null): this;
    on(type: typeof ADataProvider.EVENT_DIRTY, listener: typeof dirty | null): this;
    on(type: typeof ADataProvider.EVENT_DIRTY_HEADER, listener: typeof dirtyHeader | null): this;
    on(type: typeof ADataProvider.EVENT_DIRTY_VALUES, listener: typeof dirtyValues | null): this;
    on(type: typeof ADataProvider.EVENT_DIRTY_CACHES, listener: typeof dirtyCaches | null): this;
    on(type: typeof ADataProvider.EVENT_ORDER_CHANGED, listener: typeof orderChanged | null): this;
    on(type: typeof ADataProvider.EVENT_ADD_DESC, listener: typeof addDesc | null): this;
    on(type: typeof ADataProvider.EVENT_REMOVE_DESC, listener: typeof removeDesc | null): this;
    on(type: typeof ADataProvider.EVENT_CLEAR_DESC, listener: typeof clearDesc | null): this;
    on(type: typeof ADataProvider.EVENT_JUMP_TO_NEAREST, listener: typeof jumpToNearest | null): this;
    on(type: typeof ADataProvider.EVENT_GROUP_AGGREGATION_CHANGED, listener: typeof aggregate | null): this;
    on(type: typeof ADataProvider.EVENT_SELECTION_CHANGED, listener: typeof selectionChanged | null): this;
    on(type: string | string[], listener: IEventListener | null): this;
    abstract getTotalNumberOfRows(): number;
    /**
     * returns a list of all known column descriptions
     * @returns {Array}
     */
    abstract getColumns(): IColumnDesc[];
    abstract getTaskExecutor(): IRenderTasks;
    /**
     * adds a new ranking
     * @param existing an optional existing ranking to clone
     * @return the new ranking
     */
    pushRanking(existing?: Ranking): Ranking;
    protected fireBusy(busy: boolean): void;
    takeSnapshot(col: Column): Ranking;
    insertRanking(r: Ranking, index?: number): void;
    private triggerReorder;
    /**
     * removes a ranking from this data provider
     * @param ranking
     * @returns {boolean}
     */
    removeRanking(ranking: Ranking): boolean;
    /**
     * removes all rankings
     */
    clearRankings(): void;
    clearFilters(): void;
    /**
     * returns a list of all current rankings
     * @returns {Ranking[]}
     */
    getRankings(): Ranking[];
    /**
     * returns the last ranking for quicker access
     * @returns {Ranking}
     */
    getFirstRanking(): Ranking;
    /**
     * returns the last ranking for quicker access
     * @returns {Ranking}
     */
    getLastRanking(): Ranking;
    ensureOneRanking(): void;
    destroy(): void;
    /**
     * hook method for cleaning up a ranking
     * @param _ranking
     */
    cleanUpRanking(_ranking: Ranking): void;
    /**
     * abstract method for cloning a ranking
     * @param existing
     * @returns {null}
     */
    abstract cloneRanking(existing?: Ranking): Ranking;
    /**
     * adds a column to a ranking described by its column description
     * @param ranking the ranking to add the column to
     * @param desc the description of the column
     * @return {Column} the newly created column or null
     */
    push(ranking: Ranking, desc: IColumnDesc): Column | null;
    /**
     * adds a column to a ranking described by its column description
     * @param ranking the ranking to add the column to
     * @param index the position to insert the column
     * @param desc the description of the column
     * @return {Column} the newly created column or null
     */
    insert(ranking: Ranking, index: number, desc: IColumnDesc): Column;
    /**
     * creates a new unique id for a column
     * @returns {string}
     */
    private nextId;
    private fixDesc;
    protected cleanDesc(desc: IColumnDesc): IColumnDesc;
    /**
     * creates an internal column model out of the given column description
     * @param desc
     * @returns {Column} the new column or null if it can't be created
     */
    create(desc: IColumnDesc): Column | null;
    protected patchColumn(column: Column): Column;
    protected instantiateColumn(type: IColumnConstructor, id: string, desc: IColumnDesc, typeFactory: ITypeFactory): Column;
    /**
     * clones a column by dumping and restoring
     * @param col
     * @returns {Column}
     */
    clone(col: Column): Column;
    /**
     * restores a column from a dump
     * @param dump
     * @returns {Column}
     */
    restoreColumn(dump: any): Column;
    /**
     * finds a column in all rankings returning the first match
     * @param idOrFilter by id or by a filter function
     * @returns {Column}
     */
    find(idOrFilter: string | ((col: Column) => boolean)): Column | null;
    /**
     * dumps this whole provider including selection and the rankings
     * @returns {{uid: number, selection: number[], rankings: *[]}}
     */
    dump(): IDataProviderDump;
    /**
     * dumps a specific column
     */
    dumpColumn(col: Column): IColumnDump;
    /**
     * for better dumping describe reference, by default just return the description
     */
    toDescRef(desc: any): any;
    /**
     * inverse operation of toDescRef
     */
    fromDescRef(descRef: any): any;
    restoreRanking(dump: IRankingDump): Ranking;
    restore(dump: IDataProviderDump): void;
    abstract findDesc(ref: string): IColumnDesc | null;
    /**
     * generates a default ranking by using all column descriptions ones
     */
    deriveDefault(addSupportType?: boolean): Ranking;
    isAggregated(ranking: Ranking, group: IGroup): boolean;
    getAggregationState(ranking: Ranking, group: IGroup): EAggregationState;
    setAggregated(ranking: Ranking, group: IGroup | IGroup[], value: boolean): void;
    setAggregationState(ranking: Ranking, group: IGroup | IGroup[], value: EAggregationState): void;
    getTopNAggregated(ranking: Ranking, group: IGroup): number;
    private unaggregateParents;
    getAggregationStrategy(): import("./interfaces").IAggregationStrategy;
    private initAggregateState;
    setTopNAggregated(ranking: Ranking, group: IGroup | IGroup[], value: number | number[]): void;
    aggregateAllOf(ranking: Ranking, aggregateAll: boolean | number | EAggregationState, groups?: IOrderedGroup[]): void;
    getShowTopN(): number;
    setShowTopN(value: number): void;
    /**
     * sorts the given ranking and eventually return a ordering of the data items
     * @param ranking
     * @return {Promise<any>}
     */
    abstract sort(ranking: Ranking, dirtyReason: EDirtyReason[]): Promise<{
        groups: IOrderedGroup[];
        index2pos: IndicesArray;
    }> | {
        groups: IOrderedGroup[];
        index2pos: IndicesArray;
    };
    /**
     * returns a view in the order of the given indices
     * @param indices
     * @return {Promise<any>}
     */
    abstract view(indices: ArrayLike<number>): Promise<any[]> | any[];
    abstract getRow(index: number): Promise<IDataRow> | IDataRow;
    /**
     * returns a data sample used for the mapping editor
     * @param col
     * @return {Promise<any>}
     */
    abstract mappingSample(col: Column): Promise<ISequence<number>> | ISequence<number>;
    /**
     * is the given row selected
     * @param index
     * @return {boolean}
     */
    isSelected(index: number): boolean;
    /**
     * also select the given row
     * @param index
     */
    select(index: number): void;
    /**
     * hook for selecting elements matching the given arguments
     * @param search
     * @param col
     */
    abstract searchAndJump(search: string | RegExp, col: Column, first?: boolean): number[] | void;
    jumpToNearest(indices: number[]): void;
    /**
     * also select all the given rows
     * @param indices
     */
    selectAll(indices: IndicesArray): void;
    selectAllOf(ranking: Ranking): void;
    /**
     * set the selection to the given rows
     * @param indices
     */
    setSelection(indices: number[]): void;
    /**
     * toggles the selection of the given data index
     * @param index
     * @param additional just this element or all
     * @returns {boolean} whether the index is currently selected
     */
    toggleSelection(index: number, additional?: boolean): boolean;
    /**
     * deselect the given row
     * @param index
     */
    deselect(index: number): void;
    /**
     * also select all the given rows
     * @param indices
     */
    deselectAll(indices: IndicesArray): void;
    /**
     * returns a promise containing the selected rows
     * @return {Promise<any[]>}
     */
    selectedRows(): Promise<any[]> | any[];
    /**
     * returns the currently selected indices
     * @returns {Array}
     */
    getSelection(): number[];
    /**
     * clears the selection
     */
    clearSelection(): void;
    /**
     * utility to export a ranking to a table with the given separator
     * @param ranking
     * @param options
     * @returns {Promise<string>}
     */
    exportTable(ranking: Ranking, options?: Partial<IExportOptions>): Promise<string> | string;
    /**
     * utility to export the selection within the given ranking to a table with the given separator
     * @param ranking
     * @param options
     * @returns {Promise<string>}
     */
    exportSelection(options?: Partial<IExportOptions> & {
        ranking?: Ranking;
    }): Promise<string> | string;
}
export default ADataProvider;
//# sourceMappingURL=ADataProvider.d.ts.map