import type { ILineUpLike } from '../config';
import { AEventDispatcher, type IEventListener } from '../internal';
import type { Column } from '../model';
import { DataProvider, type IDataProviderDump } from '../provider';
import type { ADialog } from './dialogs';
/**
 * emitted when the highlight changes
 * @asMemberOf ALineUp
 * @param dataIndex the highlighted data index or -1 for none
 * @event
 */
export declare function highlightChanged(dataIndex: number): void;
/**
 * emitted when the selection changes
 * @asMemberOf ALineUp
 * @param dataIndices the selected data indices
 * @event
 */
export declare function selectionChanged(dataIndices: number[]): void;
/**
 * emitted a dialog is opened
 * @asMemberOf ALineUp
 * @param dialog the opened dialog
 * @event
 */
export declare function dialogOpened(dialog: ADialog): void;
/**
 * emitted a dialog is closed
 * @asMemberOf ALineUp
 * @param dialog the closed dialog
 * @param action the action how the dialog was closed
 * @event
 */
export declare function dialogClosed(dialog: ADialog, action: 'cancel' | 'confirm'): void;
export declare abstract class ALineUp extends AEventDispatcher implements ILineUpLike {
    readonly node: HTMLElement;
    private _data;
    static readonly EVENT_SELECTION_CHANGED = "selectionChanged";
    static readonly EVENT_DIALOG_OPENED = "dialogOpened";
    static readonly EVENT_DIALOG_CLOSED = "dialogClosed";
    static readonly EVENT_HIGHLIGHT_CHANGED = "highlightChanged";
    private highlightListeners;
    readonly isBrowserSupported: boolean;
    constructor(node: HTMLElement, _data: DataProvider, ignoreIncompatibleBrowser: boolean);
    protected createEventList(): string[];
    on(type: typeof ALineUp.EVENT_HIGHLIGHT_CHANGED, listener: typeof highlightChanged | null): this;
    on(type: typeof ALineUp.EVENT_SELECTION_CHANGED, listener: typeof selectionChanged | null): this;
    on(type: typeof ALineUp.EVENT_DIALOG_OPENED, listener: typeof dialogOpened | null): this;
    on(type: typeof ALineUp.EVENT_DIALOG_CLOSED, listener: typeof dialogClosed | null): this;
    on(type: string | string[], listener: IEventListener | null): this;
    get data(): DataProvider;
    destroy(): void;
    dump(): IDataProviderDump;
    restore(dump: IDataProviderDump): void;
    abstract update(): void;
    setDataProvider(data: DataProvider, dump?: IDataProviderDump): void;
    getSelection(): number[];
    setSelection(dataIndices: number[]): void;
    /**
     * sorts LineUp by he given column
     * @param column callback function finding the column to sort
     * @param ascending
     * @returns {boolean}
     */
    sortBy(column: string | ((col: Column) => boolean), ascending?: boolean): boolean;
    abstract setHighlight(dataIndex: number, scrollIntoView: boolean): boolean;
    abstract getHighlight(): number;
    protected listenersChanged(type: string, enabled: boolean): void;
    protected enableHighlightListening(_enable: boolean): void;
    protected addCopyListener(): void;
}
export default ALineUp;
//# sourceMappingURL=ALineUp.d.ts.map