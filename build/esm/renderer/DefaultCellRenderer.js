import { renderMissingDOM } from './missing';
import { noRenderer, setText } from './utils';
/**
 * default renderer instance rendering the value as a text
 */
export class DefaultCellRenderer {
    constructor() {
        this.title = 'String';
        this.groupTitle = 'None';
        this.summaryTitle = 'None';
    }
    canRender(_col, _mode) {
        return true;
    }
    create(col) {
        return {
            template: `<div> </div>`,
            update: (n, d) => {
                renderMissingDOM(n, col, d);
                const l = col.getLabel(d);
                setText(n, l);
                n.title = l;
            },
        };
    }
    createGroup(_col) {
        return noRenderer;
    }
    createSummary() {
        return noRenderer;
    }
}
