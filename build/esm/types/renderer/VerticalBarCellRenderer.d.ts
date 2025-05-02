import { Column, type IDataRow, type INumbersColumn } from '../model';
import { ANumbersCellRenderer } from './ANumbersCellRenderer';
import { type IRenderContext, ERenderMode, type ICellRendererFactory, type IImposer, type ISummaryRenderer } from './interfaces';
export default class VerticalBarCellRenderer extends ANumbersCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    private static compute;
    protected createContext(col: INumbersColumn, context: IRenderContext, imposer?: IImposer): {
        clazz: string;
        templateRow: string;
        update: (row: HTMLElement, data: number[], raw: number[], item: IDataRow, tooltipPrefix?: string) => void;
        render: (ctx: CanvasRenderingContext2D, data: number[], item: IDataRow) => void;
    };
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=VerticalBarCellRenderer.d.ts.map