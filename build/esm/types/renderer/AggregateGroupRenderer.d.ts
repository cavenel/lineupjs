import { Column, AggregateGroupColumn } from '../model';
import type { IRenderContext, ICellRendererFactory, ICellRenderer, IGroupCellRenderer, ISummaryRenderer } from './interfaces';
export default class AggregateGroupRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column): boolean;
    create(col: AggregateGroupColumn, context: IRenderContext): ICellRenderer;
    createGroup(col: AggregateGroupColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(col: AggregateGroupColumn, context: IRenderContext): ISummaryRenderer;
}
//# sourceMappingURL=AggregateGroupRenderer.d.ts.map