import { type IAdvancedBoxPlotData, type IEventListener, type ISequence } from '../internal';
import ArrayColumn, { type IArrayColumnDesc } from './ArrayColumn';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged } from './Column';
import type { IArrayDesc } from './IArrayColumn';
import { type IDataRow, ECompareValueType, type ITypeFactory } from './interfaces';
import { EAdvancedSortMethod, type IColorMappingFunction, type IMappingFunction, type INumberDesc, type INumberFilter, type INumbersColumn } from './INumberColumn';
import type { dataLoaded } from './ValueColumn';
import type ValueColumn from './ValueColumn';
export interface INumbersDesc extends IArrayDesc, INumberDesc {
    readonly sort?: EAdvancedSortMethod;
}
export declare type INumbersColumnDesc = INumbersDesc & IArrayColumnDesc<number>;
/**
 * emitted when the mapping property changes
 * @asMemberOf NumbersColumn
 * @event
 */
export declare function mappingChanged_NCS(previous: IMappingFunction, current: IMappingFunction): void;
/**
 * emitted when the color mapping property changes
 * @asMemberOf NumbersColumn
 * @event
 */
export declare function colorMappingChanged_NCS(previous: IColorMappingFunction, current: IColorMappingFunction): void;
/**
 * emitted when the sort method property changes
 * @asMemberOf NumbersColumn
 * @event
 */
export declare function sortMethodChanged_NCS(previous: EAdvancedSortMethod, current: EAdvancedSortMethod): void;
/**
 * emitted when the filter property changes
 * @asMemberOf NumbersColumn
 * @event
 */
export declare function filterChanged_NCS(previous: INumberFilter | null, current: INumberFilter | null): void;
export default class NumbersColumn extends ArrayColumn<number> implements INumbersColumn {
    static readonly EVENT_MAPPING_CHANGED = "mappingChanged";
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    static readonly EVENT_SORTMETHOD_CHANGED = "sortMethodChanged";
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    static readonly CENTER = 0;
    private readonly numberFormat;
    private sort;
    private mapping;
    private original;
    private colorMapping;
    private deriveMapping;
    /**
     * currently active filter
     * @type {{min: number, max: number}}
     * @private
     */
    private currentFilter;
    constructor(id: string, desc: Readonly<INumbersColumnDesc>, factory: ITypeFactory);
    onDataUpdate(rows: ISequence<IDataRow>): void;
    getNumberFormat(): (n: number) => string;
    toCompareValue(row: IDataRow): number;
    toCompareValueType(): ECompareValueType;
    getRawNumbers(row: IDataRow): number[];
    getBoxPlotData(row: IDataRow): IAdvancedBoxPlotData | null;
    getRange(): [string, string];
    getRawBoxPlotData(row: IDataRow): IAdvancedBoxPlotData | null;
    getNumbers(row: IDataRow): number[];
    getNumber(row: IDataRow): number;
    getRawNumber(row: IDataRow): number;
    getValue(row: IDataRow): number[];
    getValues(row: IDataRow): number[];
    iterNumber(row: IDataRow): number[];
    iterRawNumber(row: IDataRow): number[];
    getRawValue(row: IDataRow): number[];
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
    getLabels(row: IDataRow): string[];
    getSortMethod(): EAdvancedSortMethod;
    setSortMethod(sort: EAdvancedSortMethod): void;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    protected createEventList(): string[];
    on(type: typeof NumbersColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChanged_NCS | null): this;
    on(type: typeof NumbersColumn.EVENT_MAPPING_CHANGED, listener: typeof mappingChanged_NCS | null): this;
    on(type: typeof NumbersColumn.EVENT_SORTMETHOD_CHANGED, listener: typeof sortMethodChanged_NCS | null): this;
    on(type: typeof NumbersColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_NCS | null): this;
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
//# sourceMappingURL=NumbersColumn.d.ts.map