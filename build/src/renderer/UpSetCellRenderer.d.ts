import { Column, type ISetColumn } from '../model';
import type { ICellRendererFactory, IRenderContext, ISummaryRenderer, IGroupCellRenderer, ICellRenderer } from './interfaces';
export default class UpSetCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column): boolean;
    private static calculateSetPath;
    private static createDOMContext;
    create(col: ISetColumn, context: IRenderContext): ICellRenderer;
    createGroup(col: ISetColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(col: ISetColumn, context: IRenderContext): ISummaryRenderer;
}
//# sourceMappingURL=UpSetCellRenderer.d.ts.map