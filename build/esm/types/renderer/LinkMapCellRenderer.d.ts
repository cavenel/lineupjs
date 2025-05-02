import { LinkMapColumn, Column } from '../model';
import { type IRenderContext, ERenderMode, type ICellRendererFactory, type ISummaryRenderer, type IGroupCellRenderer, type ICellRenderer } from './interfaces';
export default class LinkMapCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: LinkMapColumn, context: IRenderContext): ICellRenderer;
    private static example;
    createGroup(col: LinkMapColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=LinkMapCellRenderer.d.ts.map