import type { IColumnDesc, IStyleHTMLWrapper } from '../../model';
export default class ColumnBuilder<T extends IColumnDesc = IColumnDesc> {
    protected readonly desc: T;
    constructor(type: string, column: string);
    /**
     * column label
     */
    label(label: string): this;
    htmlLabel(label: string, render?: IStyleHTMLWrapper): this;
    /**
     * hide this column by default
     */
    hidden(): this;
    /**
     * column summary text (subtitle)
     */
    summary(summary: string): this;
    htmlSummary(label: string, render?: IStyleHTMLWrapper): this;
    /**
     * column description
     */
    description(description: string): this;
    /**
     * sets the frozen state of this column, i.e is sticky to the left side when scrolling horizontally
     */
    frozen(): this;
    /**
     * specify the renderer to used for this column
     * @param {string} renderer within a cell
     * @param {string} groupRenderer within an aggregated cell
     * @param {string} summaryRenderer within the summary in the header and side panel
     */
    renderer(renderer?: string, groupRenderer?: string, summaryRenderer?: string): this;
    /**
     * specify a custom additional attribute for the description
     * @param {string} key the property key
     * @param value its value
     */
    custom(key: string, value: any): this;
    /**
     * sets the default width of the column
     */
    width(width: number): this;
    /**
     * sets the column color in case of numerical columns
     * @deprecated use colorMapping in the number case instead
     */
    color(_color: string): this;
    /**
     * converts the column type to be an array type, supports only base types: boolean, categorical, date, number, and string
     * @param {string[] | number} labels labels to use for each array item or the expected length of an value
     */
    asArray(labels?: string[] | number): this;
    /**
     * converts the column type to be a map type, supports only base types: categorical, date, number, and string
     */
    asMap(): this;
    /**
     * build the column description
     */
    build(_data: any[]): T;
}
/**
 * build a column of a given type
 * @param {string} type column type
 * @param {string} column column which contains the associated data
 * @returns {ColumnBuilder<IColumnDesc>}
 */
export declare function buildColumn(type: string, column: string): ColumnBuilder<IColumnDesc>;
//# sourceMappingURL=ColumnBuilder.d.ts.map