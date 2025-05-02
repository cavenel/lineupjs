import type { EAdvancedSortMethod, ESortMethod, INumberColumnDesc, ITypedDump } from '../../model';
import ColumnBuilder from './ColumnBuilder';
import type { IScriptMappingFunctionType } from '../../model/MappingFunction';
export default class NumberColumnBuilder extends ColumnBuilder<INumberColumnDesc> {
    constructor(column: string);
    /**
     * defines the mapping for this number column to normalize the data
     * @param {"linear" | "sqrt" | "pow1.1" | "pow2" | "pow3"} type mapping type
     * @param {[number | null, number | null]} domain input data domain [min, max]
     * @param {[number , number]} range optional output domain [0, 1]
     */
    mapping(type: 'linear' | 'sqrt' | 'pow1.1' | 'pow2' | 'pow3', domain: [number | null, number | null], range?: [number, number]): this;
    /**
     * sets the column color in case of numerical columns
     * @deprecated use colorMapping instead
     */
    color(color: string): this;
    colorMapping(type: string | ((v: number) => string) | ITypedDump): this;
    /**
     * d3-format to use for formatting
     * @param format d3-format
     */
    numberFormat(format: string): this;
    /**
     * defines a script to normalize the data, see ScriptedMappingFunction for details
     * @param {string} code the code to execute
     * @param {[number , number]} domain the input data domain [min, max]
     */
    scripted(code: string | IScriptMappingFunctionType, domain: [number, number]): this;
    /**
     * @inheritDoc
     * @param {string[] | number} labels labels to use for each array item or the expected length of an value
     * @param {EAdvancedSortMethod} sort sorting criteria when sorting by this column
     */
    asArray(labels?: string[] | number, sort?: EAdvancedSortMethod): this;
    /**
     * @inheritDoc
     * @param {EAdvancedSortMethod} sort sorting criteria when sorting by this column
     */
    asMap(sort?: EAdvancedSortMethod): this;
    /**
     * converts type to a boxplot column type
     * @param {ESortMethod} sort sorting criteria when sorting by this column
     */
    asBoxPlot(sort?: ESortMethod): this;
    private derive;
    build(data: any[]): INumberColumnDesc;
}
/**
 * builds numerical column builder
 * @param {string} column column which contains the associated data
 * @param {[number | null, number | null]} domain domain (min, max) of this column
 * @returns {NumberColumnBuilder}
 */
export declare function buildNumberColumn(column: string, domain?: [number | null, number | null]): NumberColumnBuilder;
//# sourceMappingURL=NumberColumnBuilder.d.ts.map