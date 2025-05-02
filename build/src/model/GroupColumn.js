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
import { Category, SupportType, toolbar, dialogAddons } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import { ECompareValueType } from './interfaces';
import { missingGroup } from './missing';
export function createGroupDesc(label) {
    if (label === void 0) { label = 'Group Name'; }
    return { type: 'group', label: label };
}
export var EGroupSortMethod;
(function (EGroupSortMethod) {
    EGroupSortMethod["name"] = "name";
    EGroupSortMethod["count"] = "count";
})(EGroupSortMethod || (EGroupSortMethod = {}));
var GroupColumn = /** @class */ (function (_super) {
    __extends(GroupColumn, _super);
    function GroupColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.groupSortMethod = EGroupSortMethod.name;
        return _this;
    }
    GroupColumn_1 = GroupColumn;
    Object.defineProperty(GroupColumn.prototype, "frozen", {
        get: function () {
            return this.desc.frozen !== false;
        },
        enumerable: false,
        configurable: true
    });
    GroupColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([GroupColumn_1.EVENT_SORTMETHOD_CHANGED]);
    };
    GroupColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    GroupColumn.prototype.getLabel = function () {
        return '';
    };
    GroupColumn.prototype.getValue = function () {
        return '';
    };
    GroupColumn.prototype.getSortMethod = function () {
        return this.groupSortMethod;
    };
    GroupColumn.prototype.setSortMethod = function (sortMethod) {
        if (this.groupSortMethod === sortMethod) {
            return;
        }
        this.fire(GroupColumn_1.EVENT_SORTMETHOD_CHANGED, this.groupSortMethod, (this.groupSortMethod = sortMethod));
        // sort by me if not already sorted by me
        if (!this.isGroupSortedByMe().asc) {
            this.toggleMyGroupSorting();
        }
    };
    GroupColumn.prototype.toCompareGroupValue = function (rows, group) {
        if (this.groupSortMethod === 'count') {
            return rows.length;
        }
        return group.name === missingGroup.name ? null : group.name.toLowerCase();
    };
    GroupColumn.prototype.toCompareGroupValueType = function () {
        return this.groupSortMethod === 'count' ? ECompareValueType.COUNT : ECompareValueType.STRING;
    };
    var GroupColumn_1;
    GroupColumn.EVENT_SORTMETHOD_CHANGED = 'sortMethodChanged';
    GroupColumn = GroupColumn_1 = __decorate([
        SupportType(),
        toolbar('rename', 'sortGroupBy'),
        dialogAddons('sortGroup', 'sortGroups'),
        Category('support')
    ], GroupColumn);
    return GroupColumn;
}(Column));
export default GroupColumn;
//# sourceMappingURL=GroupColumn.js.map