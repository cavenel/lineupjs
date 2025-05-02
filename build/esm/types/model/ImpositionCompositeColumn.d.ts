import { type IEventListener, type ISequence } from '../internal';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import CompositeColumn, { addColumn, filterChanged, moveColumn, removeColumn } from './CompositeColumn';
import type { IDataRow, IGroup, IColumnDesc } from './interfaces';
import { type INumberColumn, type IColorMappingFunction, type IMappingFunction, type IMapAbleColumn, type INumberFilter } from './INumberColumn';
import { ScaleMappingFunction } from './MappingFunction';
/**
 *  factory for creating a description creating a max column
 * @param label
 * @returns {{type: string, label: string}}
 */
export declare function createImpositionDesc(label?: string): {
    type: string;
    label: string;
};
/**
 * emitted when the mapping property changes
 * @asMemberOf ImpositionCompositeColumn
 * @event
 */
export declare function mappingChanged_ICC(previous: IMappingFunction, current: IMappingFunction): void;
/**
 * emitted when the color mapping property changes
 * @asMemberOf ImpositionCompositeColumn
 * @event
 */
export declare function colorMappingChanged_ICC(previous: IColorMappingFunction, current: IColorMappingFunction): void;
/**
 * implementation of a combine column, standard operations how to select
 */
export default class ImpositionCompositeColumn extends CompositeColumn implements INumberColumn, IMapAbleColumn {
    static readonly EVENT_MAPPING_CHANGED = "mappingChanged";
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    constructor(id: string, desc: Readonly<IColumnDesc>);
    get label(): string;
    private get wrapper();
    private get rest();
    protected createEventList(): string[];
    on(type: typeof ImpositionCompositeColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChanged_ICC | null): this;
    on(type: typeof ImpositionCompositeColumn.EVENT_MAPPING_CHANGED, listener: typeof mappingChanged_ICC | null): this;
    on(type: typeof CompositeColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged | null): this;
    on(type: typeof CompositeColumn.EVENT_ADD_COLUMN, listener: typeof addColumn | null): this;
    on(type: typeof CompositeColumn.EVENT_MOVE_COLUMN, listener: typeof moveColumn | null): this;
    on(type: typeof CompositeColumn.EVENT_REMOVE_COLUMN, listener: typeof removeColumn | null): this;
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
    getColor(row: IDataRow): string;
    getNumberFormat(): (v: number) => string;
    getValue(row: IDataRow): any;
    getNumber(row: IDataRow): number;
    getRawNumber(row: IDataRow): number;
    iterNumber(row: IDataRow): number[];
    iterRawNumber(row: IDataRow): number[];
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
    getMapping(): IMappingFunction | ScaleMappingFunction;
    getOriginalMapping(): IMappingFunction | ScaleMappingFunction;
    setMapping(mapping: IMappingFunction): void;
    getColorMapping(): IColorMappingFunction;
    setColorMapping(mapping: IColorMappingFunction): void;
    getFilter(): INumberFilter;
    setFilter(value: INumberFilter | null): void;
    getRange(): [string, string];
    toCompareValue(row: IDataRow): any;
    toCompareValueType(): import("./interfaces").ECompareValueType;
    toCompareGroupValue(rows: ISequence<IDataRow>, group: IGroup): number;
    toCompareGroupValueType(): import("./interfaces").ECompareValueType;
    insert(col: Column, index: number): Column | null;
    protected insertImpl(col: Column, index: number): Column;
    protected removeImpl(child: Column, index: number): boolean;
}
//# sourceMappingURL=ImpositionCompositeColumn.d.ts.map