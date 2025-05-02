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
export function createNestedDesc(label = 'Nested', showNestedSummaries = true) {
    return { type: 'nested', label, showNestedSummaries };
}
/**
 * a nested column is a composite column where the sorting order is determined by the nested ordering of the children
 * i.e., sort by the first child if equal sort by the second child,...
 */
let NestedColumn = class NestedColumn extends MultiLevelCompositeColumn {
    toCompareValue(row) {
        return concat(this.children.map((d) => d.toCompareValue(row)));
    }
    toCompareValueType() {
        return concat(this.children.map((d) => d.toCompareValueType()));
    }
    getLabel(row) {
        return this.children.map((d) => d.getLabel(row)).join(';');
    }
    getValue(row) {
        return this.children.map((d) => d.getValue(row)).join(';');
    }
};
NestedColumn = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy')
], NestedColumn);
export default NestedColumn;
