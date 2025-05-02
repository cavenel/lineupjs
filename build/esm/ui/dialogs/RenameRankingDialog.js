import ADialog, {} from './ADialog';
import { cssClass } from '../../styles';
/** @internal */
export default class RenameRankingDialog extends ADialog {
    constructor(ranking, dialog) {
        super(dialog, {
            livePreview: 'rename',
        });
        this.ranking = ranking;
        this.before = ranking.getLabel();
    }
    build(node) {
        node.classList.add(cssClass('dialog-rename'));
        node.insertAdjacentHTML('beforeend', `
      <input type="text" value="${this.dialog.sanitize(this.ranking.getLabel())}" required autofocus placeholder="name">`);
    }
    reset() {
        this.findInput('input[type="text"]').value = this.before;
    }
    cancel() {
        this.ranking.setLabel(this.before);
    }
    submit() {
        const newValue = this.findInput('input[type="text"]').value;
        this.ranking.setLabel(newValue);
        return true;
    }
}
