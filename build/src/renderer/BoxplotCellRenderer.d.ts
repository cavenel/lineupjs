import { type IBoxPlotColumn, type INumberColumn, Column } from '../model';
import { type IRenderContext, ERenderMode, type ICellRendererFactory, type IImposer, type ICellRenderer, type IGroupCellRenderer, type ISummaryRenderer } from './interfaces';
export default class BoxplotCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: IBoxPlotColumn, context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(col: INumberColumn, context: IRenderContext, imposer?: IImposer): IGroupCellRenderer;
    createSummary(col: INumberColumn, context: IRenderContext, _interactive: boolean, imposer?: IImposer): ISummaryRenderer;
}
//# sourceMappingURL=BoxplotCellRenderer.d.ts.map