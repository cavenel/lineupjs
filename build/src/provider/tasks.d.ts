import { type IAbortAblePromise } from 'lineupengine';
import { type IAdvancedBoxPlotData, type ICategoricalStatistics, type IDateStatistics, type IStatistics, type ISequence, type IStringStatistics } from '../internal';
import { Column, type ICompareValue, type ICategoricalLikeColumn, type IDataRow, type IDateColumn, type IGroup, type IndicesArray, type INumberColumn, Ranking, type UIntTypedArray, type ICategory, StringColumn } from '../model';
import type { IRenderTask, IRenderTasks } from '../renderer';
import type { CompareLookup } from './sort';
/**
 * a render task that is already resolved
 */
export declare class TaskNow<T> implements IRenderTask<T> {
    readonly v: T;
    constructor(v: T);
    then<U = void>(onfullfilled: (value: T) => U): U;
}
/**
 * factory function for
 */
export declare function taskNow<T>(v: T): TaskNow<T>;
/**
 * a render task based on an abortable promise
 */
export declare class TaskLater<T> implements IRenderTask<T> {
    readonly v: IAbortAblePromise<T>;
    constructor(v: IAbortAblePromise<T>);
    then<U = void>(onfullfilled: (value: T | symbol) => U): IAbortAblePromise<U>;
}
export declare function taskLater<T>(v: IAbortAblePromise<T>): TaskLater<T>;
/**
 * similar to Promise.all
 */
export declare function tasksAll<T>(tasks: IRenderTask<T>[]): IRenderTask<T[]>;
export interface IRenderTaskExecutor extends IRenderTasks {
    setData(data: IDataRow[]): void;
    dirtyColumn(col: Column, type: 'data' | 'summary' | 'group'): void;
    dirtyRanking(ranking: Ranking, type: 'data' | 'summary' | 'group'): void;
    groupCompare(ranking: Ranking, group: IGroup, rows: IndicesArray): IRenderTask<ICompareValue[]>;
    preCompute(ranking: Ranking, groups: {
        rows: IndicesArray;
        group: IGroup;
    }[], maxDataIndex: number): void;
    preComputeCol(col: Column): void;
    preComputeData(ranking: Ranking): void;
    copyData2Summary(ranking: Ranking): void;
    copyCache(col: Column, from: Column): void;
    sort(ranking: Ranking, group: IGroup, indices: IndicesArray, singleCall: boolean, maxDataIndex: number, lookups?: CompareLookup): Promise<IndicesArray>;
    terminate(): void;
    valueCache(col: Column): undefined | ((dataIndex: number) => any);
}
export declare class MultiIndices {
    readonly indices: IndicesArray[];
    private readonly maxDataIndex;
    private _joined;
    constructor(indices: IndicesArray[], maxDataIndex: number);
    get joined(): Uint8Array<ArrayBuffer> | Uint16Array<ArrayBuffer> | Uint32Array<ArrayBuffer> | (readonly number[] & ArrayLike<number>);
}
export interface ARenderTaskOptions {
    stringTopNCount: number | readonly string[];
}
export declare class ARenderTasks {
    protected readonly valueCacheData: Map<string, Int32Array<ArrayBufferLike> | Float32Array<ArrayBufferLike> | Float64Array<ArrayBufferLike> | readonly string[] | UIntTypedArray>;
    protected readonly byIndex: (i: number) => IDataRow;
    protected readonly options: ARenderTaskOptions;
    protected data: IDataRow[];
    constructor(options?: Partial<ARenderTaskOptions>);
    protected byOrder(indices: IndicesArray): ISequence<IDataRow>;
    protected byOrderAcc<T>(indices: IndicesArray, acc: (row: IDataRow) => T): ISequence<T>;
    /**
     * builder factory to create an iterator that can be used to schedule
     * @param builder the builder to use
     * @param order the order to iterate over
     * @param acc the accessor to get the value out of the data
     * @param build optional build mapper
     */
    private builder;
    private builderForEach;
    protected boxplotBuilder<R = IAdvancedBoxPlotData>(order: IndicesArray | null | MultiIndices, col: INumberColumn, raw?: boolean, build?: (stat: IAdvancedBoxPlotData) => R): Iterator<R, any, any>;
    protected resolveDomain(col: INumberColumn, raw: boolean): [number, number];
    protected statsBuilder<R = IStatistics>(order: IndicesArray | null | MultiIndices, col: INumberColumn, numberOfBins: number, raw?: boolean, build?: (stat: IStatistics) => R): Iterator<R, any, any>;
    private numberStatsBuilder;
    protected dateStatsBuilder<R = IDateStatistics>(order: IndicesArray | null | MultiIndices, col: IDateColumn, template?: IDateStatistics, build?: (stat: IDateStatistics) => R): Iterator<R, any, any>;
    protected categoricalStatsBuilder<R = ICategoricalStatistics>(order: IndicesArray | null | MultiIndices, col: ICategoricalLikeColumn, build?: (stat: ICategoricalStatistics) => R): Iterator<R, any, any>;
    protected stringStatsBuilder<R = IStringStatistics>(order: IndicesArray | null | MultiIndices, col: StringColumn, topN?: number | readonly string[], build?: (stat: IStringStatistics) => R): Iterator<R, any, any>;
    dirtyColumn(col: Column, type: 'data' | 'summary' | 'group'): void;
    protected setValueCacheData(key: string, value: Float32Array | UIntTypedArray | Int32Array | Float64Array | readonly string[] | null): void;
    valueCache(col: Column): ((dataIndex: number) => Date) | ((dataIndex: number) => ICategory) | ((dataIndex: number) => string | number);
}
//# sourceMappingURL=tasks.d.ts.map