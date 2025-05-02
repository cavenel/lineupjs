import type { IColumnDesc, IColumnConstructor } from '../model';
import { DataProvider, LocalDataProvider, type IAggregationStrategy } from '../provider';
import { LineUp, Taggle } from '../ui';
import ColumnBuilder from './column/ColumnBuilder';
import LineUpBuilder from './LineUpBuilder';
import { RankingBuilder } from './RankingBuilder';
export * from './column';
export * from './RankingBuilder';
/**
 * builder for a LocalDataProvider along with LineUp configuration options
 */
export declare class DataBuilder extends LineUpBuilder {
    private readonly data;
    private readonly columns;
    private readonly providerOptions;
    private readonly rankBuilders;
    private _deriveColors;
    constructor(data: Record<string, unknown>[]);
    /**
     * use the schedulded task executor to asynchronously compute aggregations
     */
    scheduledTaskExecutor(): this;
    /**
     * when using a top-n strategy how many items should be shown
     */
    showTopN(n: number): this;
    /**
     * change the aggregation strategy that should be used when grouping by a column
     */
    aggregationStrategy(strategy: IAggregationStrategy): this;
    /**
     * whether to propagate a collapse operation to its children
     * @default true
     */
    propagateAggregationState(value: boolean): this;
    /**
     * allow just a single selection
     */
    singleSelection(): this;
    /**
     * allow multiple selections
     */
    multiSelection(): this;
    /**
     * filter all rankings by all filters in LineUp
     */
    filterGlobally(): this;
    /**
     * triggers to derive the column descriptions for the given data
     * @param {string} columns optional enforced order of columns
     */
    deriveColumns(...columns: (string | string[])[]): this;
    /**
     * tirggers to assign colors for the given descriptions
     */
    deriveColors(): this;
    /**
     * register another column type to this data provider
     * @param {string} type unique type id
     * @param {IColumnConstructor} clazz column class
     */
    registerColumnType(type: string, clazz: IColumnConstructor): this;
    /**
     * push another column description to this data provider
     * @param {IColumnDesc | ColumnBuilder} column column description or builder instance
     */
    column(column: IColumnDesc | ColumnBuilder | ((data: any[]) => IColumnDesc)): this;
    /**
     * restores a given ranking dump
     * @param dump dump as created using '.dump()'
     */
    restore(dump: any): this;
    /**
     * add the default ranking (all columns) to this data provider
     * @param {boolean} addSupportTypes add support types, too, default: true
     */
    defaultRanking(addSupportTypes?: boolean): this;
    /**
     * add another ranking to this data provider
     * @param {((data: DataProvider) => void) | RankingBuilder} builder ranking builder
     */
    ranking(builder: ((data: DataProvider) => void) | RankingBuilder): this;
    /**
     * builds the data provider itself
     * @returns {LocalDataProvider}
     */
    buildData(): LocalDataProvider;
    /**
     * builds LineUp at the given parent DOM node
     * @param {HTMLElement} node parent DOM node to attach
     * @returns {LineUp}
     */
    build(node: HTMLElement): LineUp;
    /**
     * builds Taggle at the given parent DOM node
     * @param {HTMLElement} node parent DOM node to attach
     * @returns {Taggle}
     */
    buildTaggle(node: HTMLElement): Taggle;
}
/**
 * creates a new builder instance for the given data
 * @param {Record<string, unknown>[]} arr data to visualize
 * @returns {DataBuilder}
 */
export declare function builder(arr: Record<string, unknown>[]): DataBuilder;
/**
 * build a new Taggle instance in the given node for the given data
 * @param {HTMLElement} node DOM node to attach to
 * @param {any[]} data data to visualize
 * @param {string[]} columns optional enforced column order
 * @returns {Taggle}
 */
export declare function asTaggle(node: HTMLElement, data: any[], ...columns: string[]): Taggle;
/**
 * build a new LineUp instance in the given node for the given data
 * @param {HTMLElement} node DOM node to attach to
 * @param {any[]} data data to visualize
 * @param {string[]} columns optional enforced column order
 * @returns {LineUp}
 */
export declare function asLineUp(node: HTMLElement, data: any[], ...columns: string[]): LineUp;
//# sourceMappingURL=DataBuilder.d.ts.map