import ColumnBuilder from './ColumnBuilder';
export default class HierarchyColumnBuilder extends ColumnBuilder {
    constructor(column) {
        super('hierarchy', column);
    }
    /**
     * specify the underlying hierarchy of this column
     * @param {IPartialCategoryNode} hierarchy
     * @param {string} hierarchySeparator specify the character to separate levels (default dot)
     */
    hierarchy(hierarchy, hierarchySeparator) {
        this.desc.hierarchy = hierarchy;
        if (hierarchySeparator) {
            this.desc.hierarchySeparator = hierarchySeparator;
        }
        return this;
    }
    build(data) {
        console.assert(Boolean(this.desc.hierarchy));
        return super.build(data);
    }
}
/**
 * build a hierarchical column builder
 * @param {string} column column which contains the associated data
 * @param {IPartialCategoryNode} hierarchy
 * @returns {HierarchyColumnBuilder}
 */
export function buildHierarchicalColumn(column, hierarchy) {
    const r = new HierarchyColumnBuilder(column);
    if (hierarchy) {
        r.hierarchy(hierarchy);
    }
    return r;
}
