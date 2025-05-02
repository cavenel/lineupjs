import { cssClass } from '../../styles';
import APopup from './APopup';
/** @internal */
export default class ChooseRankingDialog extends APopup {
    constructor(items, dialog) {
        super(dialog);
        this.items = items;
    }
    build(node) {
        node.classList.add(cssClass('more-options'), cssClass('choose-options'));
        for (const item of this.items) {
            node.appendChild(item);
        }
    }
}
