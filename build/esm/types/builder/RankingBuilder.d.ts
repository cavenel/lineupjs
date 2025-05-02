import { Ranking, EAdvancedSortMethod, type IColumnDesc } from '../model';
import type { DataProvider } from '../provider';
export interface IImposeColumnBuilder {
    type: 'impose';
    column: string;
    label?: string;
    colorColumn: string;
}
export interface INestedBuilder {
    type: 'nested';
    label?: string;
    columns: string[];
}
export interface IWeightedSumBuilder {
    type: 'weightedSum';
    columns: string[];
    label?: string;
    weights: number[];
}
export interface IReduceBuilder {
    type: 'min' | 'max' | 'mean' | 'median';
    columns: string[];
    label?: string;
}
export interface IScriptedBuilder {
    type: 'script';
    code: string;
    columns: string[];
    label?: string;
}
/**
 * builder for a ranking
 */
export declare class RankingBuilder {
    private static readonly ALL_MAGIC_FLAG;
    private readonly columns;
    private readonly sort;
    private readonly groupSort;
    private readonly groups;
    /**
     * specify another sorting criteria
     * @param {string} column the column name optionally with encoded sorting separated by colon, e.g. a:desc
     * @param {boolean | "asc" | "desc"} asc ascending or descending order
     */
    sortBy(column: string, asc?: boolean | 'asc' | 'desc'): this;
    /**
     * specify grouping criteria
     * @returns {this}
     */
    groupBy(...columns: (string | string[])[]): this;
    /**
     * specify another grouping sorting criteria
     * @param {string} column the column name optionally with encoded sorting separated by colon, e.g. a:desc
     * @param {boolean | "asc" | "desc"} asc ascending or descending order
     */
    groupSortBy(column: string, asc?: boolean | 'asc' | 'desc'): this;
    /**
     * add another column to this ranking, identified by column name or label. magic names are used for special columns:
     * <ul>
     *     <li>'*' = all columns</li>
     *     <li>'_*' = all support columns</li>
     *     <li>'_aggregate' = aggregate column</li>
     *     <li>'_selection' = selection column</li>
     *     <li>'_group' = group column</li>
     *     <li>'_rank' = rank column</li>
     * </ul>
     * In addition build objects for combined columns are supported.
     * @param {string | IImposeColumnBuilder | INestedBuilder | IWeightedSumBuilder | IReduceBuilder | IScriptedBuilder} column
     */
    column(column: string | IImposeColumnBuilder | INestedBuilder | IWeightedSumBuilder | IReduceBuilder | IScriptedBuilder): this;
    /**
     * add an imposed column (numerical column colored by categorical column) to this ranking
     * @param {string | null} label optional label
     * @param {string} numberColumn numerical column reference
     * @param {string} colorColumn categorical column reference
     */
    impose(label: string | null, numberColumn: string, colorColumn: string): this;
    /**
     * add a nested / group composite column
     * @param {string | null} label optional label
     * @param {string} column first element of the group enforcing not empty ones
     * @param {string} columns additional columns
     */
    nested(label: string | null, column: string, ...columns: string[]): this;
    /**
     * @param {IColumnDesc} desc the composite column description
     * @param {string} columns additional columns to add as children
     */
    composite(desc: IColumnDesc, ...columns: string[]): this;
    /**
     * add a weighted sum / stack column
     * @param {string | null} label optional label
     * @param {string} numberColumn1 the first numerical column
     * @param {number} weight1 its weight (0..1)
     * @param {string} numberColumn2 the second numerical column
     * @param {number} weight2 its weight (0..1)
     * @param {string | number} numberColumnAndWeights alternating column weight references
     */
    weightedSum(label: string | null, numberColumn1: string, weight1: number, numberColumn2: string, weight2: number, ...numberColumnAndWeights: (string | number)[]): this;
    /**
     * add reducing column (min, max, median, mean, ...)
     * @param {string | null} label optional label
     * @param {EAdvancedSortMethod} operation operation to apply (min, max, median, mean, ...)
     * @param {string} numberColumn1 first numerical column
     * @param {string} numberColumn2 second numerical column
     * @param {string} numberColumns additional numerical columns
     */
    reduce(label: string | null, operation: EAdvancedSortMethod, numberColumn1: string, numberColumn2: string, ...numberColumns: string[]): this;
    /**
     * add a scripted / formula column
     * @param {string | null} label optional label
     * @param {string} code the JS code see ScriptColumn for details
     * @param {string} numberColumns additional script columns
     */
    scripted(label: string | null, code: string, ...numberColumns: string[]): this;
    /**
     * add a selection column for easier multi selections
     */
    selection(): this;
    /**
     * add a group column to show the current group name
     */
    group(): this;
    /**
     * add an aggregate column to this ranking to collapse/expand groups
     */
    aggregate(): this;
    /**
     * add a ranking column
     */
    rank(): this;
    /**
     * add suporttypes (aggregate, rank, selection) to the ranking
     */
    supportTypes(): this;
    /**
     * add all columns to this ranking
     */
    allColumns(): this;
    build(data: DataProvider): Ranking;
}
/**
 * creates a new instance of a ranking builder
 * @returns {RankingBuilder}
 */
export declare function buildRanking(): RankingBuilder;
//# sourceMappingURL=RankingBuilder.d.ts.map