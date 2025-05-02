import { type IEventListener } from '../internal';
import ArrayColumn, { type IArrayColumnDesc } from './ArrayColumn';
import type { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import type Column from './Column';
import type { dataLoaded } from './ValueColumn';
import type ValueColumn from './ValueColumn';
import type { IDateDesc, IDatesColumn, IDateFilter } from './IDateColumn';
import { type IDataRow, ECompareValueType, type ITypeFactory } from './interfaces';
export declare enum EDateSort {
    min = "min",
    max = "max",
    median = "median"
}
export interface IDatesDesc extends IDateDesc {
    sort?: EDateSort;
}
export declare type IDatesColumnDesc = IDatesDesc & IArrayColumnDesc<Date>;
/**
 * emitted when the sort method property changes
 * @asMemberOf DatesColumn
 * @event
 */
export declare function sortMethodChanged_DCS(previous: EDateSort, current: EDateSort): void;
/**
 * emitted when the filter property changes
 * @asMemberOf DatesColumn
 * @event
 */
export declare function filterChanged_DCS(previous: IDateFilter | null, current: IDateFilter | null): void;
export default class DatesColumn extends ArrayColumn<Date | null> implements IDatesColumn {
    static readonly EVENT_SORTMETHOD_CHANGED = "sortMethodChanged";
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    private readonly format;
    private readonly parse;
    private sort;
    private currentFilter;
    constructor(id: string, desc: Readonly<IDatesColumnDesc>);
    getFormatter(): (date: Date | null) => string;
    protected createEventList(): string[];
    on(type: typeof DatesColumn.EVENT_SORTMETHOD_CHANGED, listener: typeof sortMethodChanged_DCS | null): this;
    on(type: typeof DatesColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_DCS | null): this;
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
    getValue(row: IDataRow): (Date | null)[] | null;
    getLabels(row: IDataRow): string[];
    getDates(row: IDataRow): (Date | null)[];
    getDate(row: IDataRow): Date;
    iterDate(row: IDataRow): Date[];
    getSortMethod(): EDateSort;
    setSortMethod(sort: EDateSort): void;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    toCompareValue(row: IDataRow): number[];
    toCompareValueType(): ECompareValueType[];
    isFiltered(): boolean;
    getFilter(): IDateFilter;
    setFilter(value: IDateFilter | null): void;
    filter(row: IDataRow): boolean;
    clearFilter(): boolean;
}
//# sourceMappingURL=DatesColumn.d.ts.map