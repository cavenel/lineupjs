import { noDateFilter } from '../../model/internalDate';
import { createDateFilter } from '../../renderer/DateHistogramCellRenderer';
import { cssClass } from '../../styles';
import ADialog, {} from './ADialog';
/** @internal */
export default class DateFilterDialog extends ADialog {
    constructor(column, dialog, ctx) {
        var _a;
        super(dialog, {
            livePreview: 'filter',
            cancelSubDialogs: true,
        });
        this.column = column;
        this.ctx = ctx;
        this.handler = null;
        this.before = (_a = this.column.getFilter()) !== null && _a !== void 0 ? _a : noDateFilter();
    }
    build(node) {
        node.classList.add(cssClass('dialog-mapper'));
        this.handler = createDateFilter(this.column, node, {
            dialogManager: this.ctx.dialogManager,
            idPrefix: this.ctx.idPrefix,
            tasks: this.ctx.provider.getTaskExecutor(),
            sanitize: this.ctx.sanitize,
        }, this.showLivePreviews());
    }
    cleanUp(action) {
        super.cleanUp(action);
        this.handler.cleanUp();
    }
    reset() {
        this.handler.reset();
    }
    submit() {
        this.handler.submit();
        return true;
    }
    cancel() {
        this.column.setFilter(this.before);
    }
}
