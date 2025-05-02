import { EAdvancedSortMethod, ReduceColumn } from '../../model';
import ADialog, {} from './ADialog';
import { sortMethods } from './utils';
/** @internal */
export default class ReduceDialog extends ADialog {
    constructor(column, dialog) {
        super(dialog, {
            livePreview: 'reduce',
        });
        this.column = column;
        this.handler = null;
    }
    build(node) {
        const wrapper = {
            getSortMethod: () => this.column.getReduce(),
            setSortMethod: (s) => this.column.setReduce(s),
        };
        this.handler = sortMethods(node, wrapper, Object.keys(EAdvancedSortMethod));
        this.enableLivePreviews(this.handler.elems);
    }
    submit() {
        return this.handler.submit();
    }
    reset() {
        this.handler.reset();
    }
    cancel() {
        this.handler.cancel();
    }
}
