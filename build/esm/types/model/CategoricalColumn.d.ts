import type { IEventListener, ISequence } from '../internal';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged } from './Column';
import type { ICategoricalColumn, ICategoricalColumnDesc, ICategoricalFilter, ICategory, ICategoricalColorMappingFunction } from './ICategoricalColumn';
import { type IDataRow, type IGroup, type ICompareValue, type ITypeFactory, ECompareValueType } from './interfaces';
import type { dataLoaded } from './ValueColumn';
import ValueColumn from './ValueColumn';
/**
 * emitted when the color mapping property changes
 * @asMemberOf CategoricalColumn
 * @event
 */
export declare function colorMappingChanged_CC(previous: ICategoricalColorMappingFunction, current: ICategoricalColorMappingFunction): void;
/**
 * emitted when the filter property changes
 * @asMemberOf CategoricalColumn
 * @event
 */
export declare function filterChanged_CC(previous: ICategoricalFilter | null, current: ICategoricalFilter | null): void;
/**
 * column for categorical values
 */
export default class CategoricalColumn extends ValueColumn<string> implements ICategoricalColumn {
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    readonly categories: ICategory[];
    private colorMapping;
    private readonly lookup;
    /**
     * set of categories to show
     * @type {null}
     * @private
     */
    private currentFilter;
    private readonly categoryOrder;
    constructor(id: string, desc: Readonly<ICategoricalColumnDesc>);
    onDataUpdate(rows: ISequence<IDataRow>): void;
    private sortCategories;
    protected createEventList(): string[];
    on(type: typeof CategoricalColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_CC | null): this;
    on(type: typeof CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChanged_CC | null): this;
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
    getValue(row: IDataRow): string;
    getCategory(row: IDataRow): Readonly<ICategory>;
    get dataLength(): number;
    get labels(): string[];
    getLabel(row: IDataRow): string;
    getCategories(row: IDataRow): Readonly<ICategory>[];
    getValues(row: IDataRow): boolean[];
    getLabels(row: IDataRow): string[];
    getMap(row: IDataRow): {
        key: string;
        value: boolean;
    }[];
    getMapLabel(row: IDataRow): {
        key: string;
        value: string;
    }[];
    getSet(row: IDataRow): Set<ICategory>;
    iterCategory(row: IDataRow): Readonly<ICategory>[];
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    getColor(row: IDataRow): string;
    getColorMapping(): ICategoricalColorMappingFunction;
    setColorMapping(mapping: ICategoricalColorMappingFunction): void;
    isFiltered(): boolean;
    filter(row: IDataRow, valueCache?: any): boolean;
    getFilter(): ICategoricalFilter;
    setFilter(filter: ICategoricalFilter | null): void;
    clearFilter(): boolean;
    toCompareValue(row: IDataRow, valueCache?: any): number;
    toCompareValueType(): ECompareValueType;
    group(row: IDataRow, valueCache?: any): IGroup;
    toCompareGroupValue(rows: ISequence<IDataRow>, _group: IGroup, valueCache?: ISequence<any>): ICompareValue[];
    toCompareGroupValueType(): ECompareValueType[];
    getGroupRenderer(): string;
}
//# sourceMappingURL=CategoricalColumn.d.ts.map