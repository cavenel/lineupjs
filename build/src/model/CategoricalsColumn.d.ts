import ArrayColumn, { type IArrayColumnDesc } from './ArrayColumn';
import type { ICategoricalDesc, ICategory, ICategoricalColorMappingFunction, ICategoricalsColumn } from './ICategoricalColumn';
import type { IDataRow, ITypeFactory } from './interfaces';
import type { dataLoaded } from './ValueColumn';
import type ValueColumn from './ValueColumn';
import type Column from './Column';
import { labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, widthChanged, dirtyCaches } from './Column';
import type { IEventListener, ISequence } from '../internal';
export declare type ICategoricalsColumnDesc = ICategoricalDesc & IArrayColumnDesc<string | null>;
/**
 * emitted when the color mapping property changes
 * @asMemberOf CategoricalsColumn
 * @event
 */
export declare function colorMappingChanged_CCS(previous: ICategoricalColorMappingFunction, current: ICategoricalColorMappingFunction): void;
/**
 * a string column with optional alignment
 */
export default class CategoricalsColumn extends ArrayColumn<string | null> implements ICategoricalsColumn {
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    readonly categories: ICategory[];
    private readonly lookup;
    private colorMapping;
    constructor(id: string, desc: Readonly<ICategoricalsColumnDesc>);
    onDataUpdate(rows: ISequence<IDataRow>): void;
    protected createEventList(): string[];
    on(type: typeof CategoricalsColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChanged_CCS | null): this;
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
    getCategories(row: IDataRow): Readonly<ICategory>[];
    getColors(row: IDataRow): string[];
    iterCategory(row: IDataRow): Readonly<ICategory>[];
    getValues(row: IDataRow): string[];
    getLabels(row: IDataRow): string[];
    getColorMapping(): ICategoricalColorMappingFunction;
    setColorMapping(mapping: ICategoricalColorMappingFunction): void;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
}
//# sourceMappingURL=CategoricalsColumn.d.ts.map