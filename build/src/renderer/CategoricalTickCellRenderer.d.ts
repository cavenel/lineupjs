import { Column, type ICategoricalColumn } from '../model';
import { ERenderMode, type ICellRenderer, type ICellRendererFactory, type IGroupCellRenderer, type IImposer, type IRenderContext, type ISummaryRenderer } from './interfaces';
export default class CategoricalTickCellRenderer implements ICellRendererFactory {
    private readonly renderValue;
    readonly title: string;
    /**
     * flag to always render the value
     * @type {boolean}
     */
    constructor(renderValue?: boolean);
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: ICategoricalColumn, context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=CategoricalTickCellRenderer.d.ts.map