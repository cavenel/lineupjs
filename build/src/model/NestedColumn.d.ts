import type { IDataRow, ECompareValueType } from './interfaces';
import MultiLevelCompositeColumn, { type IMultiLevelCompositeColumnDesc } from './MultiLevelCompositeColumn';
/**
 * factory for creating a description creating a mean column
 * @param label
 * @returns {{type: string, label: string}}
 */
export declare function createNestedDesc(label?: string, showNestedSummaries?: boolean): IMultiLevelCompositeColumnDesc;
/**
 * a nested column is a composite column where the sorting order is determined by the nested ordering of the children
 * i.e., sort by the first child if equal sort by the second child,...
 */
export default class NestedColumn extends MultiLevelCompositeColumn {
    toCompareValue(row: IDataRow): (string | number)[];
    toCompareValueType(): ECompareValueType[];
    getLabel(row: IDataRow): string;
    getValue(row: IDataRow): string;
}
//# sourceMappingURL=NestedColumn.d.ts.map