import { type IMapColumn, Column } from '../model';
import type { IRenderContext, ICellRendererFactory, ISummaryRenderer, IGroupCellRenderer, ICellRenderer } from './interfaces';
export default class TableCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column): col is IMapColumn<any>;
    create(col: IMapColumn<any>): ICellRenderer;
    private static template;
    private createFixed;
    createGroup(col: IMapColumn<any>, context: IRenderContext): IGroupCellRenderer;
    private createFixedGroup;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=TableCellRenderer.d.ts.map