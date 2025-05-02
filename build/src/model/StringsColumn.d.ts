import ArrayColumn, { type IArrayColumnDesc } from './ArrayColumn';
import type { IDataRow } from './interfaces';
import { EAlignment, type IStringDesc } from './StringColumn';
export declare type IStringsColumnDesc = IStringDesc & IArrayColumnDesc<string>;
/**
 * a string column with optional alignment
 */
export default class StringsColumn extends ArrayColumn<string> {
    readonly alignment: EAlignment;
    readonly escape: boolean;
    constructor(id: string, desc: Readonly<IStringsColumnDesc>);
    getValues(row: IDataRow): string[];
}
//# sourceMappingURL=StringsColumn.d.ts.map