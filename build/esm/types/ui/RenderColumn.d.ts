import { type IColumn, type IAbortAblePromise, type IAsyncUpdate } from 'lineupengine';
import type { Column } from '../model';
import type { ICellRenderer, IGroupCellRenderer } from '../renderer';
import type { ISummaryRenderer, IRenderCallback } from '../renderer';
import type { IRankingContext } from './interfaces';
import type { ILineUpFlags } from '../config';
export interface IRenderers {
    singleId: string;
    single: ICellRenderer;
    groupId: string;
    group: IGroupCellRenderer;
    summaryId: string;
    summary: ISummaryRenderer | null;
    singleTemplate: HTMLElement | null;
    groupTemplate: HTMLElement | null;
    summaryTemplate: HTMLElement | null;
}
export default class RenderColumn implements IColumn {
    readonly c: Column;
    index: number;
    protected ctx: IRankingContext;
    protected readonly flags: ILineUpFlags;
    renderers: IRenderers | null;
    constructor(c: Column, index: number, ctx: IRankingContext, flags: ILineUpFlags);
    get width(): number;
    get id(): string;
    get frozen(): boolean;
    private singleRenderer;
    private groupRenderer;
    private summaryRenderer;
    createHeader(): HTMLElement | IAsyncUpdate<HTMLElement>;
    hasSummaryLine(): boolean;
    updateHeader(node: HTMLElement): HTMLElement | IAsyncUpdate<HTMLElement>;
    createCell(index: number): HTMLElement | IAsyncUpdate<HTMLElement>;
    updateCell(node: HTMLElement, index: number): HTMLElement | IAsyncUpdate<HTMLElement>;
    renderCell(ctx: CanvasRenderingContext2D, index: number): boolean | IAbortAblePromise<IRenderCallback>;
}
//# sourceMappingURL=RenderColumn.d.ts.map