import {Column} from '../../model';
import ADialog, {IDialogContext} from './ADialog';
import {IToolbarDialogAddon, IRankingHeaderContext} from '../interfaces';

/** @internal */
export default class AddonDialog extends ADialog {
  constructor(private readonly column: Column, private readonly addons: IToolbarDialogAddon[], dialog: IDialogContext, private readonly ctx: IRankingHeaderContext, private readonly onClick?: () => void) {
    // TODO dialog
    super(dialog, {
      fullDialog: Boolean(onClick),
      resetPossible: false
    });
  }

  protected build(node: HTMLElement) {
    for(const addon of this.addons) {
      this.node.insertAdjacentHTML('beforeend', `<strong>${addon.title}</strong>`);
      addon.append(this.column, node, this.dialog, this.ctx);
    }
  }

  protected submit(): boolean {
    if (this.onClick) {
      this.onClick();
    }
    return true;
  }
}
