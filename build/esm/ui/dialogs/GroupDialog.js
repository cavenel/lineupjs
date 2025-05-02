import ADialog, {} from './ADialog';
import { uniqueId, forEach } from './utils';
import { getToolbarDialogAddons } from '../toolbarResolvers';
import { cssClass } from '../../styles';
/** @internal */
export default class GroupDialog extends ADialog {
    constructor(column, dialog, ctx) {
        super(dialog, {
            livePreview: 'group',
        });
        this.column = column;
        this.ctx = ctx;
        this.handlers = [];
    }
    build(node) {
        const addons = getToolbarDialogAddons(this.column, 'group', this.ctx);
        for (const addon of addons) {
            const strong = node.ownerDocument.createElement('strong');
            strong.textContent = addon.title;
            this.node.insertAdjacentElement('beforeend', strong);
            this.handlers.push(addon.append(this.column, this.node, this.dialog, this.ctx));
        }
        this.handlers.push(sortOrder(node, this.column, this.dialog.idPrefix));
        for (const handler of this.handlers) {
            this.enableLivePreviews(handler.elems);
        }
    }
    submit() {
        for (const handler of this.handlers) {
            if (handler.submit() === false) {
                return false;
            }
        }
        return true;
    }
    cancel() {
        for (const handler of this.handlers) {
            handler.cancel();
        }
    }
    reset() {
        for (const handler of this.handlers) {
            handler.reset();
        }
    }
}
function sortOrder(node, column, idPrefix) {
    const ranking = column.findMyRanker();
    const current = ranking.getGroupCriteria();
    let order = current.indexOf(column);
    const enabled = order >= 0;
    if (order < 0) {
        order = current.length;
    }
    const id = uniqueId(idPrefix);
    node.insertAdjacentHTML('afterbegin', `
        <strong>Group By</strong>
        <label class="${cssClass('checkbox')}"><input type="radio" name="grouped" value="true" ${enabled ? 'checked' : ''} ><span>Enabled</span></label>
        <label class="${cssClass('checkbox')}"><input type="radio" name="grouped" value="false" ${!enabled ? 'checked' : ''} ><span>Disabled</span></label>
        <strong>Group Priority</strong>
        <input type="number" id="${id}P" step="1" min="1" max="${current.length + 1}" value="${order + 1}">
    `);
    const updateDisabled = (disable) => {
        forEach(node, 'input:not([name=grouped]), select, textarea', (d) => {
            d.disabled = disable;
        });
    };
    updateDisabled(!enabled);
    forEach(node, 'input[name=grouped]', (n) => {
        n.addEventListener('change', () => {
            const enabled = n.value === 'true';
            updateDisabled(!enabled);
        }, {
            passive: true,
        });
    });
    return {
        elems: `input[name=grouped], #${id}P`,
        submit() {
            const enabled = node.querySelector('input[name=grouped]:checked').value === 'true';
            const order = Number.parseInt(node.querySelector(`#${id}P`).value, 10) - 1;
            ranking.groupBy(column, !enabled ? -1 : order);
            return true;
        },
        reset() {
            node.querySelector('input[name=grouped][value=false]').checked = true;
            node.querySelector(`#${id}P`).value = (current.length + (!enabled ? 1 : 0)).toString();
            updateDisabled(true);
        },
        cancel() {
            ranking.groupBy(column, current.indexOf(column));
        },
    };
}
