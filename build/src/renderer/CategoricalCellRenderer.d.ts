import { type ICategoricalLikeColumn, Column, type ICategoricalColumn } from '../model';
import { type IRenderContext, type ICellRendererFactory, ERenderMode, type ICellRenderer, type IGroupCellRenderer, type ISummaryRenderer } from './interfaces';
export default class CategoricalCellRenderer implements ICellRendererFactory {
    readonly title: string;
    readonly groupTitle: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: ICategoricalColumn, context: IRenderContext): ICellRenderer;
    createGroup(col: ICategoricalLikeColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(col: ICategoricalLikeColumn, context: IRenderContext, interactive: boolean): ISummaryRenderer;
}
//# sourceMappingURL=CategoricalCellRenderer.d.ts.map