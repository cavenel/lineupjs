import { Column, CompositeNumberColumn } from '../model';
import { CANVAS_HEIGHT, cssClass } from '../styles';
import { getHistDOMRenderer } from './HistogramCellRenderer';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
import { createData } from './MultiLevelCellRenderer';
import { colorOf, matchColumns, forEachChild } from './utils';
import { tasksAll } from '../provider';
export default class InterleavingCellRenderer {
    constructor() {
        this.title = 'Interleaved';
    }
    canRender(col) {
        return col instanceof CompositeNumberColumn;
    }
    create(col, context) {
        const { cols } = createData(col, context, false, ERenderMode.CELL);
        const width = context.colWidth(col);
        return {
            template: `<div>${cols.map((r) => r.template).join('')}</div>`,
            update: (n, d, i, group) => {
                const missing = renderMissingDOM(n, col, d);
                if (missing) {
                    return;
                }
                matchColumns(n, cols, context);
                forEachChild(n, (ni, j) => {
                    cols[j].renderer.update(ni, d, i, group);
                });
            },
            render: (ctx, d, _i, group) => {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                ctx.save();
                ctx.scale(1, 1 / cols.length); // scale since internal use the height, too
                cols.forEach((r, i) => {
                    const rr = r.renderer;
                    if (rr.render) {
                        rr.render(ctx, d, i, group);
                    }
                    ctx.translate(0, CANVAS_HEIGHT);
                });
                ctx.restore();
            },
        };
    }
    createGroup(col, context) {
        const { cols } = createData(col, context, false, ERenderMode.GROUP);
        return {
            template: `<div>${cols.map((r) => r.template).join('')}</div>`,
            update: (n, group) => {
                matchColumns(n, cols, context);
                forEachChild(n, (ni, j) => {
                    cols[j].groupRenderer.update(ni, group);
                });
            },
        };
    }
    createSummary(col, context, _interactive) {
        const cols = col.children;
        let acc = 0;
        const { template, render } = getHistDOMRenderer(col, {
            color: () => colorOf(cols[acc++ % cols.length]),
        });
        return {
            template,
            update: (n) => {
                const tasks = cols.map((col) => context.tasks.summaryNumberStats(col));
                return tasksAll(tasks).then((vs) => {
                    if (typeof vs === 'symbol') {
                        return;
                    }
                    const summaries = vs.map((d) => d.summary);
                    if (!summaries.some(Boolean)) {
                        n.classList.add(cssClass('missing'));
                        return;
                    }
                    n.classList.remove(cssClass('missing'));
                    const grouped = groupedHist(summaries);
                    render(n, grouped);
                });
            },
        };
    }
}
const dummyBin = {
    count: 0,
    x0: 0,
    x1: 0,
};
function groupedHist(stats) {
    const sample = stats.find(Boolean);
    if (!sample) {
        return null;
    }
    const bins = sample.hist.length;
    // assert all have the same bin size
    const hist = [];
    let maxBin = 0;
    for (let i = 0; i < bins; ++i) {
        for (const s of stats) {
            const bin = s ? s.hist[i] : null;
            if (!bin) {
                hist.push(dummyBin);
                continue;
            }
            if (bin.count > maxBin) {
                maxBin = bin.count;
            }
            hist.push(bin);
        }
    }
    return {
        maxBin,
        hist,
    };
}
