import { Column, BooleanColumn } from '../model';
import { DefaultCellRenderer } from './DefaultCellRenderer';
import { ERenderMode } from './interfaces';
import { cssClass } from '../styles';
export default class BooleanCellRenderer extends DefaultCellRenderer {
    constructor() {
        super(...arguments);
        this.title = 'Default';
    }
    canRender(col, mode) {
        return col instanceof BooleanColumn && mode === ERenderMode.CELL;
    }
    create(col) {
        const r = super.create(col);
        r.template = `<div class="${cssClass('center')}"> </div>`;
        return r;
    }
}
