import type { ICategoricalColumnDesc, ICategory } from '../../model';
import ColumnBuilder from './ColumnBuilder';
export default class CategoricalColumnBuilder extends ColumnBuilder<ICategoricalColumnDesc> {
    constructor(column: string);
    /**
     * converts this type to an ordinal column type, such that categories are mapped to numbers
     */
    asOrdinal(): this;
    /**
     * specify the categories of this categorical column
     * @param {(string | Partial<ICategory>)[]} categories
     */
    categories(categories: (string | Partial<ICategory>)[]): this;
    /**
     * converts this type to a set column, i.e. multiple unique category in a value
     * @param {string} separator optional separator separating a string value
     */
    asSet(separator?: string): this;
    private derive;
    build(data: any[]): ICategoricalColumnDesc;
}
/**
 * build a categorical column type
 * @param {string} column column which contains the associated data
 * @param {(string | Partial<ICategory>)[]} categories optional category definition
 * @returns {CategoricalColumnBuilder}
 */
export declare function buildCategoricalColumn(column: string, categories?: (string | Partial<ICategory>)[]): CategoricalColumnBuilder;
//# sourceMappingURL=CategoricalColumnBuilder.d.ts.map