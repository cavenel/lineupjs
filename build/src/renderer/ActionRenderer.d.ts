import { ActionColumn, Column } from '../model';
import { type IRenderContext, ERenderMode, type ICellRendererFactory, type ICellRenderer, type IGroupCellRenderer, type ISummaryRenderer } from './interfaces';
export default class ActionRenderer implements ICellRendererFactory {
    readonly title = "Default";
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: ActionColumn, context: IRenderContext): ICellRenderer;
    createGroup(col: ActionColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=ActionRenderer.d.ts.map