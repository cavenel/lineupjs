import { round } from '../internal';
import { Column, isNumbersColumn, isNumberColumn, DEFAULT_COLOR, } from '../model';
import { setText, adaptDynamicColorToBgColor, noRenderer, BIG_MARK_LIGHTNESS_FACTOR, adaptColor } from './utils';
import { CANVAS_HEIGHT, cssClass } from '../styles';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
export default class BarCellRenderer {
    /**
     * flag to always render the value
     * @type {boolean}
     */
    constructor(renderValue = false) {
        this.renderValue = renderValue;
        this.title = 'Bar';
    }
    canRender(col, mode) {
        return mode === ERenderMode.CELL && isNumberColumn(col) && !isNumbersColumn(col);
    }
    create(col, context, imposer) {
        const width = context.colWidth(col);
        const showMin = col.desc.showMinimumRepresentation;
        return {
            template: `<div title="">
          <div class="${cssClass('bar-label')}" style='background-color: ${DEFAULT_COLOR}'>
            <span ${this.renderValue ? '' : `class="${cssClass('hover-only')}"`}></span>
          </div>
        </div>`,
            update: (n, d) => {
                const value = col.getNumber(d);
                const missing = renderMissingDOM(n, col, d);
                const w = Number.isNaN(value) ? 0 : round(value * 100, 2);
                const title = col.getLabel(d);
                n.title = title;
                const bar = n.firstElementChild;
                bar.style.width = missing ? '100%' : showMin ? `max(1px, ${w}%)` : `${w}%`;
                const color = adaptColor(colorOf(col, d, imposer, value), BIG_MARK_LIGHTNESS_FACTOR);
                bar.style.backgroundColor = missing ? null : color;
                setText(bar.firstElementChild, title);
                const item = bar.firstElementChild;
                setText(item, title);
                adaptDynamicColorToBgColor(item, color || DEFAULT_COLOR, title, w / 100);
            },
            render: (ctx, d) => {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                const value = col.getNumber(d);
                ctx.fillStyle = adaptColor(colorOf(col, d, imposer, value) || DEFAULT_COLOR, BIG_MARK_LIGHTNESS_FACTOR);
                const w = width * value;
                ctx.fillRect(0, 0, Number.isNaN(w) ? 0 : Math.max(w, showMin ? 1 : 0), CANVAS_HEIGHT);
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
