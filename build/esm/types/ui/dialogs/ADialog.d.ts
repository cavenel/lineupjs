import type DialogManager from './DialogManager';
import type { IRankingHeaderContext } from '../interfaces';
import type { ILivePreviewOptions } from '../../config';
export interface IDialogOptions {
    title: string;
    livePreview: boolean | keyof ILivePreviewOptions;
    popup: boolean;
    eventsEnabled?: boolean;
    toggleDialog: boolean;
    cancelSubDialogs?: boolean;
    autoClose?: boolean;
}
export interface IDialogContext {
    attachment: HTMLElement;
    level: number;
    manager: DialogManager;
    idPrefix: string;
    sanitize(v: string, dontSanitize?: boolean): string;
}
export declare function dialogContext(ctx: IRankingHeaderContext, level: number, attachment: HTMLElement | MouseEvent): IDialogContext;
declare abstract class ADialog {
    protected readonly dialog: Readonly<IDialogContext>;
    private readonly options;
    readonly node: HTMLFormElement;
    protected floatingUiCleanup: (() => void) | null;
    constructor(dialog: Readonly<IDialogContext>, options?: Partial<IDialogOptions>);
    get autoClose(): boolean;
    get attachment(): HTMLElement;
    get level(): number;
    protected abstract build(node: HTMLElement): boolean | void;
    protected showLivePreviews(): boolean;
    protected enableLivePreviews(selector: string | (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[]): void;
    equals(that: ADialog): boolean;
    protected appendDialogButtons(): void;
    open(): void;
    protected triggerSubmit(): boolean;
    protected find<T extends HTMLElement>(selector: string): T;
    protected findInput(selector: string): HTMLInputElement;
    protected forEach<M extends Element, T>(selector: string, callback: (d: M, i: number) => T): T[];
    protected abstract reset(): void;
    protected abstract submit(): boolean | undefined;
    protected abstract cancel(): void;
    cleanUp(action: 'cancel' | 'confirm' | 'handled'): void;
    protected destroy(action?: 'cancel' | 'confirm'): void;
}
export default ADialog;
//# sourceMappingURL=ADialog.d.ts.map