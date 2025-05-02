import { ActionColumn, Column } from '../model';
import { ERenderMode, } from './interfaces';
import { forEachChild, noRenderer } from './utils';
import { cssClass } from '../styles';
export default class ActionRenderer {
    constructor() {
        this.title = 'Default';
    }
    canRender(col, mode) {
        return col instanceof ActionColumn && mode !== ERenderMode.SUMMARY;
    }
    create(col, context) {
        const actions = col.actions;
        return {
            template: `<div class="${cssClass('actions')} ${cssClass('hover-only')}">${actions
                .map((a) => `<span title='${context.sanitize(a.name)}' class='${context.sanitize(a.className || '')}'>${context.sanitize(a.icon || '')}</span>`)
                .join('')}</div>`,
            update: (n, d) => {
                forEachChild(n, (ni, i) => {
                    ni.onclick = function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        setTimeout(() => actions[i].action(d), 1); // async
                    };
                });
            },
        };
    }
    createGroup(col, context) {
        const actions = col.groupActions;
        return {
            template: `<div class="${cssClass('actions')} ${cssClass('hover-only')}">${actions
                .map((a) => `<span title='${context.sanitize(a.name)}' class='${context.sanitize(a.className || '')}'>${context.sanitize(a.icon || '')}</span>`)
                .join('')}</div>`,
            update: (n, group) => {
                forEachChild(n, (ni, i) => {
                    ni.onclick = function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        context.tasks
                            .groupRows(col, group, 'identity', (r) => r)
                            .then((rows) => {
                            if (typeof rows === 'symbol') {
                                return;
                            }
                            setTimeout(() => actions[i].action(group, Array.from(rows)), 1); // async
                        });
                    };
                });
            },
        };
    }
    createSummary() {
        return noRenderer;
    }
}
