import ADialog, { type IDialogContext, type IDialogOptions } from './ADialog';
declare abstract class APopup extends ADialog {
    constructor(dialog: Readonly<IDialogContext>, options?: Partial<IDialogOptions>);
    protected submit(): boolean;
    protected reset(): void;
    protected cancel(): void;
}
export default APopup;
//# sourceMappingURL=APopup.d.ts.map