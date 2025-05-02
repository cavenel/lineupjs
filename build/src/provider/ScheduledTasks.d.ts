import { type IAdvancedBoxPlotData, type ICategoricalStatistics, type IDateStatistics, type ISequence, type IStatistics, type IStringStatistics } from '../internal';
import Column, { type ICategoricalLikeColumn, type ICompareValue, type IDataRow, type IDateColumn, type IGroup, type IndicesArray, type INumberColumn, type IOrderedGroup, Ranking, StringColumn } from '../model';
import type { IRenderTask } from '../renderer';
import type { CompareLookup } from './sort';
import { ARenderTasks, type IRenderTaskExecutor, MultiIndices, TaskLater, TaskNow } from './tasks';
export declare class ScheduleRenderTasks extends ARenderTasks implements IRenderTaskExecutor {
    private readonly cache;
    private readonly tasks;
    private readonly workers;
    setData(data: IDataRow[]): void;
    dirtyColumn(col: Column, type: 'data' | 'group' | 'summary'): void;
    dirtyRanking(ranking: Ranking, type: 'data' | 'group' | 'summary'): void;
    preCompute(ranking: Ranking, groups: {
        rows: IndicesArray;
        group: IGroup;
    }[], maxDataIndex: number): void;
    preComputeData(ranking: Ranking): void;
    preComputeCol(col: Column): void;
    copyData2Summary(ranking: Ranking): void;
    copyCache(col: Column, from: Column): void;
    groupCompare(ranking: Ranking, group: IGroup, rows: IndicesArray): TaskLater<ICompareValue[]>;
    groupRows<T>(col: Column, group: IOrderedGroup, key: string, compute: (rows: ISequence<IDataRow>) => T): IRenderTask<T>;
    groupExampleRows<T>(_col: Column, group: IOrderedGroup, _key: string, compute: (rows: ISequence<IDataRow>) => T): TaskNow<T>;
    groupBoxPlotStats(col: Column & INumberColumn, group: IOrderedGroup, raw?: boolean): IRenderTask<{
        group: IAdvancedBoxPlotData;
        summary: IAdvancedBoxPlotData;
        data: IAdvancedBoxPlotData;
    }>;
    groupNumberStats(col: Column & INumberColumn, group: IOrderedGroup, raw?: boolean): IRenderTask<{
        group: IStatistics;
        summary: IStatistics;
        data: IStatistics;
    }>;
    groupCategoricalStats(col: Column & ICategoricalLikeColumn, group: IOrderedGroup): IRenderTask<{
        group: ICategoricalStatistics;
        summary: ICategoricalStatistics;
        data: ICategoricalStatistics;
    }>;
    groupDateStats(col: Column & IDateColumn, group: IOrderedGroup): IRenderTask<{
        group: IDateStatistics;
        summary: IDateStatistics;
        data: IDateStatistics;
    }>;
    groupStringStats(col: StringColumn, group: IOrderedGroup): IRenderTask<{
        group: IStringStatistics;
        summary: IStringStatistics;
        data: IStringStatistics;
    }>;
    summaryBoxPlotStats(col: Column & INumberColumn, raw?: boolean, order?: MultiIndices): IRenderTask<{
        summary: IAdvancedBoxPlotData;
        data: IAdvancedBoxPlotData;
    }>;
    summaryNumberStats(col: Column & INumberColumn, raw?: boolean, order?: MultiIndices): IRenderTask<{
        summary: IStatistics;
        data: IStatistics;
    }>;
    summaryCategoricalStats(col: Column & ICategoricalLikeColumn, order?: MultiIndices): IRenderTask<{
        summary: ICategoricalStatistics;
        data: ICategoricalStatistics;
    }>;
    summaryDateStats(col: Column & IDateColumn, order?: MultiIndices): IRenderTask<{
        summary: IDateStatistics;
        data: IDateStatistics;
    }>;
    summaryStringStats(col: StringColumn, order?: MultiIndices): IRenderTask<{
        summary: IStringStatistics;
        data: IStringStatistics;
    }>;
    private cached;
    private chain;
    private isValidCacheEntry;
    private chainCopy;
    dataBoxPlotStats(col: Column & INumberColumn, raw?: boolean): IRenderTask<IAdvancedBoxPlotData>;
    dataNumberStats(col: Column & INumberColumn, raw?: boolean): IRenderTask<IStatistics>;
    dataCategoricalStats(col: Column & ICategoricalLikeColumn): IRenderTask<ICategoricalStatistics>;
    dataStringStats(col: StringColumn): IRenderTask<IStringStatistics>;
    dataDateStats(col: Column & IDateColumn): IRenderTask<IDateStatistics>;
    sort(ranking: Ranking, group: IGroup, indices: IndicesArray, singleCall: boolean, maxDataIndex: number, lookups?: CompareLookup): Promise<IndicesArray>;
    terminate(): void;
}
//# sourceMappingURL=ScheduledTasks.d.ts.map