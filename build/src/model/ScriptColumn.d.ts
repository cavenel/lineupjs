import type { IEventListener } from '../internal';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged } from './Column';
import type { addColumn, moveColumn, removeColumn } from './CompositeColumn';
import type CompositeColumn from './CompositeColumn';
import CompositeNumberColumn, { type ICompositeNumberDesc } from './CompositeNumberColumn';
import type { IDataRow, ITypeFactory } from './interfaces';
import { type IColorMappingFunction, type IMapAbleColumn, type IMapAbleDesc, type IMappingFunction, type INumberFilter } from './INumberColumn';
/**
 * factory for creating a description creating a mean column
 * @param label
 * @returns {{type: string, label: string}}
 */
export declare function createScriptDesc(label?: string): {
    type: string;
    label: string;
    script: string;
};
export interface IScriptDesc extends ICompositeNumberDesc, IMapAbleDesc {
    /**
     * the function to use, it has two parameters: children (current children) and values (their row values)
     * @default 'return Math.max.apply(Math,values)'
     */
    script?: string;
}
export declare type IScriptColumnDesc = IScriptDesc;
/**
 * emitted when the script property changes
 * @asMemberOf ScriptColumn
 * @event
 */
export declare function scriptChanged(previous: string, current: string): void;
/**
 * emitted when the mapping property changes
 * @asMemberOf ScriptColumn
 * @event
 */
export declare function mappingChanged(previous: IMappingFunction, current: IMappingFunction): void;
/**
 * emitted when the color mapping property changes
 * @asMemberOf ScriptColumn
 * @event
 */
export declare function colorMappingChanged(previous: IColorMappingFunction, current: IColorMappingFunction): void;
/**
 * emitted when the filter property changes
 * @asMemberOf ScriptColumn
 * @event
 */
export declare function filterChanged(previous: INumberFilter | null, current: INumberFilter | null): void;
/**
 * column combiner which uses a custom JavaScript function to combined the values
 * The script itself can be any valid JavaScript code. It will be embedded in a function.
 * Therefore the last statement has to return a value.
 *
 * In case of a single line statement the code piece statement `return` will be automatically prefixed.
 *
 * The function signature is: <br>` any, index: number, children: Column[], values: any[], raws: (number|null)[]) => number`
 *  <dl>
 *    <dt>param: ```
 *    <dd>the row in the dataset to compute the value for</dd>
 *    <dt>param: ``
 *    <dd>the index of the row</dd>
 *    <dt>param: `code></dt>
 *    <dd>the list of LineUp columns that are part of this ScriptColumn</dd>
 *    <dt>param: `values`</dt>
 *    <dd>the computed value of each column (see `children`) for the current row</dd>
 *    <dt>param: `raws`</dt>
 *    <dd>similar to `values`. Numeric columns return by default the normalized value, this array gives access to the original "raw" values before mapping is applied</dd>
 *    <dt>returns:</dt>
 *    <dd>the computed number <strong>in the range [0, 1] or NaN</strong></dd>
 *  </dl>
 *
 * In addition to the standard JavaScript functions and objects (Math, ...) a couple of utility functions are available: </p>
 * <dl>
 *    <dt>`max(arr: number[]) => number`</dt>
 *    <dd>computes the maximum of the given array of numbers</dd>
 *    <dt>`min(arr: number[]) => number`</dt>
 *    <dd>computes the minimum of the given array of numbers</dd>
 *    <dt>`extent(arr: number[]) => [number, number]`</dt>
 *    <dd>computes both minimum and maximum and returning an array with the first element the minimum and the second the maximum</dd>
 *    <dt>`clamp(v: number, min: number, max: number) => number`</dt>
 *    <dd>ensures that the given value is within the given min/max value</dd>
 *    <dt>`normalize(v: number, min: number, max: number) => number`</dt>
 *    <dd>normalizes the given value `(v - min) / (max - min)`</dd>
 *    <dt>`denormalize(v: number, min: number, max: number) => number`</dt>
 *    <dd>inverts a normalized value `v * (max - min) + min`</dd>
 *    <dt>`linear(v: number, input: [number, number], output: [number, number]) => number`</dt>
 *    <dd>performs a linear mapping from input domain to output domain both given as an array of [min, max] values. `denormalize(normalize(v, input[0], input[1]), output[0], output[1])`</dd>
 *  </dl>
 */
export default class ScriptColumn extends CompositeNumberColumn implements IMapAbleColumn {
    static readonly EVENT_MAPPING_CHANGED = "mappingChanged";
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    static readonly EVENT_SCRIPT_CHANGED = "scriptChanged";
    static readonly DEFAULT_SCRIPT = "let s = 0;\ncol.forEach((c) => s += c.v);\nreturn s / col.length";
    private script;
    private f;
    private mapping;
    private original;
    private colorMapping;
    /**
     * currently active filter
     * @type {{min: number, max: number}}
     * @private
     */
    private currentFilter;
    constructor(id: string, desc: Readonly<IScriptColumnDesc>, factory: ITypeFactory);
    protected createEventList(): string[];
    on(type: typeof ScriptColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChanged | null): this;
    on(type: typeof ScriptColumn.EVENT_MAPPING_CHANGED, listener: typeof mappingChanged | null): this;
    on(type: typeof ScriptColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged | null): this;
    on(type: typeof ScriptColumn.EVENT_SCRIPT_CHANGED, listener: typeof scriptChanged | null): this;
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
    setScript(script: string): void;
    getScript(): string;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    protected compute(row: IDataRow): number;
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
    getRange(): [string, string];
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
//# sourceMappingURL=ScriptColumn.d.ts.map