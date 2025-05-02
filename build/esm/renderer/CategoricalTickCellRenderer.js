import { DENSE_HISTOGRAM } from '../constants';
import { round } from '../internal';
import { Column, isCategoricalColumn } from '../model';
import { CANVAS_HEIGHT, cssClass, TICK } from '../styles';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
import { adaptColor, noRenderer, SMALL_MARK_LIGHTNESS_FACTOR } from './utils';
export default class CategoricalTickCellRenderer {
    /**
     * flag to always render the value
     * @type {boolean}
     */
    constructor(renderValue = false) {
        this.renderValue = renderValue;
        this.title = 'Tick';
    }
    canRender(col, mode) {
        return isCategoricalColumn(col) && mode === ERenderMode.CELL;
    }
    create(col, context, imposer) {
        const width = col.getWidth();
        return {
            template: `<div><div></div><span ${this.renderValue ? '' : `class="${cssClass('text-shadow')} ${cssClass('hover-only')}"`}></span></div>`,
            update: (n, d) => {
                renderMissingDOM(n, col, d);
                const perElem = 100 / col.categories.length;
                let color = colorOf(col, d, imposer);
                if (col.categories.length > DENSE_HISTOGRAM) {
                    color = adaptColor(color, SMALL_MARK_LIGHTNESS_FACTOR);
                }
                const l = context.sanitize(col.getLabel(d));
                const index = col.categories.indexOf(col.getCategory(d));
                n.title = l;
                const tick = n.firstElementChild;
                tick.style.background = context.sanitize(color);
                tick.style.left = `${round(perElem * index, 2)}%`;
                tick.style.width = `${round(perElem, 2)}%`;
                const label = n.lastElementChild;
                label.textContent = l;
            },
            render: (ctx, d) => {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                let color = colorOf(col, d, imposer);
                if (col.categories.length > DENSE_HISTOGRAM) {
                    color = adaptColor(color, SMALL_MARK_LIGHTNESS_FACTOR);
                }
                const perElem = width / col.categories.length;
                const index = col.categories.indexOf(col.getCategory(d));
                ctx.save();
                ctx.globalAlpha = TICK.opacity;
                ctx.fillStyle = color || TICK.color;
                ctx.fillRect(Math.max(0, index * perElem), 0, perElem, CANVAS_HEIGHT);
                ctx.restore();
            },
        };
    }
    createGroup() {
        return noRenderer;
    }
    createSummary() {
        return noRenderer;
    }
}
