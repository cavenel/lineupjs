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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import MultiLevelCompositeColumn, {} from './MultiLevelCompositeColumn';
import { concat } from '../internal';
import { toolbar } from './annotations';
/**
 * factory for creating a description creating a mean column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createNestedDesc(label, showNestedSummaries) {
    if (label === void 0) { label = 'Nested'; }
    if (showNestedSummaries === void 0) { showNestedSummaries = true; }
    return { type: 'nested', label: label, showNestedSummaries: showNestedSummaries };
}
/**
 * a nested column is a composite column where the sorting order is determined by the nested ordering of the children
 * i.e., sort by the first child if equal sort by the second child,...
 */
var NestedColumn = /** @class */ (function (_super) {
    __extends(NestedColumn, _super);
    function NestedColumn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NestedColumn.prototype.toCompareValue = function (row) {
        return concat(this.children.map(function (d) { return d.toCompareValue(row); }));
    };
    NestedColumn.prototype.toCompareValueType = function () {
        return concat(this.children.map(function (d) { return d.toCompareValueType(); }));
    };
    NestedColumn.prototype.getLabel = function (row) {
        return this.children.map(function (d) { return d.getLabel(row); }).join(';');
    };
    NestedColumn.prototype.getValue = function (row) {
        return this.children.map(function (d) { return d.getValue(row); }).join(';');
    };
    NestedColumn = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy')
    ], NestedColumn);
    return NestedColumn;
}(MultiLevelCompositeColumn));
export default NestedColumn;
//# sourceMappingURL=NestedColumn.js.map