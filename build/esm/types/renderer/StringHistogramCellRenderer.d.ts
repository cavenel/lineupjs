import { StringColumn } from '../model';
import type { IGroupCellRenderer, IRenderContext, ISummaryRenderer } from './interfaces';
import StringCellRenderer from './StringCellRenderer';
/**
 * renders a string with additional alignment behavior
 * one instance factory shared among strings
 */
export default class StringHistogramCellRenderer extends StringCellRenderer {
    readonly title: string;
    createGroup(col: StringColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(col: StringColumn, context: IRenderContext, interactive: boolean): ISummaryRenderer;
}
//# sourceMappingURL=StringHistogramCellRenderer.d.ts.map