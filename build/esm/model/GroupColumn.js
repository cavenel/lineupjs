var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GroupColumn_1;
import { Category, SupportType, toolbar, dialogAddons } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import { ECompareValueType } from './interfaces';
import { missingGroup } from './missing';
export function createGroupDesc(label = 'Group Name') {
    return { type: 'group', label };
}
export var EGroupSortMethod;
(function (EGroupSortMethod) {
    EGroupSortMethod["name"] = "name";
    EGroupSortMethod["count"] = "count";
})(EGroupSortMethod || (EGroupSortMethod = {}));
let GroupColumn = GroupColumn_1 = class GroupColumn extends Column {
    constructor() {
        super(...arguments);
        this.groupSortMethod = EGroupSortMethod.name;
    }
    get frozen() {
        return this.desc.frozen !== false;
    }
    createEventList() {
        return super.createEventList().concat([GroupColumn_1.EVENT_SORTMETHOD_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getLabel() {
        return '';
    }
    getValue() {
        return '';
    }
    getSortMethod() {
        return this.groupSortMethod;
    }
    setSortMethod(sortMethod) {
        if (this.groupSortMethod === sortMethod) {
            return;
        }
        this.fire(GroupColumn_1.EVENT_SORTMETHOD_CHANGED, this.groupSortMethod, (this.groupSortMethod = sortMethod));
        // sort by me if not already sorted by me
        if (!this.isGroupSortedByMe().asc) {
            this.toggleMyGroupSorting();
        }
    }
    toCompareGroupValue(rows, group) {
        if (this.groupSortMethod === 'count') {
            return rows.length;
        }
        return group.name === missingGroup.name ? null : group.name.toLowerCase();
    }
    toCompareGroupValueType() {
        return this.groupSortMethod === 'count' ? ECompareValueType.COUNT : ECompareValueType.STRING;
    }
};
GroupColumn.EVENT_SORTMETHOD_CHANGED = 'sortMethodChanged';
GroupColumn = GroupColumn_1 = __decorate([
    SupportType(),
    toolbar('rename', 'sortGroupBy'),
    dialogAddons('sortGroup', 'sortGroups'),
    Category('support')
], GroupColumn);
export default GroupColumn;
