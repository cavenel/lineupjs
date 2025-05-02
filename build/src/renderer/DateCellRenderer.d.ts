import { Column, DateColumn } from '../model';
import type { IRenderContext, ICellRendererFactory, IGroupCellRenderer, ISummaryRenderer, ICellRenderer } from './interfaces';
export default class DateCellRenderer implements ICellRendererFactory {
    title: string;
    groupTitle: string;
    summaryTitle: string;
    canRender(col: Column): boolean;
    create(col: DateColumn): ICellRenderer;
    createGroup(col: DateColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=DateCellRenderer.d.ts.map