import { Column, SelectionColumn } from '../model';
import type { IRenderContext, ICellRendererFactory, ISummaryRenderer, IGroupCellRenderer, ICellRenderer } from './interfaces';
export default class SelectionRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column): col is SelectionColumn;
    create(col: SelectionColumn, ctx: IRenderContext): ICellRenderer;
    createGroup(col: SelectionColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(col: SelectionColumn, context: IRenderContext): ISummaryRenderer;
}
//# sourceMappingURL=SelectionRenderer.d.ts.map