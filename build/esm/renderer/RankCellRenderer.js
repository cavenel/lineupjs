import { Column, RankColumn } from '../model';
import { renderMissingDOM } from './missing';
import { noRenderer, setText } from './utils';
import { cssClass } from '../styles';
export default class RankCellRenderer {
    constructor() {
        this.title = 'Default';
    }
    canRender(col) {
        return col instanceof RankColumn;
    }
    create(col) {
        return {
            template: `<div class="${cssClass('right')}"> </div>`,
            update: (n, d) => {
                renderMissingDOM(n, col, d);
                setText(n, col.getLabel(d));
            },
        };
    }
    createGroup(col) {
        const ranking = col.findMyRanker();
        return {
            template: `<div><div></div><div></div></div>`,
            update: (n, group) => {
                const fromTSpan = n.firstElementChild;
                const toTSpan = n.lastElementChild;
                if (group.order.length === 0) {
                    fromTSpan.textContent = '';
                    toTSpan.textContent = '';
                    return;
                }
                fromTSpan.textContent = ranking.getRank(group.order[0]).toString();
                toTSpan.textContent = ranking.getRank(group.order[group.order.length - 1]).toString();
            },
        };
    }
    createSummary() {
        return noRenderer;
    }
}
