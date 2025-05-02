import { Column } from '../model';
import type { ICellRendererFactory, ICellRenderer, IGroupCellRenderer, ISummaryRenderer } from './interfaces';
export default class GroupCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column): boolean;
    create(): ICellRenderer;
    createGroup(): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=GroupCellRenderer.d.ts.map