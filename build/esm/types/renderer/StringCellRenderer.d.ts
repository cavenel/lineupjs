import { StringColumn, Column } from '../model';
import type { IRenderContext, ICellRendererFactory, ISummaryRenderer, IGroupCellRenderer, ICellRenderer } from './interfaces';
/**
 * renders a string with additional alignment behavior
 * one instance factory shared among strings
 */
export default class StringCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column): boolean;
    create(col: StringColumn, context: IRenderContext): ICellRenderer;
    createGroup(col: StringColumn, context: IRenderContext): IGroupCellRenderer;
    private static interactiveSummary;
    createSummary(col: StringColumn, context: IRenderContext, interactive: boolean): ISummaryRenderer;
}
//# sourceMappingURL=StringCellRenderer.d.ts.map