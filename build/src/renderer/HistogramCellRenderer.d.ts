import { Column, type INumberColumn, type INumbersColumn } from '../model';
import { type IRenderContext, ERenderMode, type ICellRendererFactory, type IImposer, type ICellRenderer, type IGroupCellRenderer, type ISummaryRenderer } from './interfaces';
export default class HistogramCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: INumbersColumn, _context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(col: INumberColumn, context: IRenderContext, imposer?: IImposer): IGroupCellRenderer;
    createSummary(col: INumberColumn, context: IRenderContext, interactive: boolean, imposer?: IImposer): ISummaryRenderer;
}
//# sourceMappingURL=HistogramCellRenderer.d.ts.map