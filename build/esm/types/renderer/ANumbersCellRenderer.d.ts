import type { IDataRow, INumbersColumn } from '../model';
import type { IRenderContext, IImposer, ICellRenderer, IGroupCellRenderer } from './interfaces';
import { type ISequence } from '../internal';
export declare abstract class ANumbersCellRenderer {
    abstract readonly title: string;
    protected abstract createContext(col: INumbersColumn, context: IRenderContext, imposer?: IImposer): {
        clazz: string;
        templateRow: string;
        update: (row: HTMLElement, data: number[], raw: number[], d: IDataRow, tooltipPrefix?: string) => void;
        render: (ctx: CanvasRenderingContext2D, data: number[], d: IDataRow) => void;
    };
    static choose(col: INumbersColumn, rows: ISequence<IDataRow>): {
        normalized: number[];
        raw: number[];
        row: IDataRow;
    };
    create(col: INumbersColumn, context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(col: INumbersColumn, context: IRenderContext, imposer?: IImposer): IGroupCellRenderer;
}
//# sourceMappingURL=ANumbersCellRenderer.d.ts.map