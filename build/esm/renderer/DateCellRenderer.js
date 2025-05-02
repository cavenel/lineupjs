import { Column, DateColumn } from '../model';
import { renderMissingDOM } from './missing';
import { noop, noRenderer, setText, exampleText } from './utils';
import { chooseAggregatedDate } from '../model/internalDate';
import { cssClass } from '../styles';
export default class DateCellRenderer {
    constructor() {
        this.title = 'Date';
        this.groupTitle = 'Date';
        this.summaryTitle = 'Date';
    }
    canRender(col) {
        return col instanceof DateColumn;
    }
    create(col) {
        return {
            template: `<div> </div>`,
            update: (n, d) => {
                renderMissingDOM(n, col, d);
                setText(n, col.getLabel(d));
            },
            render: noop,
        };
    }
    createGroup(col, context) {
        return {
            template: `<div> </div>`,
            update: (n, group) => {
                const isGrouped = col.isGroupedBy() >= 0;
                if (isGrouped) {
                    return context.tasks
                        .groupRows(col, group, 'date', (rows) => chooseAggregatedDate(rows, col.getDateGrouper(), col))
                        .then((chosen) => {
                        if (typeof chosen === 'symbol') {
                            return;
                        }
                        n.classList.toggle(cssClass('missing'), !chosen);
                        setText(n, chosen ? chosen.name : '');
                    });
                }
                return context.tasks
                    .groupExampleRows(col, group, 'date', (sample) => exampleText(col, sample))
                    .then((text) => {
                    if (typeof text === 'symbol') {
                        return;
                    }
                    n.classList.toggle(cssClass('missing'), !text);
                    setText(n, text);
                });
            },
        };
    }
    createSummary() {
        return noRenderer;
    }
}
