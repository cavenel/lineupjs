import { Column, type ICategoricalsColumn } from '../model';
import type { ICellRendererFactory, IRenderContext, ICellRenderer, IGroupCellRenderer, ISummaryRenderer } from './interfaces';
export default class CategoricalHeatmapCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column): boolean;
    private createContext;
    create(col: ICategoricalsColumn, context: IRenderContext): ICellRenderer;
    createGroup(col: ICategoricalsColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(col: ICategoricalsColumn, context: IRenderContext): ISummaryRenderer;
}
//# sourceMappingURL=CategoricalHeatmapCellRenderer.d.ts.map