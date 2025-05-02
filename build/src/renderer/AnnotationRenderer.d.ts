import { AnnotateColumn, Column } from '../model';
import StringCellRenderer from './StringCellRenderer';
import type { ICellRenderer } from './interfaces';
export default class AnnotationRenderer extends StringCellRenderer {
    readonly title: string;
    canRender(col: Column): boolean;
    create(col: AnnotateColumn): ICellRenderer;
}
//# sourceMappingURL=AnnotationRenderer.d.ts.map