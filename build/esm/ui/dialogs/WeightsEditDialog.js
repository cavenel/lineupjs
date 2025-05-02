import { round } from '../../internal';
import ADialog, {} from './ADialog';
import { forEach, colorOf } from './utils';
import { cssClass } from '../../styles';
/** @internal */
export default class WeightsEditDialog extends ADialog {
    constructor(column, dialog) {
        super(dialog);
        this.column = column;
        this.weights = this.column.getWeights();
    }
    cancel() {
        this.column.setWeights(this.weights.slice());
    }
    reset() {
        const weight = 100 / this.weights.length;
        forEach(this.node, 'input[type=number]', (n) => {
            const v = round(weight, 2);
            n.value = String(v);
            n.nextElementSibling.firstElementChild.style.width = `${v}%`;
        });
    }
    build(node) {
        const children = this.column.children;
        node.insertAdjacentHTML('beforeend', `<div class="${cssClass('dialog-table')}">
        ${this.weights
            .map((weight, i) => `<div class="${cssClass('dialog-weights-table-entry')}">
          <input type="number" value="${round(weight * 100, 2)}" min="0" max="100" step="any" required>
          <span class="${cssClass('dialog-filter-color-bar')}">
            <span style="background-color: ${colorOf(children[i])}; width: ${round(weight * 100, 2)}%"></span>
          </span>
          ${this.dialog.sanitize(children[i].label)}
        </div>`)
            .join('')}
    </div>`);
        const inputs = Array.from(this.node.querySelectorAll('input[type=number]'));
        inputs.forEach((d, i) => {
            d.oninput = () => {
                const weight = d.valueAsNumber;
                if (weight <= 0) {
                    d.setCustomValidity('weight cannot be zero');
                }
                else {
                    d.setCustomValidity('');
                }
                this.updateBar(d);
                if (inputs.length !== 2) {
                    return;
                }
                // corner case auto decrease the other
                const rest = 100 - weight;
                if (rest <= 0) {
                    d.setCustomValidity('weight cannot be 100 in case of two elements');
                }
                else {
                    d.setCustomValidity('');
                }
                const other = inputs[1 - i];
                other.value = round(rest, 2).toString();
                this.updateBar(other);
            };
        });
    }
    updateBar(input) {
        input.nextElementSibling.firstElementChild.style.width = `${input.value}%`;
    }
    distributeWeights() {
        const inputs = Array.from(this.node.querySelectorAll('input[type=number]')).map((d) => ({
            input: d,
            weight: d.value ? d.valueAsNumber : NaN,
        }));
        const hasMissing = inputs.some((d) => Number.isNaN(d.weight));
        if (hasMissing) {
            // compute missing ones
            const missingIndices = inputs.filter((d) => Number.isNaN(d.weight));
            const correct = inputs.filter((d) => !Number.isNaN(d.weight));
            const sum = correct.reduce((a, b) => a + b.weight, 0);
            if (sum < 100) {
                // compute rest
                const rest = (100 - sum) / missingIndices.length;
                for (const input of missingIndices) {
                    input.input.value = round(rest, 2).toString();
                    this.updateBar(input.input);
                }
                return;
            }
            // already above 100, set missing to 0 and do a regular normalization (user has to deal with it)
            for (const input of missingIndices) {
                input.input.value = '0';
                this.updateBar(input.input);
            }
        }
        const weights = inputs.map((d) => d.weight);
        if (validWeights(weights)) {
            return; // nothing to do
        }
        // pure distribute the sum
        const sum = weights.reduce((a, b) => a + b, 0);
        for (const input of inputs) {
            input.input.value = round((input.weight * 100) / sum, 2).toString();
            this.updateBar(input.input);
        }
    }
    appendDialogButtons() {
        super.appendDialogButtons();
        const buttons = this.node.querySelector(`.${cssClass('dialog-buttons')}`);
        buttons.insertAdjacentHTML('beforeend', `<button class="${cssClass('dialog-button')} ${cssClass('dialog-weights-distribute-button')}" type="button" title="distribute weights"></button>`);
        const last = buttons.lastElementChild;
        last.onclick = (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.distributeWeights();
        };
    }
    submit() {
        const inputs = Array.from(this.node.querySelectorAll('input[type=number]')).map((d) => ({
            input: d,
            weight: d.valueAsNumber,
        }));
        let invalid = false;
        for (const input of inputs) {
            if (input.weight <= 0) {
                input.input.setCustomValidity('weight cannot be zero');
                invalid = true;
            }
            else {
                input.input.setCustomValidity('');
            }
        }
        const weights = inputs.map((d) => d.weight);
        if (!invalid && !validWeights(weights)) {
            inputs[inputs.length - 1].input.setCustomValidity('sum of weights has to be 100, change weights or use the redistribute button to fix');
            invalid = true;
        }
        if (invalid) {
            if (typeof this.node.reportValidity === 'function') {
                this.node.reportValidity();
            }
            return false;
        }
        this.column.setWeights(weights.map((d) => d / 100));
        return true;
    }
}
function validWeights(weights) {
    return Math.abs(weights.reduce((a, b) => a + b, 0) - 100) < 3;
}
