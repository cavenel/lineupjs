import { type IEventListener } from '../internal';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import CompositeColumn, { addColumn, filterChanged, moveColumn, removeColumn } from './CompositeColumn';
import type { IDataRow, IColumnDesc, IFlatColumn, IMultiLevelColumn, ITypeFactory } from './interfaces';
/**
 * emitted when the collapse property changes
 * @asMemberOf MultiLevelCompositeColumn
 * @event
 */
export declare function collapseChanged_MC(previous: boolean, current: boolean): void;
/**
 * emitted when the ratios between the children changes
 * @asMemberOf MultiLevelCompositeColumn
 * @event
 */
export declare function nestedChildRatio_MC(previous: number, current: number): void;
export declare type IMultiLevelCompositeColumnDesc = IColumnDesc & {
    /**
     * show nested summaries
     * @default true
     */
    showNestedSummaries?: boolean;
};
export default class MultiLevelCompositeColumn extends CompositeColumn implements IMultiLevelColumn {
    static readonly EVENT_COLLAPSE_CHANGED = "collapseChanged";
    static readonly EVENT_MULTI_LEVEL_CHANGED = "nestedChildRatio";
    static readonly COLLAPSED_RENDERER = "default";
    private readonly adaptChange;
    /**
     * whether this stack column is collapsed i.e. just looks like an ordinary number column
     * @type {boolean}
     * @private
     */
    private collapsed;
    constructor(id: string, desc: Readonly<IMultiLevelCompositeColumnDesc>);
    protected createEventList(): string[];
    on(type: typeof MultiLevelCompositeColumn.EVENT_COLLAPSE_CHANGED, listener: typeof collapseChanged_MC | null): this;
    on(type: typeof MultiLevelCompositeColumn.EVENT_MULTI_LEVEL_CHANGED, listener: typeof nestedChildRatio_MC | null): this;
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
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    flatten(r: IFlatColumn[], offset: number, levelsToGo?: number, padding?: number): number;
    /**
     * inserts a column at a the given position
     * @param col
     * @param index
     */
    insert(col: Column, index: number): Column;
    /**
     * adapts weights according to an own width change
     * @param oldValue
     * @param newValue
     */
    private adaptWidthChange;
    removeImpl(child: Column, index: number): boolean;
    setWidth(value: number): void;
    getRenderer(): string;
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
}
//# sourceMappingURL=MultiLevelCompositeColumn.d.ts.map