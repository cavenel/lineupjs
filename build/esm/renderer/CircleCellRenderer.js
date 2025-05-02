import { Column, isNumbersColumn, isNumberColumn } from '../model';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { adaptColor, noRenderer, setText, SMALL_MARK_LIGHTNESS_FACTOR } from './utils';
import { cssClass } from '../styles';
export default class CircleCellRenderer {
    /**
     * flag to always render the value
     * @type {boolean}
     */
    constructor(renderValue = false) {
        this.renderValue = renderValue;
        this.title = 'Proportional Symbol';
    }
    canRender(col, mode) {
        return isNumberColumn(col) && mode === ERenderMode.CELL && !isNumbersColumn(col);
    }
    create(col, _context, imposer) {
        return {
            template: `<div style="background: radial-gradient(circle closest-side, red 100%, transparent 100%)" title="">
              <div class="${this.renderValue ? '' : cssClass('hover-only')} ${cssClass('bar-label')}"></div>
          </div>`,
            update: (n, d) => {
                const v = col.getNumber(d);
                const p = Math.round(v * 100);
                const missing = renderMissingDOM(n, col, d);
                n.style.background = missing
                    ? null
                    : `radial-gradient(circle closest-side, ${adaptColor(colorOf(col, d, imposer), SMALL_MARK_LIGHTNESS_FACTOR)} ${p}%, transparent ${p}%)`;
                setText(n.firstElementChild, col.getLabel(d));
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
