import Column, { type IColumnDesc, type IDataRow, Ranking, type IndicesArray, type IOrderedGroup } from '../model';
import ACommonDataProvider from './ACommonDataProvider';
import type { IDataProviderOptions } from './interfaces';
import type { IRenderTasks } from '../renderer';
/**
 * interface what the server side has to provide
 */
export interface IServerData {
    /**
     * sort the dataset by the given description
     * @param ranking
     */
    sort(ranking: Ranking): Promise<IndicesArray>;
    /**
     * returns a slice of the data array identified by a list of indices
     * @param indices
     */
    view(indices: number[]): Promise<any[]>;
    /**
     * returns a sample of the values for a given column
     * @param column
     */
    mappingSample(column: any): Promise<number[]>;
    /**
     * return the matching indices matching the given arguments
     * @param search
     * @param column
     */
    search(search: string | RegExp, column: any): Promise<number[]>;
}
export interface IRemoteDataProviderOptions {
    /**
     * maximal cache size (unused at the moment)
     */
    maxCacheSize: number;
}
/**
 * a remote implementation of the data provider
 */
export default class RemoteDataProvider extends ACommonDataProvider {
    private server;
    private readonly ooptions;
    private readonly cache;
    constructor(server: IServerData, columns?: IColumnDesc[], options?: Partial<IRemoteDataProviderOptions & IDataProviderOptions>);
    getTotalNumberOfRows(): number;
    getTaskExecutor(): IRenderTasks;
    sort(ranking: Ranking): Promise<{
        groups: IOrderedGroup[];
        index2pos: IndicesArray;
    }> | {
        groups: IOrderedGroup[];
        index2pos: IndicesArray;
    };
    private loadFromServer;
    view(indices: number[]): Promise<any[]>;
    private computeMissing;
    private loadInCache;
    fetch(orders: number[][]): Promise<IDataRow>[][];
    getRow(index: number): Promise<IDataRow>;
    mappingSample(col: Column): Promise<number[]>;
    searchAndJump(search: string | RegExp, col: Column, first?: boolean): void;
}
//# sourceMappingURL=RemoteDataProvider.d.ts.map