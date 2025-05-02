import { renderMissingCanvas, renderMissingDOM } from './missing';
import { boxplotBuilder, getSortLabel } from '../internal';
export class ANumbersCellRenderer {
    static choose(col, rows) {
        let row = null;
        const data = rows.map((r, i) => {
            if (i === 0) {
                row = r;
            }
            return { n: col.getNumbers(r), raw: col.getRawNumbers(r) };
        });
        const cols = col.dataLength;
        const normalized = [];
        const raw = [];
        // mean column)
        for (let i = 0; i < cols; ++i) {
            const vs = data.map((d) => ({ n: d.n[i], raw: d.raw[i] })).filter((d) => !Number.isNaN(d.n));
            if (vs.length === 0) {
                normalized.push(NaN);
                raw.push(NaN);
            }
            else {
                const bbn = boxplotBuilder();
                const bbr = boxplotBuilder();
                const s = col.getSortMethod();
                vs.forEach((d) => {
                    bbn.push(d.n);
                    bbr.push(d.raw);
                });
                normalized.push(bbn.build()[s]);
                raw.push(bbr.build()[s]);
            }
        }
        return { normalized, raw, row };
    }
    create(col, context, imposer) {
        const width = context.colWidth(col);
        const { templateRow, render, update, clazz } = this.createContext(col, context, imposer);
        return {
            template: `<div class="${clazz}">${templateRow}</div>`,
            update: (n, d) => {
                if (renderMissingDOM(n, col, d)) {
                    return;
                }
                update(n, col.getNumbers(d), col.getRawNumbers(d), d);
            },
            render: (ctx, d) => {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                render(ctx, col.getNumbers(d), d);
            },
        };
    }
    createGroup(col, context, imposer) {
        const { templateRow, update, clazz } = this.createContext(col, context, imposer);
        return {
            template: `<div class="${clazz}">${templateRow}</div>`,
            update: (n, group) => {
                // render a heatmap
                return context.tasks
                    .groupRows(col, group, this.title, (rows) => ANumbersCellRenderer.choose(col, rows))
                    .then((data) => {
                    if (typeof data !== 'symbol') {
                        update(n, data.normalized, data.raw, data.row, `${getSortLabel(col.getSortMethod())} `);
                    }
                });
            },
        };
    }
}
/** @internal */
export function matchRows(n, length, template) {
    // first match the number of rows
    const children = Array.from(n.children);
    if (children.length > length) {
        children.slice(length).forEach((c) => c.remove());
    }
    else if (length > children.length) {
        n.insertAdjacentHTML('beforeend', template.repeat(length - children.length));
    }
}
