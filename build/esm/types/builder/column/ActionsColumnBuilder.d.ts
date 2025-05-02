import type { IActionColumnDesc, IAction, IGroupAction } from '../../model';
import ColumnBuilder from './ColumnBuilder';
export default class ActionsColumnBuilder extends ColumnBuilder<IActionColumnDesc> {
    constructor();
    /**
     * adds another action
     * @param action the action
     */
    action(action: IAction): this;
    /**
     * adds multiple actions
     * @param actions list of actions
     */
    actions(actions: IAction[]): this;
    /**
     * adds another action that is shown in group rows
     * @param action the action
     */
    groupAction(action: IGroupAction): this;
    /**
     * add multiple group actions that are shown in group rows
     * @param actions list of actions
     */
    groupActions(actions: IGroupAction[]): this;
}
/**
 * builds a actions column builder
 * @returns {ActionsColumnBuilder}
 */
export declare function buildActionsColumn(): ActionsColumnBuilder;
//# sourceMappingURL=ActionsColumnBuilder.d.ts.map