import { type IEventListener, type ISequence } from '../internal';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged } from './Column';
import type { ICategoricalColumn, ICategoricalDesc, ICategoricalFilter, ICategory, ICategoricalColorMappingFunction } from './ICategoricalColumn';
import type { IDataRow, IValueColumnDesc, ITypeFactory } from './interfaces';
import type { INumberColumn } from './INumberColumn';
import type { dataLoaded } from './ValueColumn';
import ValueColumn from './ValueColumn';
export declare type IOrdinalColumnDesc = ICategoricalDesc & IValueColumnDesc<number>;
/**
 * emitted when the mapping property changes
 * @asMemberOf OrdinalColumn
 * @event
 */
export declare function mappingChanged_OC(previous: number[], current: number[]): void;
/**
 * emitted when the color mapping property changes
 * @asMemberOf OrdinalColumn
 * @event
 */
export declare function colorMappingChanged_OC(previous: ICategoricalColorMappingFunction, current: ICategoricalColorMappingFunction): void;
/**
 * emitted when the filter property changes
 * @asMemberOf OrdinalColumn
 * @event
 */
export declare function filterChanged_OC(previous: ICategoricalFilter | null, current: ICategoricalFilter | null): void;
/**
 * similar to a categorical column but the categories are mapped to numbers
 */
export default class OrdinalColumn extends ValueColumn<number> implements INumberColumn, ICategoricalColumn {
    static readonly EVENT_MAPPING_CHANGED = "mappingChanged";
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    readonly categories: ICategory[];
    private colorMapping;
    private readonly lookup;
    private currentFilter;
    constructor(id: string, desc: Readonly<IOrdinalColumnDesc>);
    onDataUpdate(rows: ISequence<IDataRow>): void;
    protected createEventList(): string[];
    on(type: typeof OrdinalColumn.EVENT_MAPPING_CHANGED, listener: typeof mappingChanged_OC | null): this;
    on(type: typeof OrdinalColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChanged_OC | null): this;
    on(type: typeof OrdinalColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_OC | null): this;
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
    getNumberFormat(): (n: number | {
        valueOf(): number;
    }) => string;
    get dataLength(): number;
    get labels(): string[];
    getValue(row: IDataRow): number;
    getCategory(row: IDataRow): Readonly<ICategory>;
    getCategories(row: IDataRow): Readonly<ICategory>[];
    iterCategory(row: IDataRow): Readonly<ICategory>[];
    iterNumber(row: IDataRow): number[];
    iterRawNumber(row: IDataRow): number[];
    getColor(row: IDataRow): string;
    getLabel(row: IDataRow): string;
    getLabels(row: IDataRow): string[];
    getValues(row: IDataRow): boolean[];
    getMap(row: IDataRow): {
        key: string;
        value: boolean;
    }[];
    getMapLabel(row: IDataRow): {
        key: string;
        value: string;
    }[];
    getSet(row: IDataRow): Set<ICategory>;
    getNumber(row: IDataRow): number;
    getRawNumber(row: IDataRow): number;
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    getMapping(): number[];
    setMapping(mapping: number[]): void;
    getColorMapping(): ICategoricalColorMappingFunction;
    setColorMapping(mapping: ICategoricalColorMappingFunction): void;
    isFiltered(): boolean;
    filter(row: IDataRow): boolean;
    group(row: IDataRow): import("./interfaces").IGroup;
    getFilter(): ICategoricalFilter;
    setFilter(filter: ICategoricalFilter | null): void;
    clearFilter(): boolean;
    toCompareValue(row: IDataRow): number;
    toCompareValueType(): import("./interfaces").ECompareValueType;
    getRenderer(): string;
}
//# sourceMappingURL=OrdinalColumn.d.ts.map