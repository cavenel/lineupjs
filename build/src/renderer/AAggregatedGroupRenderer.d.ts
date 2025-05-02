import type { ISequence } from '../internal';
import type { Column, IDataRow } from '../model';
import type { ERenderMode, ICellRenderer, ICellRendererFactory, IGroupCellRenderer, IImposer, IRenderContext, ISummaryRenderer } from './interfaces';
/**
 * helper class that renders a group renderer as a selected (e.g. median) single item
 */
export declare abstract class AAggregatedGroupRenderer<T extends Column> implements ICellRendererFactory {
    abstract readonly title: string;
    abstract canRender(col: Column, mode: ERenderMode): boolean;
    abstract create(col: T, context: IRenderContext, imposer?: IImposer): ICellRenderer;
    protected abstract aggregatedIndex(rows: ISequence<IDataRow>, col: T): {
        row: IDataRow;
        index: number;
    };
    createGroup(col: T, context: IRenderContext, imposer?: IImposer): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
export default AAggregatedGroupRenderer;
//# sourceMappingURL=AAggregatedGroupRenderer.d.ts.map