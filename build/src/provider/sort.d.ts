import { type ILookUpArray } from '../internal';
import { type ICompareValue, Column, Ranking, type IDataRow } from '../model';
export declare class CompareLookup {
    private readonly criteria;
    private readonly data;
    constructor(rawLength: number, isSorting: boolean, ranking: Ranking, valueCaches?: (col: Column) => undefined | ((i: number) => any));
    get sortOrders(): {
        asc: boolean;
        lookup: ILookUpArray;
    }[];
    get transferAbles(): ArrayBufferLike[];
    push(row: IDataRow): void;
    pushValues(dataIndex: number, vs: ICompareValue[]): void;
    free(): void;
}
//# sourceMappingURL=sort.d.ts.map