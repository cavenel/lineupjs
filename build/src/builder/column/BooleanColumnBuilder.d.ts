import type { IBooleanColumnDesc } from '../../model';
import ColumnBuilder from './ColumnBuilder';
export default class BooleanColumnBuilder extends ColumnBuilder<IBooleanColumnDesc> {
    constructor(column: string);
    trueMarker(marker: string): this;
    falseMarker(marker: string): this;
    trueValues(values: readonly any[]): this;
}
/**
 * builds a boolean column builder
 * @param {string} column column which contains the associated data
 * @returns {BooleanColumnBuilder}
 */
export declare function buildBooleanColumn(column: string): BooleanColumnBuilder;
//# sourceMappingURL=BooleanColumnBuilder.d.ts.map