import { type ILineUpOptions } from '../config';
import type { DataProvider } from '../provider';
import { ALineUp } from './ALineUp';
export default class LineUp extends ALineUp {
    static readonly EVENT_SELECTION_CHANGED = "selectionChanged";
    static readonly EVENT_DIALOG_OPENED = "dialogOpened";
    static readonly EVENT_DIALOG_CLOSED = "dialogClosed";
    static readonly EVENT_HIGHLIGHT_CHANGED = "highlightChanged";
    private readonly renderer;
    private readonly panel;
    private readonly options;
    constructor(node: HTMLElement, data: DataProvider, options?: Partial<ILineUpOptions>);
    destroy(): void;
    update(): void;
    setDataProvider(data: DataProvider, dump?: any): void;
    setHighlight(dataIndex: number, scrollIntoView?: boolean): boolean;
    getHighlight(): number;
    protected enableHighlightListening(enable: boolean): void;
}
//# sourceMappingURL=LineUp.d.ts.map