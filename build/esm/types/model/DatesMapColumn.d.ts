import type { IDateColumn, IDateFilter } from './IDateColumn';
import type { IKeyValue } from './IArrayColumn';
import type { IDataRow, ITypeFactory } from './interfaces';
import MapColumn, { type IMapColumnDesc } from './MapColumn';
import { EDateSort, type IDatesDesc } from './DatesColumn';
import type { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import type Column from './Column';
import type { dataLoaded } from './ValueColumn';
import type ValueColumn from './ValueColumn';
import type { IEventListener } from '../internal';
export declare type IDateMapColumnDesc = IDatesDesc & IMapColumnDesc<Date | null>;
/**
 * emitted when the sort method property changes
 * @asMemberOf DatesMapColumn
 * @event
 */
export declare function sortMethodChanged_DMC(previous: EDateSort, current: EDateSort): void;
/**
 * emitted when the filter property changes
 * @asMemberOf DatesMapColumn
 * @event
 */
export declare function filterChanged_DMC(previous: IDateFilter | null, current: IDateFilter | null): void;
export default class DatesMapColumn extends MapColumn<Date | null> implements IDateColumn {
    static readonly EVENT_SORTMETHOD_CHANGED = "sortMethodChanged";
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    private readonly format;
    private readonly parse;
    private sort;
    private currentFilter;
    constructor(id: string, desc: Readonly<IDateMapColumnDesc>);
    getFormatter(): (date: Date | null) => string;
    protected createEventList(): string[];
    on(type: typeof DatesMapColumn.EVENT_SORTMETHOD_CHANGED, listener: typeof sortMethodChanged_DMC | null): this;
    on(type: typeof DatesMapColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_DMC | null): this;
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
    private parseValue;
    getDateMap(row: IDataRow): {
        key: string;
        value: Date;
    }[];
    iterDate(row: IDataRow): Date[];
    getValue(row: IDataRow): {
        key: string;
        value: Date;
    }[];
    getLabels(row: IDataRow): IKeyValue<string>[];
    getDates(row: IDataRow): (Date | null)[];
    getDate(row: IDataRow): Date;
    getSortMethod(): EDateSort;
    setSortMethod(sort: EDateSort): void;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    isFiltered(): boolean;
    getFilter(): IDateFilter;
    setFilter(value: IDateFilter | null): void;
    filter(row: IDataRow): boolean;
    clearFilter(): boolean;
}
//# sourceMappingURL=DatesMapColumn.d.ts.map