import { Column, type IDataRow, type INumberColumn } from '../model';
import { type IRenderContext, ERenderMode, type ICellRendererFactory, type IImposer, type ICellRenderer, type IGroupCellRenderer, type ISummaryRenderer } from './interfaces';
export declare function toHeatMapColor(v: number | null, row: IDataRow, col: INumberColumn, imposer?: IImposer): string;
export default class BrightnessCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: INumberColumn, context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=BrightnessCellRenderer.d.ts.map