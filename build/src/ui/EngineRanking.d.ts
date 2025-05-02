import { ACellTableSection, GridStyleManager, type ICellRenderContext, type IExceptionContext, type ITableSection, type IAsyncUpdate } from 'lineupengine';
import type { ILineUpFlags } from '../config';
import { type IEventHandler, type IEventListener } from '../internal';
import { Column, type IGroupData, type IGroupItem, type IOrderedGroup, Ranking } from '../model';
import type { IImposer, IRenderContext } from '../renderer';
import type { IRankingHeaderContextContainer } from './interfaces';
import RenderColumn, { type IRenderers } from './RenderColumn';
export interface IEngineRankingContext extends IRankingHeaderContextContainer, IRenderContext {
    createRenderer(c: Column, imposer?: IImposer): IRenderers;
}
export interface IEngineRankingOptions {
    animation: boolean;
    levelOfDetail: (rowIndex: number) => 'high' | 'low';
    customRowUpdate: (row: HTMLElement, rowIndex: number) => void;
    flags: ILineUpFlags;
    selectionActivateFilter: boolean | string;
}
/**
 * emitted when the width of the ranking changed
 * @asMemberOf EngineRanking
 * @event
 */
export declare function widthChanged(): void;
/**
 * emitted when the data of the ranking needs to be updated
 * @asMemberOf EngineRanking
 * @event
 */
export declare function updateData(): void;
/**
 * emitted when the table has be recreated
 * @asMemberOf EngineRanking
 * @event
 */
export declare function recreate(): void;
/**
 * emitted when the highlight changes
 * @asMemberOf EngineRanking
 * @param dataIndex the highlighted data index or -1 for none
 * @event
 */
export declare function highlightChanged(dataIndex: number): void;
export default class EngineRanking extends ACellTableSection<RenderColumn> implements ITableSection, IEventHandler {
    readonly ranking: Ranking;
    private readonly ctx;
    static readonly EVENT_WIDTH_CHANGED = "widthChanged";
    static readonly EVENT_UPDATE_DATA = "updateData";
    static readonly EVENT_RECREATE = "recreate";
    static readonly EVENT_HIGHLIGHT_CHANGED = "highlightChanged";
    private _context;
    private readonly loadingCanvas;
    private readonly renderCtx;
    private data;
    private readonly selection;
    private highlight;
    private readonly canvasPool;
    private currentCanvasShift;
    private currentCanvasWidth;
    private readonly events;
    private roptions;
    private readonly delayedUpdate;
    private readonly delayedUpdateAll;
    private readonly delayedUpdateColumnWidths;
    private readonly columns;
    private readonly canvasMouseHandler;
    private readonly highlightHandler;
    constructor(ranking: Ranking, header: HTMLElement, body: HTMLElement, tableId: string, style: GridStyleManager, ctx: IEngineRankingContext, roptions?: Partial<IEngineRankingOptions>);
    on(type: typeof EngineRanking.EVENT_WIDTH_CHANGED, listener: typeof widthChanged | null): this;
    on(type: typeof EngineRanking.EVENT_UPDATE_DATA, listener: typeof updateData | null): this;
    on(type: typeof EngineRanking.EVENT_RECREATE, listener: typeof recreate | null): this;
    on(type: typeof EngineRanking.EVENT_HIGHLIGHT_CHANGED, listener: typeof highlightChanged | null): this;
    on(type: string | string[], listener: IEventListener | null): this;
    get id(): string;
    protected onVisibilityChanged(visible: boolean): void;
    updateHeaders(): void;
    get currentData(): (IGroupItem | Readonly<IOrderedGroup>)[];
    get context(): ICellRenderContext<RenderColumn>;
    protected createHeader(_document: Document, column: RenderColumn): HTMLElement | IAsyncUpdate<HTMLElement>;
    private updateColumnSummaryFlag;
    protected updateHeader(node: HTMLElement, column: RenderColumn): HTMLElement | IAsyncUpdate<HTMLElement>;
    protected createCell(_document: Document, index: number, column: RenderColumn): HTMLElement | IAsyncUpdate<HTMLElement>;
    private createCellHandled;
    protected updateCell(node: HTMLElement, index: number, column: RenderColumn): HTMLElement | IAsyncUpdate<HTMLElement>;
    private selectCanvas;
    private rowFlags;
    private visibleRenderedWidth;
    private pushLazyRedraw;
    private renderRow;
    protected updateCanvasCell(canvas: HTMLCanvasElement, node: HTMLElement, index: number, column: RenderColumn, x: number): void;
    private reindex;
    updateAll(): void;
    updateBody(): void;
    updateHeaderOf(col: Column): false | RenderColumn;
    protected createRow(node: HTMLElement, rowIndex: number): void;
    protected updateRow(node: HTMLElement, rowIndex: number, hoverLod?: 'high' | 'low'): void;
    private updateCanvasBody;
    private toRowMeta;
    private updateCanvasRule;
    protected updateShifts(top: number, left: number): void;
    private recycleCanvas;
    enableHighlightListening(enable: boolean): void;
    private updateHoveredRow;
    protected forEachRow(callback: (row: HTMLElement, rowIndex: number) => void, inplace?: boolean): void;
    updateSelection(selectedDataIndices: {
        has(i: number): boolean;
    }): void;
    updateColumnWidths(): void;
    private computeShiftedIndex;
    private updateColumn;
    private updateCellImpl;
    private initCellClasses;
    destroy(): void;
    groupData(): (IGroupItem | IGroupData)[];
    render(data: (IGroupItem | IGroupData)[], rowContext: IExceptionContext): void;
    setHighlight(dataIndex: number): boolean;
    findNearest(dataIndices: number[]): number;
    scrollIntoView(dataIndex: number): boolean;
    getHighlight(): number;
    private createCol;
    private static isCanvasRenderedRow;
    private static disableListener;
}
//# sourceMappingURL=EngineRanking.d.ts.map