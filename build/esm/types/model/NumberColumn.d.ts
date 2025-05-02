import { type IEventListener, type ISequence } from '../internal';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged } from './Column';
import { type IDataRow, type IGroup, ECompareValueType, type IValueColumnDesc, type ITypeFactory } from './interfaces';
import { type INumberColumn, EAdvancedSortMethod, type INumberDesc, type INumberFilter, type IMappingFunction, type IColorMappingFunction, type IMapAbleColumn } from './INumberColumn';
import type { dataLoaded } from './ValueColumn';
import ValueColumn from './ValueColumn';
export declare type INumberColumnDesc = INumberDesc & IValueColumnDesc<number>;
/**
 * emitted when the mapping property changes
 * @asMemberOf NumberColumn
 * @event
 */
export declare function mappingChanged_NC(previous: IMappingFunction, current: IMappingFunction): void;
/**
 * emitted when the color mapping property changes
 * @asMemberOf NumberColumn
 * @event
 */
export declare function colorMappingChanged_NC(previous: IColorMappingFunction, current: IColorMappingFunction): void;
/**
 * emitted when the filter property changes
 * @asMemberOf NumberColumn
 * @event
 */
export declare function filterChanged_NC(previous: INumberFilter | null, current: INumberFilter | null): void;
/**
 * emitted when the sort method property changes
 * @asMemberOf NumberColumn
 * @event
 */
export declare function sortMethodChanged_NC(previous: EAdvancedSortMethod, current: EAdvancedSortMethod): void;
/**
 * emitted when the grouping property changes
 * @asMemberOf NumberColumn
 * @event
 */
export declare function groupingChanged_NC(previous: number[], current: number[]): void;
/**
 * a number column mapped from an original input scale to an output range
 */
export default class NumberColumn extends ValueColumn<number> implements INumberColumn, IMapAbleColumn {
    static readonly EVENT_MAPPING_CHANGED = "mappingChanged";
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    static readonly EVENT_SORTMETHOD_CHANGED = "sortMethodChanged";
    static readonly EVENT_GROUPING_CHANGED = "groupingChanged";
    private mapping;
    private colorMapping;
    private original;
    private deriveMapping;
    /**
     * currently active filter
     * @private
     */
    private currentFilter;
    /**
     * The accuracy defines the deviation of values to the applied filter boundary.
     * Use an accuracy closer to 0 for columns with smaller numbers (e.g., 1e-9).
     * @private
     */
    private readonly filterAccuracy;
    private readonly numberFormat;
    private currentGroupThresholds;
    private groupSortMethod;
    constructor(id: string, desc: INumberColumnDesc, factory: ITypeFactory);
    getNumberFormat(): (n: number) => string;
    onDataUpdate(rows: ISequence<IDataRow>): void;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    protected createEventList(): string[];
    on(type: typeof NumberColumn.EVENT_MAPPING_CHANGED, listener: typeof mappingChanged_NC | null): this;
    on(type: typeof NumberColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChanged_NC | null): this;
    on(type: typeof NumberColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_NC | null): this;
    on(type: typeof NumberColumn.EVENT_SORTMETHOD_CHANGED, listener: typeof sortMethodChanged_NC | null): this;
    on(type: typeof NumberColumn.EVENT_GROUPING_CHANGED, listener: typeof groupingChanged_NC | null): this;
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
    getRange(): [string, string];
    getRawValue(row: IDataRow): number;
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
    getValue(row: IDataRow): number;
    getNumber(row: IDataRow): number;
    iterNumber(row: IDataRow): number[];
    iterRawNumber(row: IDataRow): number[];
    getRawNumber(row: IDataRow): number;
    toCompareValue(row: IDataRow, valueCache?: any): any;
    toCompareValueType(): ECompareValueType;
    toCompareGroupValue(rows: ISequence<IDataRow>, _group: IGroup, valueCache?: ISequence<any>): number;
    toCompareGroupValueType(): ECompareValueType;
    getOriginalMapping(): IMappingFunction;
    getMapping(): IMappingFunction;
    setMapping(mapping: IMappingFunction): void;
    getColor(row: IDataRow): string;
    getColorMapping(): IColorMappingFunction;
    setColorMapping(mapping: IColorMappingFunction): void;
    isFiltered(): boolean;
    getFilter(): INumberFilter;
    setFilter(value: INumberFilter | null): void;
    /**
     * filter the current row if any filter is set
     * @param row
     * @returns {boolean}
     */
    filter(row: IDataRow): boolean;
    clearFilter(): boolean;
    getGroupThresholds(): number[];
    setGroupThresholds(value: number[]): void;
    group(row: IDataRow): IGroup;
    getSortMethod(): EAdvancedSortMethod;
    setSortMethod(sortMethod: EAdvancedSortMethod): void;
}
//# sourceMappingURL=NumberColumn.d.ts.map