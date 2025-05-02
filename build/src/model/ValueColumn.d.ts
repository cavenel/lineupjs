import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, dirtyCaches, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged } from './Column';
import type { IValueColumnDesc, IDataRow, ITypeFactory } from './interfaces';
import type { IEventListener, ISequence } from '../internal';
/**
 * emitted when the data of this column has been loaded
 * @asMemberOf ValueColumn
 * @event
 */
export declare function dataLoaded(previous: boolean, current: boolean): void;
/**
 * a column having an accessor to get the cell value
 */
export default class ValueColumn<T> extends Column {
    static readonly EVENT_DATA_LOADED = "dataLoaded";
    static readonly RENDERER_LOADING = "loading";
    private readonly accessor;
    /**
     * is the data available
     * @type {boolean}
     */
    private loaded;
    constructor(id: string, desc: Readonly<IValueColumnDesc<T>>);
    onDataUpdate(_rows: ISequence<IDataRow>): void;
    protected createEventList(): string[];
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
    getLabel(row: IDataRow): string;
    getRaw(row: IDataRow): T | null;
    getValue(row: IDataRow): T | null;
    isLoaded(): boolean;
    setLoaded(loaded: boolean): void;
    getRenderer(): string;
    /**
     * patch the dump such that the loaded attribute is defined (for lazy loading columns)
     * @param toDescRef
     * @returns {any}
     */
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
}
//# sourceMappingURL=ValueColumn.d.ts.map