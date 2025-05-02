import { Column, GroupColumn, defaultGroup } from '../model';
import { noRenderer } from './utils';
function isDummyGroup(group) {
    return group.parent == null && group.name === defaultGroup.name;
}
var GroupCellRenderer = /** @class */ (function () {
    function GroupCellRenderer() {
        this.title = 'Default';
    }
    GroupCellRenderer.prototype.canRender = function (col) {
        return col instanceof GroupColumn;
    };
    GroupCellRenderer.prototype.create = function () {
        return {
            template: "<div><div></div></div>",
            update: function (node, _row, i, group) {
                var text = isDummyGroup(group) || i > 0 ? '' : "".concat(group.name, " (").concat(group.order.length, ")");
                node.firstElementChild.textContent = text;
                node.title = text;
            },
            render: function (_ctx, _row, i) {
                return i === 0;
            },
        };
    };
    GroupCellRenderer.prototype.createGroup = function () {
        return {
            template: "<div><div></div></div>",
            update: function (node, group) {
                var text = isDummyGroup(group) ? '' : "".concat(group.name, " (").concat(group.order.length, ")");
                node.firstElementChild.textContent = text;
                node.title = text;
            },
        };
    };
    GroupCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return GroupCellRenderer;
}());
export default GroupCellRenderer;
//# sourceMappingURL=GroupCellRenderer.js.map