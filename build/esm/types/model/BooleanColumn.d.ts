import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import type { dataLoaded } from './ValueColumn';
import ValueColumn from './ValueColumn';
import type { ICategoricalColumn, ICategory, ICategoricalColorMappingFunction, ICategoricalFilter } from './ICategoricalColumn';
import { type IDataRow, ECompareValueType, type IValueColumnDesc, type ITypeFactory } from './interfaces';
import type { IEventListener } from '../internal';
export interface IBooleanDesc {
    /**
     * string to show for true
     * @default ✓
     */
    trueMarker?: string;
    /**
     * string to show for false
     * @default (empty)
     */
    falseMarker?: string;
    /**
     * list of values that indicate true values (case insensitive)
     * @default 'y', 'yes', 'true', true, '1','1.0', 1, 1.0, 'on'
     */
    trueValues?: readonly any[];
}
export declare type IBooleanColumnDesc = IValueColumnDesc<boolean> & IBooleanDesc;
/**
 * emitted when the color mapping property changes
 * @asMemberOf BooleanColumn
 * @event
 */
export declare function colorMappingChanged_BC(previous: ICategoricalColorMappingFunction, current: ICategoricalColorMappingFunction): void;
/**
 * emitted when the filter property changes
 * @asMemberOf BooleanColumn
 * @event
 */
export declare function filterChanged_BC(previous: ICategoricalFilter | null, current: ICategoricalFilter | null): void;
/**
 * a string column with optional alignment
 */
export default class BooleanColumn extends ValueColumn<boolean> implements ICategoricalColumn {
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    static readonly GROUP_TRUE: {
        name: string;
        color: string;
    };
    static readonly GROUP_FALSE: {
        name: string;
        color: string;
    };
    static readonly DEFAULT_TRUE_VALUES: any[];
    private currentFilter;
    private colorMapping;
    readonly categories: ICategory[];
    constructor(id: string, desc: Readonly<IBooleanColumnDesc>);
    protected createEventList(): string[];
    on(type: typeof BooleanColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_BC | null): this;
    on(type: typeof BooleanColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChanged_BC | null): this;
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
    get dataLength(): number;
    get labels(): string[];
    getValue(row: IDataRow): boolean;
    getCategoryOfBoolean(v: boolean | null): ICategory;
    getCategory(row: IDataRow): ICategory;
    getCategories(row: IDataRow): ICategory[];
    iterCategory(row: IDataRow): ICategory[];
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
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    getColorMapping(): ICategoricalColorMappingFunction;
    setColorMapping(mapping: ICategoricalColorMappingFunction): void;
    isFiltered(): boolean;
    filter(row: IDataRow): boolean;
    getFilter(): ICategoricalFilter;
    setFilter(filter: boolean | null | ICategoricalFilter): void;
    clearFilter(): boolean;
    toCompareValue(row: IDataRow): number;
    toCompareValueType(): ECompareValueType;
    group(row: IDataRow): {
        name: string;
        color: string;
    };
}
//# sourceMappingURL=BooleanColumn.d.ts.map