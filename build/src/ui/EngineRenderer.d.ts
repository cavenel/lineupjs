import { GridStyleManager } from 'lineupengine';
import type { ILineUpOptions } from '../config';
import { AEventDispatcher, type IEventListener } from '../internal';
import { DataProvider } from '../provider';
import type { IRenderContext } from '../renderer';
import EngineRanking, { type IEngineRankingContext } from './EngineRanking';
import { type IRankingHeaderContext, type IRankingHeaderContextContainer } from './interfaces';
import type { ADialog } from './dialogs';
import SelectionIndicator from './SelectionIndicator';
/**
 * emitted when the highlight changes
 * @asMemberOf EngineRenderer
 * @param dataIndex the highlighted data index or -1 for none
 * @event
 */
export declare function highlightChanged(dataIndex: number): void;
/**
 * emitted a dialog is opened
 * @asMemberOf EngineRenderer
 * @param dialog the opened dialog
 * @event
 */
export declare function dialogOpenedER(dialog: ADialog): void;
/**
 * emitted a dialog is closed
 * @asMemberOf EngineRenderer
 * @param dialog the closed dialog
 * @param action the action how the dialog was closed
 * @event
 */
export declare function dialogClosedER(dialog: ADialog, action: 'cancel' | 'confirm'): void;
export default class EngineRenderer extends AEventDispatcher {
    protected data: DataProvider;
    static readonly EVENT_HIGHLIGHT_CHANGED = "highlightChanged";
    static readonly EVENT_DIALOG_OPENED = "dialogOpened";
    static readonly EVENT_DIALOG_CLOSED = "dialogClosed";
    protected readonly options: Readonly<ILineUpOptions>;
    readonly node: HTMLElement;
    private readonly resizeObserver;
    private readonly table;
    private readonly rankings;
    private readonly slopeGraphs;
    readonly ctx: IRankingHeaderContextContainer & IRenderContext & IEngineRankingContext;
    private readonly updateAbles;
    private zoomFactor;
    readonly idPrefix: any;
    private enabledHighlightListening;
    readonly selectionIndicator: SelectionIndicator;
    constructor(data: DataProvider, parent: HTMLElement, options: Readonly<ILineUpOptions>);
    get style(): GridStyleManager;
    zoomOut(): void;
    zoomIn(): void;
    private updateZoomFactor;
    pushUpdateAble(updateAble: (ctx: IRankingHeaderContext) => void): void;
    protected createEventList(): string[];
    on(type: typeof EngineRenderer.EVENT_HIGHLIGHT_CHANGED, listener: typeof highlightChanged | null): this;
    on(type: typeof EngineRenderer.EVENT_DIALOG_OPENED, listener: typeof dialogOpenedER | null): this;
    on(type: typeof EngineRenderer.EVENT_DIALOG_CLOSED, listener: typeof dialogClosedER | null): this;
    on(type: string | string[], listener: IEventListener | null): this;
    setDataProvider(data: DataProvider): void;
    private takeDownProvider;
    private initProvider;
    private updateSelection;
    private updateHist;
    private addRanking;
    private updateRotatedHeaderState;
    private removeRanking;
    update(rankings?: EngineRanking[]): void;
    private updateUpdateAbles;
    private updateSlopeGraphs;
    setHighlight(dataIndex: number, scrollIntoView: boolean): boolean;
    setHighlightToNearest(dataIndices: number[], scrollIntoView: boolean): boolean;
    getHighlight(): number;
    enableHighlightListening(enable: boolean): void;
    destroy(): void;
}
//# sourceMappingURL=EngineRenderer.d.ts.map