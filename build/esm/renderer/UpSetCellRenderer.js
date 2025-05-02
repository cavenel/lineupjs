import { Column, isCategoricalColumn, isSetColumn } from '../model';
import { CANVAS_HEIGHT, cssClass, UPSET } from '../styles';
import { renderMissingCanvas, renderMissingDOM } from './missing';
export default class UpSetCellRenderer {
    constructor() {
        this.title = 'UpSet';
    }
    canRender(col) {
        // set but not a pure categorical one
        return isSetColumn(col) && !isCategoricalColumn(col);
    }
    static calculateSetPath(setData, cellDimension) {
        const catindexes = [];
        setData.forEach((d, i) => (d ? catindexes.push(i) : -1));
        const left = catindexes[0] * cellDimension + cellDimension / 2;
        const right = catindexes[catindexes.length - 1] * cellDimension + cellDimension / 2;
        return { left, right };
    }
    static createDOMContext(col, sanitize) {
        const categories = col.categories;
        let templateRows = '';
        for (const cat of categories) {
            templateRows += `<div class="${cssClass('upset-dot')}" title="${sanitize(cat.label)}"></div>`;
        }
        return {
            template: `<div><div class="${cssClass('upset-line')}"></div>${templateRows}</div>`,
            render: (n, value) => {
                Array.from(n.children)
                    .slice(1)
                    .forEach((d, i) => {
                    const v = value[i];
                    d.classList.toggle(cssClass('enabled'), v);
                });
                const line = n.firstElementChild;
                const left = value.findIndex((d) => d);
                const right = value.length - 1 - value.reverse().findIndex((d) => d);
                if (left < 0 || left === right) {
                    line.style.display = 'none';
                    return;
                }
                line.style.display = null;
                line.style.left = `${Math.round((100 * (left + 0.5)) / value.length)}%`;
                line.style.width = `${Math.round((100 * (right - left)) / value.length)}%`;
            },
        };
    }
    create(col, context) {
        const { template, render } = UpSetCellRenderer.createDOMContext(col, context.sanitize);
        const width = context.colWidth(col);
        const cellDimension = width / col.categories.length;
        return {
            template,
            update: (n, d) => {
                if (renderMissingDOM(n, col, d)) {
                    return;
                }
                render(n, col.getValues(d));
            },
            render: (ctx, d) => {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                // Circle
                const data = col.getValues(d);
                const hasTrueValues = data.some((d) => d); //some values are true?
                ctx.save();
                ctx.fillStyle = UPSET.color;
                ctx.strokeStyle = UPSET.color;
                if (hasTrueValues) {
                    const { left, right } = UpSetCellRenderer.calculateSetPath(data, cellDimension);
                    ctx.beginPath();
                    ctx.moveTo(left, CANVAS_HEIGHT / 2);
                    ctx.lineTo(right, CANVAS_HEIGHT / 2);
                    ctx.stroke();
                }
                data.forEach((d, j) => {
                    const posX = j * cellDimension;
                    ctx.beginPath();
                    ctx.globalAlpha = d ? 1 : UPSET.inactive;
                    ctx.fillRect(posX, 0, cellDimension, CANVAS_HEIGHT);
                    ctx.fill();
                });
                ctx.restore();
            },
        };
    }
    createGroup(col, context) {
        const { template, render } = UpSetCellRenderer.createDOMContext(col, context.sanitize);
        return {
            template,
            update: (n, group) => {
                return context.tasks.groupCategoricalStats(col, group).then((r) => {
                    if (typeof r === 'symbol') {
                        return;
                    }
                    render(n, r.group.hist.map((d) => d.count > 0));
                });
            },
        };
    }
    createSummary(col, context) {
        const { template, render } = UpSetCellRenderer.createDOMContext(col, context.sanitize);
        return {
            template,
            update: (n) => {
                return context.tasks.summaryCategoricalStats(col).then((r) => {
                    if (typeof r === 'symbol') {
                        return;
                    }
                    render(n, r.summary.hist.map((d) => d.count > 0));
                });
            },
        };
    }
}
