import { Column, type IMapColumn, type IMapAbleColumn, type INumberColumn } from '../model';
import { type ICellRendererFactory, type IImposer, type IRenderContext, ERenderMode, type ISummaryRenderer, type IGroupCellRenderer, type ICellRenderer } from './interfaces';
export default class MapBarCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: IMapColumn<number> & INumberColumn, _context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(): IGroupCellRenderer;
    createSummary(col: IMapColumn<number> & IMapAbleColumn): ISummaryRenderer;
}
export declare function renderTable<E extends {
    key: string;
}>(node: HTMLElement, arr: readonly E[], renderValue: (v: HTMLElement, entry: E) => void): void;
//# sourceMappingURL=MapBarCellRenderer.d.ts.map