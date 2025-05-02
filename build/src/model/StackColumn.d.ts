import { type IEventListener } from '../internal';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import type CompositeColumn from './CompositeColumn';
import type { addColumn, filterChanged, moveColumn, removeColumn } from './CompositeColumn';
import CompositeNumberColumn, { type ICompositeNumberDesc } from './CompositeNumberColumn';
import type { IDataRow, IFlatColumn, IMultiLevelColumn, ITypeFactory } from './interfaces';
/**
 * factory for creating a description creating a stacked column
 * @param label
 * @returns {{type: string, label: string}}
 */
export declare function createStackDesc(label?: string, showNestedSummaries?: boolean): IStackColumnColumnDesc;
/**
 * emitted when the collapse property changes
 * @asMemberOf StackColumn
 * @event
 */
export declare function collapseChanged(previous: boolean, current: boolean): void;
/**
 * emitted when the weights change
 * @asMemberOf StackColumn
 * @event
 */
export declare function weightsChanged(previous: number[], current: number[]): void;
/**
 * emitted when the ratios between the children changes
 * @asMemberOf StackColumn
 * @event
 */
export declare function nestedChildRatio(previous: number[], current: number[]): void;
export declare type IStackColumnColumnDesc = ICompositeNumberDesc & {
    /**
     * show nested summaries
     * @default true
     */
    showNestedSummaries?: boolean;
};
/**
 * implementation of the stacked column
 */
export default class StackColumn extends CompositeNumberColumn implements IMultiLevelColumn {
    static readonly EVENT_COLLAPSE_CHANGED = "collapseChanged";
    static readonly EVENT_WEIGHTS_CHANGED = "weightsChanged";
    static readonly EVENT_MULTI_LEVEL_CHANGED = "nestedChildRatio";
    static readonly COLLAPSED_RENDERER = "number";
    private readonly adaptChange;
    /**
     * whether this stack column is collapsed i.e. just looks like an ordinary number column
     * @type {boolean}
     * @private
     */
    private collapsed;
    constructor(id: string, desc: IStackColumnColumnDesc);
    get label(): string;
    protected createEventList(): string[];
    on(type: typeof StackColumn.EVENT_COLLAPSE_CHANGED, listener: typeof collapseChanged | null): this;
    on(type: typeof StackColumn.EVENT_WEIGHTS_CHANGED, listener: typeof weightsChanged | null): this;
    on(type: typeof StackColumn.EVENT_MULTI_LEVEL_CHANGED, listener: typeof nestedChildRatio | null): this;
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
    setCollapsed(value: boolean): void;
    getCollapsed(): boolean;
    isShowNestedSummaries(): boolean;
    get canJustAddNumbers(): boolean;
    flatten(r: IFlatColumn[], offset: number, levelsToGo?: number, padding?: number): number;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    /**
     * inserts a column at a the given position
     */
    insert(col: Column, index: number, weight?: number): Column;
    push(col: Column, weight?: number): Column;
    insertAfter(col: Column, ref: Column, weight?: number): Column;
    /**
     * adapts weights according to an own width change
     * @param col
     * @param oldValue
     * @param newValue
     */
    private adaptWidthChange;
    getWeights(): number[];
    setWeights(weights: number[]): void;
    removeImpl(child: Column, index: number): boolean;
    setWidth(value: number): void;
    protected compute(row: IDataRow): number;
    getRenderer(): string;
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
}
//# sourceMappingURL=StackColumn.d.ts.map