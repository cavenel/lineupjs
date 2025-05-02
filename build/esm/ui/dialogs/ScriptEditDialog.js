import { ScriptColumn } from '../../model';
import ADialog, {} from './ADialog';
import { cssClass } from '../../styles';
/** @internal */
export default class ScriptEditDialog extends ADialog {
    constructor(column, dialog) {
        super(dialog);
        this.column = column;
        this.before = column.getScript();
    }
    build(node) {
        node.insertAdjacentHTML('beforeend', `<textarea class="${cssClass('textarea')}" autofocus="true" rows="5" autofocus="autofocus" style="width: 95%;">${this.column.getScript()}</textarea>`);
    }
    cancel() {
        this.column.setScript(this.before);
    }
    reset() {
        this.node.querySelector('textarea').value = this.column.desc.script || ScriptColumn.DEFAULT_SCRIPT;
    }
    submit() {
        this.column.setScript(this.node.querySelector('textarea').value);
        return true;
    }
}
