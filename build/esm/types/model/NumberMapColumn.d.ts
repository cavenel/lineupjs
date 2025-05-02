import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import type { dataLoaded } from './ValueColumn';
import type ValueColumn from './ValueColumn';
import type { IKeyValue } from './IArrayColumn';
import { type IDataRow, ECompareValueType, type ITypeFactory } from './interfaces';
import { EAdvancedSortMethod, type IAdvancedBoxPlotColumn, type INumberDesc, type INumberFilter, type IMappingFunction, type IColorMappingFunction } from './INumberColumn';
import MapColumn, { type IMapColumnDesc } from './MapColumn';
import { type IEventListener, type IAdvancedBoxPlotData } from '../internal';
export interface INumberMapDesc extends INumberDesc {
    readonly sort?: EAdvancedSortMethod;
}
export declare type INumberMapColumnDesc = INumberMapDesc & IMapColumnDesc<number>;
/**
 * emitted when the mapping property changes
 * @asMemberOf NumberMapColumn
 * @event
 */
export declare function mappingChanged_NMC(previous: IMappingFunction, current: IMappingFunction): void;
/**
 * emitted when the color mapping property changes
 * @asMemberOf NumberMapColumn
 * @event
 */
export declare function colorMappingChanged_NMC(previous: IColorMappingFunction, current: IColorMappingFunction): void;
/**
 * emitted when the sort method property changes
 * @asMemberOf NumberMapColumn
 * @event
 */
export declare function sortMethodChanged_NMC(previous: EAdvancedSortMethod, current: EAdvancedSortMethod): void;
/**
 * emitted when the filter property changes
 * @asMemberOf NumberMapColumn
 * @event
 */
export declare function filterChanged_NMC(previous: INumberFilter | null, current: INumberFilter | null): void;
export default class NumberMapColumn extends MapColumn<number> implements IAdvancedBoxPlotColumn {
    static readonly EVENT_MAPPING_CHANGED = "mappingChanged";
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    static readonly EVENT_SORTMETHOD_CHANGED = "sortMethodChanged";
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    private readonly numberFormat;
    private sort;
    private mapping;
    private original;
    private colorMapping;
    /**
     * currently active filter
     * @type {{min: number, max: number}}
     * @private
     */
    private currentFilter;
    constructor(id: string, desc: Readonly<INumberMapColumnDesc>, factory: ITypeFactory);
    getNumberFormat(): (n: number) => string;
    toCompareValue(row: IDataRow): number;
    toCompareValueType(): ECompareValueType;
    getBoxPlotData(row: IDataRow): IAdvancedBoxPlotData | null;
    getRange(): [string, string];
    getRawBoxPlotData(row: IDataRow): IAdvancedBoxPlotData | null;
    getNumber(row: IDataRow): number;
    getRawNumber(row: IDataRow): number;
    iterNumber(row: IDataRow): number[];
    iterRawNumber(row: IDataRow): number[];
    getValue(row: IDataRow): {
        key: string;
        value: number;
    }[];
    getRawValue(row: IDataRow): IKeyValue<number>[];
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
    getLabels(row: IDataRow): {
        key: string;
        value: string;
    }[];
    getSortMethod(): EAdvancedSortMethod;
    setSortMethod(sort: EAdvancedSortMethod): void;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    protected createEventList(): string[];
    on(type: typeof NumberMapColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChanged_NMC | null): this;
    on(type: typeof NumberMapColumn.EVENT_MAPPING_CHANGED, listener: typeof mappingChanged_NMC | null): this;
    on(type: typeof NumberMapColumn.EVENT_SORTMETHOD_CHANGED, listener: typeof sortMethodChanged_NMC | null): this;
    on(type: typeof NumberMapColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_NMC | null): this;
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
//# sourceMappingURL=NumberMapColumn.d.ts.map