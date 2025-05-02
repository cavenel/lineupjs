import { Column, type INumberColumn } from '../model';
import { ERenderMode, type ICellRenderer, type ICellRendererFactory, type IGroupCellRenderer, type IImposer, type IRenderContext, type ISummaryRenderer } from './interfaces';
export default class TickCellRenderer implements ICellRendererFactory {
    private readonly renderValue;
    readonly title: string;
    readonly groupTitle: string;
    /**
     * flag to always render the value
     * @type {boolean}
     */
    constructor(renderValue?: boolean);
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: INumberColumn, context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=TickCellRenderer.d.ts.map