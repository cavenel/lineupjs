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
export function createActionDesc(label = 'actions', actions = [], groupActions = []) {
    return { type: 'actions', label, actions, groupActions, fixed: true };
}
/**
 * a default column with no values
 */
let ActionColumn = class ActionColumn extends Column {
    constructor(id, desc) {
        super(id, desc);
        this.actions = desc.actions || [];
        this.groupActions = desc.groupActions || [];
    }
    getLabel() {
        return '';
    }
    getValue() {
        return '';
    }
    compare() {
        return 0; //can't compare
    }
};
ActionColumn = __decorate([
    SupportType(),
    Category('support')
], ActionColumn);
export default ActionColumn;
