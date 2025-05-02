import ADialog, {} from './ADialog';
import { cssClass } from '../../styles';
/** @internal */
export default class RenameDialog extends ADialog {
    constructor(column, dialog) {
        super(dialog);
        this.column = column;
        this.before = column.getMetaData();
    }
    build(node) {
        node.classList.add(cssClass('dialog-rename'));
        node.insertAdjacentHTML('beforeend', `
      <input type="text" required autofocus placeholder="name">
      <input type="text" placeholder="summary" name="summary">
      <textarea class="${cssClass('textarea')}" rows="5" placeholder="description"></textarea>`);
        node.querySelector('input').value = this.column.label;
        node.querySelector('input:last-of-type').value = this.column.getMetaData().summary;
        node.querySelector('textarea').textContent = this.column.description;
    }
    reset() {
        const desc = this.column.desc;
        const meta = {
            label: desc.label || this.column.id,
            summary: desc.summary || '',
            description: desc.description || '',
        };
        this.findInput('input[type="text"]').value = meta.label;
        this.findInput('input[name="summary"]').value = meta.summary;
        this.node.querySelector('textarea').value = meta.description;
    }
    submit() {
        const label = this.findInput('input[type="text"]').value;
        const summary = this.findInput('input[name="summary"]').value.trim();
        const description = this.node.querySelector('textarea').value;
        this.column.setMetaData({ label, description, summary });
        return true;
    }
    cancel() {
        this.column.setMetaData(this.before);
    }
}
