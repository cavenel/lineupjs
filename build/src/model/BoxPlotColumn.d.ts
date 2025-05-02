import type { IBoxPlotData, IEventListener, ISequence } from '../internal';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged } from './Column';
import { type IDataRow, ECompareValueType, type IValueColumnDesc, type ITypeFactory } from './interfaces';
import { ESortMethod, type IBoxPlotColumn, type INumberDesc, type INumberFilter, type IColorMappingFunction, type IMappingFunction } from './INumberColumn';
import type { dataLoaded } from './ValueColumn';
import ValueColumn from './ValueColumn';
export interface IBoxPlotDesc extends INumberDesc {
    sort?: ESortMethod;
}
export declare type IBoxPlotColumnDesc = IBoxPlotDesc & IValueColumnDesc<IBoxPlotData>;
/**
 * emitted when the sort method property changes
 * @asMemberOf BoxPlotColumn
 * @event
 */
export declare function sortMethodChanged_BPC(previous: ESortMethod, current: ESortMethod): void;
/**
 * emitted when the mapping property changes
 * @asMemberOf BoxPlotColumn
 * @event
 */
export declare function mappingChanged_BPC(previous: IMappingFunction, current: IMappingFunction): void;
/**
 * emitted when the color mapping property changes
 * @asMemberOf BoxPlotColumn
 * @event
 */
export declare function colorMappingChanged_BPC(previous: IColorMappingFunction, current: IColorMappingFunction): void;
/**
 * emitted when the filter property changes
 * @asMemberOf BoxPlotColumn
 * @event
 */
export declare function filterChanged_BPC(previous: INumberFilter | null, current: INumberFilter | null): void;
export default class BoxPlotColumn extends ValueColumn<IBoxPlotData> implements IBoxPlotColumn {
    static readonly EVENT_MAPPING_CHANGED = "mappingChanged";
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    static readonly EVENT_SORTMETHOD_CHANGED = "sortMethodChanged";
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    private readonly numberFormat;
    private sort;
    private mapping;
    private colorMapping;
    private original;
    private deriveMapping;
    /**
     * currently active filter
     * @type {{min: number, max: number}}
     * @private
     */
    private currentFilter;
    constructor(id: string, desc: Readonly<IBoxPlotColumnDesc>, factory: ITypeFactory);
    onDataUpdate(rows: ISequence<IDataRow>): void;
    getNumberFormat(): (n: number) => string;
    toCompareValue(row: IDataRow): number;
    toCompareValueType(): ECompareValueType;
    getBoxPlotData(row: IDataRow): IBoxPlotData | null;
    getRange(): [string, string];
    getRawBoxPlotData(row: IDataRow): IBoxPlotData | null;
    getRawValue(row: IDataRow): IBoxPlotData;
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
    getValue(row: IDataRow): IBoxPlotData;
    getNumber(row: IDataRow): number;
    getRawNumber(row: IDataRow): number;
    iterNumber(row: IDataRow): number[];
    iterRawNumber(row: IDataRow): number[];
    getLabel(row: IDataRow): string;
    getSortMethod(): ESortMethod;
    setSortMethod(sort: ESortMethod): void;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    protected createEventList(): string[];
    on(type: typeof BoxPlotColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChanged_BPC | null): this;
    on(type: typeof BoxPlotColumn.EVENT_MAPPING_CHANGED, listener: typeof mappingChanged_BPC | null): this;
    on(type: typeof BoxPlotColumn.EVENT_SORTMETHOD_CHANGED, listener: typeof sortMethodChanged_BPC | null): this;
    on(type: typeof BoxPlotColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_BPC | null): this;
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
    getOriginalMapping(): IMappingFunction;
    getMapping(): IMappingFunction;
    setMapping(mapping: IMappingFunction): void;
    getColor(row: IDataRow): string;
    getColorMapping(): IColorMappingFunction;
    setColorMapping(mapping: IColorMappingFunction): void;
    isFiltered(): boolean;
    getFilter(): INumberFilter;
    setFilter(value: INumberFilter | null): void;
    filter(row: IDataRow): boolean;
    clearFilter(): boolean;
}
//# sourceMappingURL=BoxPlotColumn.d.ts.map