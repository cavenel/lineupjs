import { Column } from '../model';
import { DefaultCellRenderer } from './DefaultCellRenderer';
import { ERenderMode, type ICellRenderer } from './interfaces';
export default class BooleanCellRenderer extends DefaultCellRenderer {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: Column): ICellRenderer;
}
//# sourceMappingURL=BooleanCellRenderer.d.ts.map