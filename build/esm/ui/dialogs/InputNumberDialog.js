import APopup from './APopup';
/** @internal */
export default class InputNumberDialog extends APopup {
    constructor(dialog, callback, options = {}) {
        super(dialog);
        this.callback = callback;
        this.ioptions = {
            min: NaN,
            max: NaN,
            step: 'any',
            value: NaN,
            label: null,
        };
        Object.assign(this.ioptions, options);
    }
    build(node) {
        const o = this.ioptions;
        node.insertAdjacentHTML('beforeend', `
     <input type="number" value="${Number.isNaN(o.value) ? '' : String(o.value)}" required autofocus placeholder="${this.dialog.sanitize(o.label ? o.label : 'enter number')}" ${Number.isNaN(o.min) ? '' : ` min="${o.min}"`} ${Number.isNaN(o.max) ? '' : ` max="${o.max}"`} step="${o.step}">
    `);
        this.enableLivePreviews('input');
    }
    submit() {
        this.callback(this.findInput('input[type=number]').valueAsNumber);
        return true;
    }
}
