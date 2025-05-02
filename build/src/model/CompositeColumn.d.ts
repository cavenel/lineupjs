import { type IEventListener } from '../internal';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import type { IDataRow, IColumnParent, IFlatColumn, ITypeFactory } from './interfaces';
/**
 * emitted when the filter property changes
 * @asMemberOf CompositeColumn
 * @event
 */
export declare function filterChanged(previous: any | null, current: any | null): void;
/**
 * emitted when a column has been added
 * @asMemberOf CompositeColumn
 * @event
 */
export declare function addColumn(col: Column, index: number): void;
/**
 * emitted when a column has been moved within this composite columm
 * @asMemberOf CompositeColumn
 * @event
 */
export declare function moveColumn(col: Column, index: number, oldIndex: number): void;
/**
 * emitted when a column has been removed
 * @asMemberOf CompositeColumn
 * @event
 */
export declare function removeColumn(col: Column, index: number): void;
/**
 * implementation of a combine column, standard operations how to select
 */
export default class CompositeColumn extends Column implements IColumnParent {
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    static readonly EVENT_ADD_COLUMN = "addColumn";
    static readonly EVENT_MOVE_COLUMN = "moveColumn";
    static readonly EVENT_REMOVE_COLUMN = "removeColumn";
    protected readonly _children: Column[];
    protected createEventList(): string[];
    on(type: typeof CompositeColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged | null): this;
    on(type: typeof CompositeColumn.EVENT_ADD_COLUMN, listener: typeof addColumn | null): this;
    on(type: typeof CompositeColumn.EVENT_MOVE_COLUMN, listener: typeof moveColumn | null): this;
    on(type: typeof CompositeColumn.EVENT_REMOVE_COLUMN, listener: typeof removeColumn | null): this;
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
    assignNewId(idGenerator: () => string): void;
    get children(): Column[];
    get length(): number;
    flatten(r: IFlatColumn[], offset: number, levelsToGo?: number, padding?: number): number;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    /**
     * inserts a column at a the given position
     * @param col
     * @param index
     * @returns {any}
     */
    insert(col: Column, index: number): Column | null;
    move(col: Column, index: number): Column | null;
    protected insertImpl(col: Column, index: number): Column;
    protected moveImpl(col: Column, index: number, oldIndex: number): Column;
    push(col: Column): Column;
    at(index: number): Column;
    indexOf(col: Column): number;
    insertAfter(col: Column, ref: Column): Column;
    moveAfter(col: Column, ref: Column): Column;
    insertBefore(col: Column, ref: Column): Column;
    moveBefore(col: Column, ref: Column): Column;
    remove(col: Column): boolean;
    protected removeImpl(col: Column, index: number): boolean;
    isFiltered(): boolean;
    clearFilter(): boolean;
    filter(row: IDataRow): boolean;
    isLoaded(): boolean;
    get canJustAddNumbers(): boolean;
}
//# sourceMappingURL=CompositeColumn.d.ts.map