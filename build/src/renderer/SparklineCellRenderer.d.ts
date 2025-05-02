import { Column, type INumbersColumn } from '../model';
import { type IRenderContext, ERenderMode, type ICellRendererFactory, type ISummaryRenderer, type IGroupCellRenderer, type ICellRenderer } from './interfaces';
export default class SparklineCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: INumbersColumn): ICellRenderer;
    createGroup(col: INumbersColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=SparklineCellRenderer.d.ts.map