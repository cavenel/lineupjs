import CompositeColumn from './CompositeColumn';
import type { IDataRow, IGroup, IColumnDesc } from './interfaces';
import type { ISequence } from '../internal';
import type { INumberColumn } from './INumberColumn';
export interface ICompositeNumberDesc extends IColumnDesc {
    /**
     * d3 format number Format
     * @default 0.3n
     */
    numberFormat?: string;
}
export declare type ICompositeNumberColumnDesc = ICompositeNumberDesc & IColumnDesc;
/**
 * implementation of a combine column, standard operations how to select
 */
export default class CompositeNumberColumn extends CompositeColumn implements INumberColumn {
    private readonly numberFormat;
    constructor(id: string, desc: Readonly<ICompositeNumberColumnDesc>);
    getNumberFormat(): (n: number) => string;
    getLabel(row: IDataRow): string;
    getValue(row: IDataRow): number;
    protected compute(_row: IDataRow): number;
    getNumber(row: IDataRow): number;
    getRawNumber(row: IDataRow): number;
    iterNumber(row: IDataRow): number[];
    iterRawNumber(row: IDataRow): number[];
    getExportValue(row: IDataRow, format: 'text' | 'json'): any;
    toCompareValue(row: IDataRow): any;
    toCompareValueType(): import("./interfaces").ECompareValueType;
    toCompareGroupValue(rows: ISequence<IDataRow>, group: IGroup): number;
    toCompareGroupValueType(): import("./interfaces").ECompareValueType;
    getRenderer(): string;
}
//# sourceMappingURL=CompositeNumberColumn.d.ts.map