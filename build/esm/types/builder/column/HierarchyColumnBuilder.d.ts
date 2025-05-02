import type { IHierarchyColumnDesc, IPartialCategoryNode } from '../../model';
import ColumnBuilder from './ColumnBuilder';
export default class HierarchyColumnBuilder extends ColumnBuilder<IHierarchyColumnDesc> {
    constructor(column: string);
    /**
     * specify the underlying hierarchy of this column
     * @param {IPartialCategoryNode} hierarchy
     * @param {string} hierarchySeparator specify the character to separate levels (default dot)
     */
    hierarchy(hierarchy: IPartialCategoryNode, hierarchySeparator?: string): this;
    build(data: any[]): IHierarchyColumnDesc;
}
/**
 * build a hierarchical column builder
 * @param {string} column column which contains the associated data
 * @param {IPartialCategoryNode} hierarchy
 * @returns {HierarchyColumnBuilder}
 */
export declare function buildHierarchicalColumn(column: string, hierarchy?: IPartialCategoryNode): HierarchyColumnBuilder;
//# sourceMappingURL=HierarchyColumnBuilder.d.ts.map