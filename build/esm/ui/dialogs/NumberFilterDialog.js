import { createNumberFilter } from '../../renderer/HistogramCellRenderer';
import { cssClass } from '../../styles';
import ADialog, {} from './ADialog';
/** @internal */
export default class NumberFilterDialog extends ADialog {
    constructor(column, dialog, ctx) {
        super(dialog, {
            livePreview: 'filter',
            cancelSubDialogs: true,
        });
        this.column = column;
        this.ctx = ctx;
        this.handler = null;
        this.before = column.getFilter();
    }
    build(node) {
        node.classList.add(cssClass('dialog-mapper'));
        this.handler = createNumberFilter(this.column, node, {
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
