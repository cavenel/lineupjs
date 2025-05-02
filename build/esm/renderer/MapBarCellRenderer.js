import { clear, round } from '../internal';
import { Column, isMapAbleColumn, isMapColumn, isNumberColumn, } from '../model';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { noRenderer, adaptColor, BIG_MARK_LIGHTNESS_FACTOR } from './utils';
import { cssClass } from '../styles';
export default class MapBarCellRenderer {
    constructor() {
        this.title = 'Bar Table';
    }
    canRender(col, mode) {
        return (isMapColumn(col) &&
            isNumberColumn(col) &&
            (mode === ERenderMode.CELL || (mode === ERenderMode.SUMMARY && isMapAbleColumn(col))));
    }
    create(col, _context, imposer) {
        const formatter = col.getNumberFormat();
        return {
            template: `<div class="${cssClass('rtable')}"></div>`,
            update: (node, d) => {
                if (renderMissingDOM(node, col, d)) {
                    return;
                }
                renderTable(node, col.getMap(d), (n, { value }) => {
                    if (Number.isNaN(value)) {
                        n.classList.add(cssClass('missing'));
                    }
                    else {
                        const w = round(value * 100, 2);
                        n.title = formatter(value);
                        const inner = n.ownerDocument.createElement('div');
                        inner.style.width = `${w}%`;
                        inner.style.backgroundColor = adaptColor(colorOf(col, d, imposer), BIG_MARK_LIGHTNESS_FACTOR);
                        n.appendChild(inner);
                        const span = n.ownerDocument.createElement('span');
                        span.classList.add(cssClass('hover-only'));
                        span.textContent = formatter(value);
                        inner.appendChild(span);
                    }
                });
            },
        };
    }
    createGroup() {
        return noRenderer;
    }
    createSummary(col) {
        return {
            template: `<div class="${cssClass('rtable')}"><div>Key</div><div><span></span><span></span>Value</div></div>`,
            update: (node) => {
                const range = col.getRange();
                const value = node.lastElementChild;
                value.firstElementChild.textContent = range[0];
                value.children[1].textContent = range[1];
            },
        };
    }
}
export function renderTable(node, arr, renderValue) {
    clear(node);
    const doc = node.ownerDocument;
    for (const entry of arr) {
        const keyNode = doc.createElement('div');
        keyNode.textContent = entry.key;
        node.appendChild(keyNode);
        const valueNode = doc.createElement('div');
        renderValue(valueNode, entry);
        node.appendChild(valueNode);
    }
}
