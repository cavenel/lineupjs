import { type IColumnDesc, Ranking } from '../model';
import ADataProvider from './ADataProvider';
import type { IDataProviderDump, IDataProviderOptions } from './interfaces';
/**
 * common base implementation of a DataProvider with a fixed list of column descriptions
 */
declare abstract class ACommonDataProvider extends ADataProvider {
    private columns;
    private rankingIndex;
    constructor(columns?: IColumnDesc[], options?: Partial<IDataProviderOptions>);
    cloneRanking(existing?: Ranking): Ranking;
    /**
     * adds another column description to this data provider
     * @param column
     */
    pushDesc(column: IColumnDesc): void;
    clearColumns(): void;
    /**
     * Remove the given column description from the data provider.
     * Column descriptions that are in use (i.e., has column instances in a ranking) cannot be removed by default.
     * Skip the check by setting the `ignoreBeingUsed` parameter to `true`.
     *
     * @param column Column description
     * @param ignoreBeingUsed Flag whether to ignore the usage of the column descriptions in rankings
     */
    removeDesc(column: IColumnDesc, ignoreBeingUsed?: boolean): boolean;
    getColumns(): IColumnDesc[];
    findDesc(ref: string): IColumnDesc;
    /**
     * identify by the tuple type@columnname
     * @param desc
     * @returns {string}
     */
    toDescRef(desc: any): any;
    fromDescRef(descRef: any): any;
    restore(dump: IDataProviderDump): void;
    nextRankingId(): string;
}
export default ACommonDataProvider;
//# sourceMappingURL=ACommonDataProvider.d.ts.map