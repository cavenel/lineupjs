import { createToolbarMenuItems, updateIconState } from '../headerTooltip';
import { cssClass } from '../../styles';
import APopup from './APopup';
/** @internal */
export default class MoreColumnOptionsDialog extends APopup {
    constructor(column, dialog, mode, ctx) {
        super(dialog, {
            autoClose: true,
        });
        this.column = column;
        this.mode = mode;
        this.ctx = ctx;
    }
    build(node) {
        node.classList.add(cssClass('more-options'));
        node.dataset.colId = this.column.id;
        createToolbarMenuItems(node, this.dialog.level + 1, this.column, this.ctx, this.mode);
        updateIconState(node, this.column);
    }
}
