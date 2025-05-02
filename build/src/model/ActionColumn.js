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
import { Category, SupportType } from './annotations';
import Column from './Column';
/**
 * utility for creating an action description with optional label
 * @param label
 * @param actions
 * @param groupActions
 * @returns {{type: string, label: string}}
 */
export function createActionDesc(label, actions, groupActions) {
    if (label === void 0) { label = 'actions'; }
    if (actions === void 0) { actions = []; }
    if (groupActions === void 0) { groupActions = []; }
    return { type: 'actions', label: label, actions: actions, groupActions: groupActions, fixed: true };
}
/**
 * a default column with no values
 */
var ActionColumn = /** @class */ (function (_super) {
    __extends(ActionColumn, _super);
    function ActionColumn(id, desc) {
        var _this = _super.call(this, id, desc) || this;
        _this.actions = desc.actions || [];
        _this.groupActions = desc.groupActions || [];
        return _this;
    }
    ActionColumn.prototype.getLabel = function () {
        return '';
    };
    ActionColumn.prototype.getValue = function () {
        return '';
    };
    ActionColumn.prototype.compare = function () {
        return 0; //can't compare
    };
    ActionColumn = __decorate([
        SupportType(),
        Category('support')
    ], ActionColumn);
    return ActionColumn;
}(Column));
export default ActionColumn;
//# sourceMappingURL=ActionColumn.js.map