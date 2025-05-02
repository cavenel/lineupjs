import ADialog, {} from './ADialog';
import { cssClass } from '../../styles';
/** @internal */
export default class ShowTopNDialog extends ADialog {
    constructor(provider, dialog) {
        super(dialog);
        this.provider = provider;
        this.before = this.provider.getShowTopN();
    }
    build(node) {
        node.classList.add(cssClass('dialog-rename'));
        node.insertAdjacentHTML('beforeend', `
      <input type="number" min="0" step="1" value="${this.dialog.sanitize(String(this.before))}">`);
        this.enableLivePreviews('input');
    }
    cancel() {
        this.provider.setShowTopN(this.before);
    }
    submit() {
        const value = this.findInput('input').valueAsNumber;
        this.provider.setShowTopN(value);
        return true;
    }
    reset() {
        const defaultValue = 10;
        this.findInput('input').value = defaultValue.toString();
    }
}
