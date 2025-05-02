import { Column, SelectionColumn } from '../model';
import { cssClass } from '../styles';
import { everyIndices } from '../model/internal';
import { rangeSelection } from '../provider/utils';
export default class SelectionRenderer {
    constructor() {
        this.title = 'Default';
    }
    canRender(col) {
        return col instanceof SelectionColumn;
    }
    create(col, ctx) {
        return {
            template: `<div></div>`,
            update: (n, d, i) => {
                n.onclick = function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.shiftKey) {
                        const ranking = col.findMyRanker().id;
                        if (rangeSelection(ctx.provider, ranking, d.i, i, event.ctrlKey)) {
                            return;
                        }
                    }
                    col.toggleValue(d);
                };
            },
        };
    }
    createGroup(col, context) {
        return {
            template: `<div></div>`,
            update: (n, group) => {
                let selected = 0;
                let unselected = 0;
                const total = group.order.length;
                everyIndices(group.order, (i) => {
                    const s = context.provider.isSelected(i);
                    if (s) {
                        selected++;
                    }
                    else {
                        unselected++;
                    }
                    if (selected * 2 > total || unselected * 2 > total) {
                        // more than half already, can abort already decided
                        return false;
                    }
                    return true;
                });
                n.classList.toggle(cssClass('group-selected'), selected * 2 > total);
                n.onclick = function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    const value = n.classList.toggle(cssClass('group-selected'));
                    col.setValues(group.order, value);
                };
            },
        };
    }
    createSummary(col, context) {
        const unchecked = cssClass('icon-unchecked');
        const checked = cssClass('icon-checked');
        return {
            template: `<div title="(Un)Select All" class="${unchecked}"></div>`,
            update: (node) => {
                node.onclick = (evt) => {
                    evt.stopPropagation();
                    const isUnchecked = node.classList.contains(unchecked);
                    if (isUnchecked) {
                        context.provider.selectAllOf(col.findMyRanker());
                        node.classList.remove(unchecked);
                        node.classList.add(checked);
                    }
                    else {
                        context.provider.setSelection([]);
                        node.classList.remove(checked);
                        node.classList.add(unchecked);
                    }
                };
            },
        };
    }
}
