import {Column} from '../../model';
import ADialog, {IDialogContext} from './ADialog';
import {uniqueId, forEach} from './utils';
import {getToolbarDialogAddons} from '../toolbar';
import {IRankingHeaderContext, IToolbarDialogAddonHandler} from '../interfaces';
import {cssClass} from '../../styles';

/** @internal */
export default class GroupDialog extends ADialog {
  private readonly handlers: IToolbarDialogAddonHandler[] = [];

  constructor(private readonly column: Column, dialog: IDialogContext, private readonly ctx: IRankingHeaderContext) {
    super(dialog);
  }

  protected build(node: HTMLElement) {
    const addons = getToolbarDialogAddons(this.column, 'group', this.ctx);
    for(const addon of addons) {
      this.node.insertAdjacentHTML('beforeend', `<strong>${addon.title}</strong>`);
      this.handlers.push(addon.append(this.column, this.node, this.dialog, this.ctx));
    }

    sortOrder(node, this.column, this.dialog.idPrefix);

    for (const handler of this.handlers) {
      this.enableLivePreviews(handler.elems);
    }
  }

  protected submit() {
    for (const handler of this.handlers) {
      if (!handler.submit()) {
        return false;
      }
    }
    return true;
  }

  protected cancel() {
    for (const handler of this.handlers) {
      handler.cancel();
    }
  }

  protected reset() {
    for (const handler of this.handlers) {
      handler.reset();
    }
  }
}

// TODO dialog
function sortOrder(node: HTMLElement, column: Column, idPrefix: string) {
  const ranking = column.findMyRanker()!;
  const current = ranking.getGroupCriteria();
  let order = current.indexOf(column);
  let enabled = order >= 0;

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

  const updateDisabled = (disable: boolean) => {
    forEach(node, 'input:not([name=grouped]), select, textarea', (d: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
      d.disabled = disable;
    });
  };
  updateDisabled(!enabled);

  const trigger = () => {
    // TODO dialog
    ranking.groupBy(column, !enabled ? -1 : order);
    updateDisabled(!enabled);
  };

  forEach(node, 'input[name=grouped]', (n: HTMLInputElement) => {
    n.addEventListener('change', () => {
      enabled = n.value === 'true';
      trigger();
    }, {
      passive: true
    });
  });
  {
    const priority = (<HTMLInputElement>node.querySelector(`#${id}P`));
    priority.addEventListener('change', () => {
      order = parseInt(priority.value, 10) - 1;
      trigger();
    }, {
      passive: true
    });
  }
}
