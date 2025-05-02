import { Column, type ICategoricalColumn } from '../model';
import { type IRenderContext, ERenderMode, type ICellRendererFactory, type ICellRenderer, type IGroupCellRenderer, type ISummaryRenderer } from './interfaces';
export default class CategoricalStackedDistributionlCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(): ICellRenderer;
    createGroup(col: ICategoricalColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(col: ICategoricalColumn, context: IRenderContext, interactive: boolean): ISummaryRenderer;
}
//# sourceMappingURL=CategoricalStackedDistributionlCellRenderer.d.ts.map