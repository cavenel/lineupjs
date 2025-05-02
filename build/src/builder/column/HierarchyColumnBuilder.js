var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import ColumnBuilder from './ColumnBuilder';
var HierarchyColumnBuilder = /** @class */ (function (_super) {
    __extends(HierarchyColumnBuilder, _super);
    function HierarchyColumnBuilder(column) {
        return _super.call(this, 'hierarchy', column) || this;
    }
    /**
     * specify the underlying hierarchy of this column
     * @param {IPartialCategoryNode} hierarchy
     * @param {string} hierarchySeparator specify the character to separate levels (default dot)
     */
    HierarchyColumnBuilder.prototype.hierarchy = function (hierarchy, hierarchySeparator) {
        this.desc.hierarchy = hierarchy;
        if (hierarchySeparator) {
            this.desc.hierarchySeparator = hierarchySeparator;
        }
        return this;
    };
    HierarchyColumnBuilder.prototype.build = function (data) {
        console.assert(Boolean(this.desc.hierarchy));
        return _super.prototype.build.call(this, data);
    };
    return HierarchyColumnBuilder;
}(ColumnBuilder));
export default HierarchyColumnBuilder;
/**
 * build a hierarchical column builder
 * @param {string} column column which contains the associated data
 * @param {IPartialCategoryNode} hierarchy
 * @returns {HierarchyColumnBuilder}
 */
export function buildHierarchicalColumn(column, hierarchy) {
    var r = new HierarchyColumnBuilder(column);
    if (hierarchy) {
        r.hierarchy(hierarchy);
    }
    return r;
}
//# sourceMappingURL=HierarchyColumnBuilder.js.map