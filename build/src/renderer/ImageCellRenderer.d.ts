import { Column, LinkColumn } from '../model';
import { ERenderMode, type ICellRendererFactory, type ICellRenderer, type IGroupCellRenderer, type ISummaryRenderer } from './interfaces';
export default class ImageCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: LinkColumn): ICellRenderer;
    createGroup(): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=ImageCellRenderer.d.ts.map