import { dialogContext } from './ADialog';
import RenameRankingDialog from './RenameRankingDialog';
import { cssClass } from '../../styles';
import { actionCSSClass } from '../header';
import APopup from './APopup';
/** @internal */
export default class MoreRankingOptionsDialog extends APopup {
    constructor(ranking, dialog, ctx) {
        super(dialog, {
            autoClose: true,
        });
        this.ranking = ranking;
        this.ctx = ctx;
    }
    addIcon(node, title, onClick) {
        const sanitized = this.ctx.sanitize(title);
        node.insertAdjacentHTML('beforeend', `<i title="${sanitized}" class="${actionCSSClass(title)}"><span>${sanitized}</span> </i>`);
        const i = node.lastElementChild;
        i.onclick = (evt) => {
            evt.stopPropagation();
            onClick(evt);
        };
    }
    build(node) {
        node.classList.add(cssClass('more-options'));
        this.addIcon(node, 'Rename', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            const dialog = new RenameRankingDialog(this.ranking, dialogContext(this.ctx, this.level + 1, evt));
            dialog.open();
        });
        this.addIcon(node, 'Remove', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            this.destroy('confirm');
            this.ctx.provider.removeRanking(this.ranking);
        });
    }
}
