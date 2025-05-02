import { Column, type INumberColumn } from '../model';
import { type IRenderContext, ERenderMode, type ICellRendererFactory, type IImposer, type ICellRenderer, type IGroupCellRenderer, type ISummaryRenderer } from './interfaces';
export default class CircleCellRenderer implements ICellRendererFactory {
    private readonly renderValue;
    readonly title: string;
    /**
     * flag to always render the value
     * @type {boolean}
     */
    constructor(renderValue?: boolean);
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: INumberColumn, _context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=CircleCellRenderer.d.ts.map