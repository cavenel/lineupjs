import { type ISequence, type IEventListener } from '../internal';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged } from './Column';
import type { IDateColumn, IDateDesc, IDateFilter, IDateGrouper } from './IDateColumn';
import { type IDataRow, type IGroup, ECompareValueType, type IValueColumnDesc, type ITypeFactory } from './interfaces';
import type { dataLoaded } from './ValueColumn';
import ValueColumn from './ValueColumn';
export declare type IDateColumnDesc = IValueColumnDesc<Date> & IDateDesc;
/**
 * emitted when the filter property changes
 * @asMemberOf DateColumn
 * @event
 */
export declare function filterChanged_DC(previous: IDateFilter | null, current: IDateFilter | null): void;
/**
 * emitted when the grouping property changes
 * @asMemberOf DateColumn
 * @event
 */
export declare function groupingChanged_DC(previous: IDateGrouper | null, current: IDateGrouper | null): void;
export default class DateColumn extends ValueColumn<Date> implements IDateColumn {
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    static readonly EVENT_GROUPING_CHANGED = "groupingChanged";
    static readonly DEFAULT_DATE_FORMAT = "%x";
    private readonly format;
    private readonly parse;
    /**
     * currently active filter
     * @type {{min: number, max: number}}
     * @private
     */
    private currentFilter;
    private currentGrouper;
    constructor(id: string, desc: Readonly<IDateColumnDesc>);
    getFormatter(): (date: Date | null) => string;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    protected createEventList(): string[];
    on(type: typeof DateColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_DC | null): this;
    on(type: typeof DateColumn.EVENT_GROUPING_CHANGED, listener: typeof groupingChanged_DC | null): this;
    on(type: typeof ValueColumn.EVENT_DATA_LOADED, listener: typeof dataLoaded | null): this;
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
    getValue(row: IDataRow): Date | null;
    getDate(row: IDataRow): Date;
    iterDate(row: IDataRow): Date[];
    getLabel(row: IDataRow): string;
    isFiltered(): boolean;
    clearFilter(): boolean;
    getFilter(): IDateFilter;
    setFilter(value: IDateFilter | null): void;
    /**
     * filter the current row if any filter is set
     * @param row
     * @returns {boolean}
     */
    filter(row: IDataRow, valueCache?: any): boolean;
    toCompareValue(row: IDataRow, valueCache?: any): number;
    toCompareValueType(): ECompareValueType;
    getDateGrouper(): IDateGrouper;
    setDateGrouper(value: IDateGrouper): void;
    group(row: IDataRow, valueCache?: any): IGroup;
    toCompareGroupValue(rows: ISequence<IDataRow>, _group: IGroup, valueCache?: ISequence<any>): number;
    toCompareGroupValueType(): ECompareValueType;
}
//# sourceMappingURL=DateColumn.d.ts.map