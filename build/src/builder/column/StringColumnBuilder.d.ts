import type { EAlignment, ILinkColumnDesc } from '../../model';
import ColumnBuilder from './ColumnBuilder';
export default class StringColumnBuilder extends ColumnBuilder<ILinkColumnDesc> {
    constructor(column: string);
    /**
     * makes the text editable within a cell and switches to the annotate type
     */
    editable(): this;
    /**
     * changes the alignment of the column
     */
    alignment(align: EAlignment): this;
    /**
     * allow html text as values
     */
    html(): this;
    /**
     * provide a pattern with which the value will be wrapped, use `${value}` for the current and and `${item}` for the whole item
     * @param {string} pattern pattern to apply
     * @param {string[]} templates optional templates for patterns to provide in the edit pattern dialog
     */
    pattern(pattern: string, templates?: string[]): this;
}
/**
 * builds a string column builder
 * @param {string} column column which contains the associated data
 * @returns {StringColumnBuilder}
 */
export declare function buildStringColumn(column: string): StringColumnBuilder;
//# sourceMappingURL=StringColumnBuilder.d.ts.map