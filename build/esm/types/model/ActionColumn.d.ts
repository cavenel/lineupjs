import type { IDataRow, IColumnDesc, IGroup } from './interfaces';
import Column from './Column';
export interface IAction {
    name: string;
    icon?: string;
    className?: string;
    action(row: IDataRow): void;
}
export interface IGroupAction {
    name: string;
    icon?: string;
    className?: string;
    action(group: IGroup, rows: IDataRow[]): void;
}
/**
 * utility for creating an action description with optional label
 * @param label
 * @param actions
 * @param groupActions
 * @returns {{type: string, label: string}}
 */
export declare function createActionDesc(label?: string, actions?: Readonly<IAction>[], groupActions?: Readonly<IGroupAction>[]): {
    type: string;
    label: string;
    actions: Readonly<IAction>[];
    groupActions: Readonly<IGroupAction>[];
    fixed: boolean;
};
export interface IActionDesc {
    actions?: Readonly<IAction>[];
    groupActions?: Readonly<IGroupAction>[];
}
export declare type IActionColumnDesc = IColumnDesc & IActionDesc;
/**
 * a default column with no values
 */
export default class ActionColumn extends Column {
    readonly actions: IAction[];
    readonly groupActions: IGroupAction[];
    constructor(id: string, desc: Readonly<IActionColumnDesc>);
    getLabel(): string;
    getValue(): string;
    compare(): number;
}
//# sourceMappingURL=ActionColumn.d.ts.map