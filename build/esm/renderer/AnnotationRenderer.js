import { AnnotateColumn, Column } from '../model';
import StringCellRenderer from './StringCellRenderer';
import { cssClass } from '../styles';
export default class AnnotationRenderer extends StringCellRenderer {
    constructor() {
        super(...arguments);
        this.title = 'Default';
    }
    canRender(col) {
        return super.canRender(col) && col instanceof AnnotateColumn;
    }
    create(col) {
        return {
            template: `<div>
        <span></span>
        <input class="${cssClass('hover-only')} ${cssClass('annotate-input')}">
       </div>`,
            update: (n, d) => {
                const label = n.firstElementChild;
                const input = n.lastElementChild;
                input.onchange = () => {
                    label.textContent = input.value;
                    col.setValue(d, input.value);
                };
                input.onclick = (event) => {
                    event.stopPropagation();
                };
                label.textContent = input.value = col.getLabel(d);
            },
        };
    }
}
