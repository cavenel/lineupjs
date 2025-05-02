import { Column, RankColumn } from '../model';
import type { ICellRendererFactory, ISummaryRenderer, IGroupCellRenderer, ICellRenderer } from './interfaces';
export default class RankCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column): col is RankColumn;
    create(col: Column): ICellRenderer;
    createGroup(col: Column): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=RankCellRenderer.d.ts.map