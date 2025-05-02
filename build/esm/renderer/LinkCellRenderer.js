import { LinkColumn, Column } from '../model';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { noRenderer, setText } from './utils';
import { cssClass } from '../styles';
import { clear } from '../internal';
export default class LinkCellRenderer {
    constructor() {
        this.title = 'Link';
    }
    canRender(col, mode) {
        return col instanceof LinkColumn && mode !== ERenderMode.SUMMARY;
    }
    create(col, context) {
        const align = context.sanitize(col.alignment || 'left');
        return {
            template: `<a${align !== 'left' ? ` class="${cssClass(align)}"` : ''} target="_blank" rel="noopener" href=""></a>`,
            update: (n, d) => {
                renderMissingDOM(n, col, d);
                const v = col.getLink(d);
                n.href = v ? v.href : '';
                if (col.escape) {
                    setText(n, v ? v.alt : '');
                }
                else {
                    n.innerHTML = v ? v.alt : '';
                }
            },
        };
    }
    static exampleText(col, rows) {
        const numExampleRows = 5;
        const examples = [];
        rows.every((row) => {
            const v = col.getLink(row);
            if (!v) {
                return true;
            }
            examples.push(v);
            return examples.length < numExampleRows;
        });
        if (examples.length === 0) {
            return [[], false];
        }
        return [examples, examples.length < rows.length];
    }
    createGroup(col, context) {
        return {
            template: `<div> </div>`,
            update: (n, group) => {
                return context.tasks
                    .groupExampleRows(col, group, 'link', (rows) => LinkCellRenderer.exampleText(col, rows))
                    .then((out) => {
                    if (typeof out === 'symbol') {
                        return;
                    }
                    const [links, more] = out;
                    updateLinkList(n, links, more);
                });
            },
        };
    }
    createSummary() {
        return noRenderer;
    }
}
export function updateLinkList(n, links, more) {
    n.classList.toggle(cssClass('missing'), links.length === 0);
    clear(n);
    links.forEach((l, i) => {
        if (i > 0) {
            n.appendChild(n.ownerDocument.createTextNode(', '));
        }
        const a = n.ownerDocument.createElement('a');
        a.href = l.href;
        a.textContent = l.alt;
        a.target = '_blank';
        a.rel = 'noopener';
        n.appendChild(a);
    });
    if (more) {
        n.insertAdjacentText('beforeend', ', …');
    }
}
