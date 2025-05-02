import type ADialog from './ADialog';
import type Column from '../../model';
import type { ILivePreviewOptions } from '../../config';
import { AEventDispatcher, type IEventListener } from '../../internal';
/**
 * emitted a dialog is opened
 * @asMemberOf DialogManager
 * @param dialog the opened dialog
 * @event
 */
export declare function dialogOpened(dialog: ADialog): void;
/**
 * emitted a dialog is closed
 * @asMemberOf DialogManager
 * @param dialog the closed dialog
 * @param action the action how the dialog was closed
 * @event
 */
export declare function dialogClosed(dialog: ADialog, action: 'cancel' | 'confirm'): void;
export default class DialogManager extends AEventDispatcher {
    static readonly EVENT_DIALOG_OPENED = "dialogOpened";
    static readonly EVENT_DIALOG_CLOSED = "dialogClosed";
    private readonly escKeyListener;
    private readonly openDialogs;
    readonly node: HTMLElement;
    readonly livePreviews: Partial<ILivePreviewOptions>;
    readonly onDialogBackgroundClick: 'cancel' | 'confirm';
    constructor(options: {
        doc: Document;
        livePreviews: Partial<ILivePreviewOptions>;
        onDialogBackgroundClick: 'cancel' | 'confirm';
    });
    protected createEventList(): string[];
    on(type: typeof DialogManager.EVENT_DIALOG_OPENED, listener: typeof dialogOpened | null): this;
    on(type: typeof DialogManager.EVENT_DIALOG_CLOSED, listener: typeof dialogClosed | null): this;
    on(type: string | string[], listener: IEventListener | null): this;
    get maxLevel(): number;
    setHighlight(mask: {
        left: number;
        top: number;
        width: number;
        height: number;
    }): void;
    setHighlightColumn(column: Column): void;
    clearHighlight(): void;
    private removeLast;
    removeAll(): void;
    triggerDialogClosed(dialog: ADialog, action: 'cancel' | 'confirm'): void;
    remove(dialog: ADialog, handled?: boolean): boolean;
    removeAboveLevel(level: number): void;
    removeLike(dialog: ADialog): boolean;
    private setUp;
    private takeDown;
    push(dialog: ADialog): void;
}
//# sourceMappingURL=DialogManager.d.ts.map