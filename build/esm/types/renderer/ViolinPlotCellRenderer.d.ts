import { Column, type INumberColumn } from '../model';
import { ERenderMode, type ICellRenderer, type ICellRendererFactory, type IGroupCellRenderer, type IImposer, type IRenderContext, type ISummaryRenderer } from './interfaces';
export default class ViolinPlotCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(): ICellRenderer;
    createGroup(col: INumberColumn, context: IRenderContext, imposer?: IImposer): IGroupCellRenderer;
    createSummary(col: INumberColumn, context: IRenderContext, _interactive: boolean, imposer?: IImposer): ISummaryRenderer;
}
//# sourceMappingURL=ViolinPlotCellRenderer.d.ts.map