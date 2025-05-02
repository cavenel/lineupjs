import { round } from '../internal';
import { Column, isNumberColumn } from '../model';
import { CANVAS_HEIGHT, cssClass, TICK } from '../styles';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
import { adaptColor, noRenderer, SMALL_MARK_LIGHTNESS_FACTOR } from './utils';
export default class TickCellRenderer {
    /**
     * flag to always render the value
     * @type {boolean}
     */
    constructor(renderValue = false) {
        this.renderValue = renderValue;
        this.title = 'Tick';
        this.groupTitle = 'Ticks';
    }
    canRender(col, mode) {
        return isNumberColumn(col) && mode === ERenderMode.CELL;
    }
    create(col, context, imposer) {
        const width = col.getWidth();
        return {
            template: `<div><div></div><span ${this.renderValue ? '' : `class="${cssClass('text-shadow')} ${cssClass('hover-only')}"`}></span></div>`,
            update: (n, d) => {
                renderMissingDOM(n, col, d);
                const color = adaptColor(colorOf(col, d, imposer), SMALL_MARK_LIGHTNESS_FACTOR);
                const l = context.sanitize(col.getLabel(d));
                const v = col.getNumber(d);
                n.title = l;
                const tick = n.firstElementChild;
                tick.style.background = context.sanitize(color);
                tick.style.left = `${round(v * 100, 2)}%`;
                const label = n.lastElementChild;
                label.textContent = l;
            },
            render: (ctx, d) => {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                const color = adaptColor(colorOf(col, d, imposer), SMALL_MARK_LIGHTNESS_FACTOR);
                const v = col.getNumber(d);
                ctx.save();
                ctx.globalAlpha = TICK.opacity;
                ctx.fillStyle = color || TICK.color;
                ctx.fillRect(Math.max(0, v * width - TICK.size / 2), 0, TICK.size, CANVAS_HEIGHT);
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
