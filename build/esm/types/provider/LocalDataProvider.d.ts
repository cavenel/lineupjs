import { type ISequence } from '../internal';
import { Column, EDirtyReason, Ranking, type IColumnDesc, type IDataRow, type IGroup, type IndicesArray, type INumberColumn, type IOrderedGroup } from '../model';
import ACommonDataProvider from './ACommonDataProvider';
import type { IDataProviderOptions } from './interfaces';
import type { ARenderTaskOptions, IRenderTaskExecutor } from './tasks';
export interface ILocalDataProviderOptions extends ARenderTaskOptions {
    /**
     * whether the filter should be applied to all rankings regardless where they are
     * default: false
     */
    filterGlobally: boolean;
    /**
     * jump to search results such that they are visible
     * default: false
     */
    jumpToSearchResult: boolean;
    /**
     * specify the task executor to use direct = no delay, scheduled = run when idle
     */
    taskExecutor: 'direct' | 'scheduled';
}
/**
 * a data provider based on an local array
 */
export default class LocalDataProvider extends ACommonDataProvider {
    private _data;
    private readonly ooptions;
    private readonly reorderAll;
    private _dataRows;
    private filter;
    private readonly tasks;
    constructor(_data: any[], columns?: IColumnDesc[], options?: Partial<ILocalDataProviderOptions & IDataProviderOptions>);
    /**
     * set a globally applied filter to all data without changing the data source itself
     * @param {((row: IDataRow) => boolean) | null} filter
     */
    setFilter(filter: ((row: IDataRow) => boolean) | null): void;
    getFilter(): (row: IDataRow) => boolean;
    getTotalNumberOfRows(): number;
    getTaskExecutor(): IRenderTaskExecutor;
    get data(): any[];
    destroy(): void;
    /**
     * replaces the dataset rows with a new one
     * @param data
     */
    setData(data: any[]): void;
    private dataChanged;
    clearData(): void;
    /**
     * append rows to the dataset
     * @param data
     */
    appendData(data: any[]): void;
    cloneRanking(existing?: Ranking): Ranking;
    private trackRanking;
    protected patchColumn(column: Column): Column;
    cleanUpRanking(ranking: Ranking): void;
    private resolveFilter;
    private noSorting;
    private createSorter;
    private sortGroup;
    private sortGroups;
    private index2pos;
    sort(ranking: Ranking, dirtyReason: EDirtyReason[]): {
        groups: ({
            order: Uint8Array<ArrayBuffer> | Uint16Array<ArrayBuffer> | Uint32Array<ArrayBuffer>;
        } & IGroup)[];
        index2pos: Uint8Array<ArrayBuffer> | Uint16Array<ArrayBuffer> | Uint32Array<ArrayBuffer>;
    } | Promise<{
        groups: IOrderedGroup[];
        index2pos: Uint8Array<ArrayBuffer> | Uint16Array<ArrayBuffer> | Uint32Array<ArrayBuffer>;
    }> | {
        groups: any[];
        index2pos: any[];
    };
    private readonly mapToDataRow;
    viewRaw(indices: IndicesArray): any[];
    viewRawRows(indices: IndicesArray): IDataRow[];
    getRow(index: number): IDataRow;
    seq(indices: IndicesArray): ISequence<IDataRow>;
    view(indices: IndicesArray): any[];
    mappingSample(col: INumberColumn): ISequence<number>;
    searchAndJump(search: string | RegExp, col: Column, first?: boolean): number[];
    search(search: string | RegExp, col: Column): number[];
}
//# sourceMappingURL=LocalDataProvider.d.ts.map