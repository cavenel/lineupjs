import { Column, type INumberColumn } from '../model';
import { ERenderMode, type ICellRendererFactory, type IImposer, type IRenderContext, type ICellRenderer, type IGroupCellRenderer, type ISummaryRenderer } from './interfaces';
export default class DotCellRenderer implements ICellRendererFactory {
    private readonly renderValue;
    readonly title: string;
    readonly groupTitle: string;
    /**
     * flag to always render the value for single dots
     * @type {boolean}
     */
    constructor(renderValue?: boolean);
    canRender(col: Column, mode: ERenderMode): boolean;
    private static getCanvasRenderer;
    private static getDOMRenderer;
    private static getSingleDOMRenderer;
    create(col: INumberColumn, context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(col: INumberColumn, context: IRenderContext, imposer?: IImposer): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=DotCellRenderer.d.ts.map