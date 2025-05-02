import { Column, type ICategoricalLikeColumn, type ISetColumn } from '../model';
import type { ICellRendererFactory, IRenderContext, ICellRenderer, IGroupCellRenderer, ISummaryRenderer } from './interfaces';
export default class SetCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column): boolean;
    private static createDOMContext;
    create(col: ISetColumn, context: IRenderContext): ICellRenderer;
    createGroup(col: ISetColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(col: ICategoricalLikeColumn, context: IRenderContext): ISummaryRenderer;
}
//# sourceMappingURL=SetCellRenderer.d.ts.map