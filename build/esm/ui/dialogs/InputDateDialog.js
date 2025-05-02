import { timeFormat } from 'd3-time-format';
import APopup from './APopup';
/** @internal */
export default class InputDateDialog extends APopup {
    constructor(dialog, callback, options = {}) {
        super(dialog);
        this.callback = callback;
        this.ioptions = {
            value: null,
            label: null,
        };
        Object.assign(this.ioptions, options);
    }
    build(node) {
        const o = this.ioptions;
        const f = timeFormat('%Y-%m-%d');
        node.insertAdjacentHTML('beforeend', `
     <input type="date" value="${o.value ? f(o.value) : ''}" required autofocus placeholder="${this.dialog.sanitize(o.label ? o.label : 'enter date')}">
    `);
        this.findInput('input[type=date]').addEventListener('keypress', (evt) => {
            if (evt.key === 'Enter') {
                this.triggerSubmit();
            }
        });
        this.enableLivePreviews('input');
    }
    submit() {
        this.callback(this.findInput('input[type=date]').valueAsDate);
        return true;
    }
}
