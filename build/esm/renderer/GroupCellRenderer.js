import { Column, GroupColumn, defaultGroup } from '../model';
import { noRenderer } from './utils';
function isDummyGroup(group) {
    return group.parent == null && group.name === defaultGroup.name;
}
export default class GroupCellRenderer {
    constructor() {
        this.title = 'Default';
    }
    canRender(col) {
        return col instanceof GroupColumn;
    }
    create() {
        return {
            template: `<div><div></div></div>`,
            update(node, _row, i, group) {
                const text = isDummyGroup(group) || i > 0 ? '' : `${group.name} (${group.order.length})`;
                node.firstElementChild.textContent = text;
                node.title = text;
            },
            render(_ctx, _row, i) {
                return i === 0;
            },
        };
    }
    createGroup() {
        return {
            template: `<div><div></div></div>`,
            update(node, group) {
                const text = isDummyGroup(group) ? '' : `${group.name} (${group.order.length})`;
                node.firstElementChild.textContent = text;
                node.title = text;
            },
        };
    }
    createSummary() {
        return noRenderer;
    }
}
