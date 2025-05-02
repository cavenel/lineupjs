import Column from './Column';
import type { IDataRow, IColumnDesc } from './interfaces';
export interface IArrayDesc {
    dataLength?: number;
    labels?: string[];
}
export interface IKeyValue<T> {
    key: string;
    value: T;
}
export interface IMapColumn<T> extends Column {
    getMap(row: IDataRow): IKeyValue<T>[];
    getMapLabel(row: IDataRow): IKeyValue<string>[];
}
export declare function isMapColumn(col: Column): col is IMapColumn<any>;
export declare function isMapColumn(col: IColumnDesc): boolean;
export interface IArrayColumn<T> extends IMapColumn<T> {
    readonly labels: string[];
    readonly dataLength: number | null;
    getLabels(row: IDataRow): string[];
    getValues(row: IDataRow): T[];
}
export declare function isArrayColumn(col: Column): col is IArrayColumn<any>;
export declare function isArrayColumn(col: IColumnDesc): col is IArrayDesc & IColumnDesc;
//# sourceMappingURL=IArrayColumn.d.ts.map