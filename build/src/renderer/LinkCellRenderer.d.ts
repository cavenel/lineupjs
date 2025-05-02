import { LinkColumn, Column, type ILink } from '../model';
import { type IRenderContext, ERenderMode, type ICellRendererFactory, type ISummaryRenderer, type IGroupCellRenderer, type ICellRenderer } from './interfaces';
export default class LinkCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: LinkColumn, context: IRenderContext): ICellRenderer;
    private static exampleText;
    createGroup(col: LinkColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
export declare function updateLinkList(n: HTMLElement, links: ILink[], more: boolean): void;
//# sourceMappingURL=LinkCellRenderer.d.ts.map