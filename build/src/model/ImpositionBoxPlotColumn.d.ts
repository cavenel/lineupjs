import { type IBoxPlotData, type ISequence, type IEventListener } from '../internal';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import CompositeColumn, { addColumn, filterChanged, moveColumn, removeColumn } from './CompositeColumn';
import type { IDataRow, IGroup, IColumnDesc } from './interfaces';
import { ESortMethod, type IBoxPlotColumn, type INumberFilter, type IMappingFunction, type IColorMappingFunction } from './INumberColumn';
import { ScaleMappingFunction } from './MappingFunction';
/**
 *  factory for creating a description creating a max column
 * @param label
 * @returns {{type: string, label: string}}
 */
export declare function createImpositionBoxPlotDesc(label?: string): {
    type: string;
    label: string;
};
/**
 * emitted when the mapping property changes
 * @asMemberOf ImpositionBoxPlotColumn
 * @event
 */
export declare function mappingChanged_IPBC(previous: IMappingFunction, current: IMappingFunction): void;
/**
 * emitted when the color mapping property changes
 * @asMemberOf ImpositionBoxPlotColumn
 * @event
 */
export declare function colorMappingChanged_IPBC(previous: IColorMappingFunction, current: IColorMappingFunction): void;
/**
 * implementation of a combine column, standard operations how to select
 */
export default class ImpositionBoxPlotColumn extends CompositeColumn implements IBoxPlotColumn {
    static readonly EVENT_MAPPING_CHANGED = "mappingChanged";
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    constructor(id: string, desc: Readonly<IColumnDesc>);
    get label(): string;
    private get wrapper();
    private get rest();
    getLabel(row: IDataRow): string;
    getColor(row: IDataRow): string;
    protected createEventList(): string[];
    on(type: typeof ImpositionBoxPlotColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChanged_IPBC | null): this;
    on(type: typeof ImpositionBoxPlotColumn.EVENT_MAPPING_CHANGED, listener: typeof mappingChanged_IPBC | null): this;
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
    getNumberFormat(): (v: number) => string;
    getValue(row: IDataRow): any;
    getNumber(row: IDataRow): number;
    getRawNumber(row: IDataRow): number;
    iterNumber(row: IDataRow): number[];
    iterRawNumber(row: IDataRow): number[];
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
    getBoxPlotData(row: IDataRow): IBoxPlotData | null;
    getRawBoxPlotData(row: IDataRow): IBoxPlotData | null;
    getMapping(): IMappingFunction | ScaleMappingFunction;
    getOriginalMapping(): IMappingFunction | ScaleMappingFunction;
    getSortMethod(): string;
    setSortMethod(value: ESortMethod): void;
    setMapping(mapping: IMappingFunction): void;
    getColorMapping(): IColorMappingFunction;
    setColorMapping(mapping: IColorMappingFunction): void;
    getFilter(): INumberFilter;
    setFilter(value: INumberFilter | null): void;
    getRange(): [string, string];
    toCompareValue(row: IDataRow): number;
    toCompareValueType(): import("./interfaces").ECompareValueType;
    group(row: IDataRow): IGroup;
    toCompareGroupValue(rows: ISequence<IDataRow>, group: IGroup): import("./interfaces").ICompareValue | import("./interfaces").ICompareValue[];
    toCompareGroupValueType(): import("./interfaces").ECompareValueType | import("./interfaces").ECompareValueType[];
    insert(col: Column, index: number): Column | null;
    protected insertImpl(col: Column, index: number): Column;
    protected removeImpl(child: Column, index: number): boolean;
}
//# sourceMappingURL=ImpositionBoxPlotColumn.d.ts.map