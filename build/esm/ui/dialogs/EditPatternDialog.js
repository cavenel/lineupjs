import ADialog, {} from './ADialog';
/** @internal */
export default class EditPatternDialog extends ADialog {
    constructor(column, dialog, ctx) {
        super(dialog);
        this.column = column;
        this.ctx = ctx;
        this.before = this.column.getPattern();
    }
    build(node) {
        const templates = this.column.patternTemplates;
        const s = this.ctx.sanitize;
        node.insertAdjacentHTML('beforeend', `<strong>Edit Pattern (access via $\{value}, $\{item})</strong><input
        type="text"
        size="30"
        value="${s(this.before)}"
        required
        autofocus
        placeholder="pattern (access via $\{value}, $\{item})"
        ${templates.length > 0 ? `list="ui${this.ctx.idPrefix}lineupPatternList"` : ''}
      >`);
        if (templates.length > 0) {
            node.insertAdjacentHTML('beforeend', `<datalist id="ui${this.ctx.idPrefix}lineupPatternList">${templates.map((t) => `<option value="${s(t)}">`)}</datalist>`);
        }
        this.enableLivePreviews('input');
    }
    cancel() {
        this.column.setPattern(this.before);
    }
    reset() {
        this.node.querySelector('input').value = '';
    }
    submit() {
        const newValue = this.node.querySelector('input').value;
        this.column.setPattern(newValue);
        return true;
    }
}
