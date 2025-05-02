import ColumnBuilder from './ColumnBuilder';
export default class ActionsColumnBuilder extends ColumnBuilder {
    constructor() {
        super('actions', '');
    }
    /**
     * adds another action
     * @param action the action
     */
    action(action) {
        return this.actions([action]);
    }
    /**
     * adds multiple actions
     * @param actions list of actions
     */
    actions(actions) {
        if (!this.desc.actions) {
            this.desc.actions = [];
        }
        this.desc.actions.push(...actions);
        return this;
    }
    /**
     * adds another action that is shown in group rows
     * @param action the action
     */
    groupAction(action) {
        return this.groupActions([action]);
    }
    /**
     * add multiple group actions that are shown in group rows
     * @param actions list of actions
     */
    groupActions(actions) {
        if (!this.desc.groupActions) {
            this.desc.groupActions = [];
        }
        this.desc.groupActions.push(...actions);
        return this;
    }
}
/**
 * builds a actions column builder
 * @returns {ActionsColumnBuilder}
 */
export function buildActionsColumn() {
    return new ActionsColumnBuilder();
}
