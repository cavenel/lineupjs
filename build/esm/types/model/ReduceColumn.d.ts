import { type IEventListener } from '../internal';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import type CompositeColumn from './CompositeColumn';
import type { addColumn, filterChanged, moveColumn, removeColumn } from './CompositeColumn';
import CompositeNumberColumn, { type ICompositeNumberColumnDesc } from './CompositeNumberColumn';
import type { IDataRow, ITypeFactory } from './interfaces';
import { EAdvancedSortMethod } from './INumberColumn';
/**
 *  factory for creating a description creating a max column
 * @param label
 * @returns {{type: string, label: string}}
 */
export declare function createReduceDesc(label?: string): {
    type: string;
    label: string;
};
export interface IReduceDesc {
    readonly reduce?: EAdvancedSortMethod;
}
export declare type IReduceColumnDesc = IReduceDesc & ICompositeNumberColumnDesc;
/**
 * emitted when the mapping property changes
 * @asMemberOf ReduceColumn
 * @event
 */
export declare function reduceChanged(previous: EAdvancedSortMethod, current: EAdvancedSortMethod): void;
/**
 * combines multiple columns by using the maximal value
 */
export default class ReduceColumn extends CompositeNumberColumn {
    static readonly EVENT_REDUCE_CHANGED = "reduceChanged";
    private reduce;
    constructor(id: string, desc: Readonly<IReduceColumnDesc>);
    get label(): string;
    getColor(row: IDataRow): string;
    protected compute(row: IDataRow): any;
    protected createEventList(): string[];
    on(type: typeof ReduceColumn.EVENT_REDUCE_CHANGED, listener: typeof reduceChanged | null): this;
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
    getReduce(): EAdvancedSortMethod;
    setReduce(reduce: EAdvancedSortMethod): void;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    get canJustAddNumbers(): boolean;
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
}
//# sourceMappingURL=ReduceColumn.d.ts.map