import { LinkMapColumn, Column } from '../model';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { groupByKey } from './TableCellRenderer';
import { noRenderer, noop } from './utils';
import { cssClass } from '../styles';
import { clear } from '../internal';
import { updateLinkList } from './LinkCellRenderer';
import { renderTable } from './MapBarCellRenderer';
export default class LinkMapCellRenderer {
    constructor() {
        this.title = 'Table with Links';
    }
    canRender(col, mode) {
        return col instanceof LinkMapColumn && mode !== ERenderMode.SUMMARY;
    }
    create(col, context) {
        const align = context.sanitize(col.alignment || 'left');
        return {
            template: `<div class="${cssClass('rtable')}"></div>`,
            update: (node, d) => {
                if (renderMissingDOM(node, col, d)) {
                    return;
                }
                clear(node);
                const doc = node.ownerDocument;
                for (const { key, value } of col.getLinkMap(d)) {
                    const keyNode = doc.createElement('div');
                    keyNode.classList.add(cssClass('table-cell'));
                    keyNode.textContent = key;
                    node.appendChild(keyNode);
                    const valueNode = doc.createElement('div');
                    valueNode.classList.add(cssClass('table-cell'));
                    if (align !== 'left') {
                        valueNode.classList.add(cssClass(align));
                    }
                    const valueA = doc.createElement('a');
                    valueA.href = value.href;
                    valueA.textContent = value.alt;
                    valueA.target = '_blank';
                    valueA.rel = 'noopener';
                    valueNode.appendChild(valueA);
                    node.appendChild(valueNode);
                }
            },
            render: noop,
        };
    }
    static example(arr) {
        const numExampleRows = 5;
        const examples = [];
        for (const row of arr) {
            if (!row || !row.value.href) {
                continue;
            }
            examples.push(row.value);
            if (examples.length >= numExampleRows) {
                break;
            }
        }
        if (examples.length === 0) {
            return [[], false];
        }
        return [examples, examples.length < arr.length];
    }
    createGroup(col, context) {
        const align = col.alignment || 'left';
        return {
            template: `<div class="${cssClass('rtable')}"></div>`,
            update: (node, group) => {
                return context.tasks
                    .groupRows(col, group, 'linkmap', (rows) => groupByKey(rows.map((d) => col.getLinkMap(d))))
                    .then((entries) => {
                    if (typeof entries === 'symbol') {
                        return;
                    }
                    renderTable(node, entries, (n, { values }) => {
                        if (align !== 'left') {
                            n.classList.add(cssClass(align));
                        }
                        const [links, more] = LinkMapCellRenderer.example(values);
                        if (links.length === 0) {
                            n.classList.add(cssClass('missing'));
                        }
                        else {
                            updateLinkList(n, links, more);
                        }
                    });
                });
            },
        };
    }
    createSummary() {
        return noRenderer;
    }
}
