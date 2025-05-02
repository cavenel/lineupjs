import ADialog, { type IDialogContext } from './ADialog';
import { type IMapAbleColumn } from '../../model';
import type { IRankingHeaderContext } from '../interfaces';
export default class ColorMappingDialog extends ADialog {
    private readonly column;
    private readonly ctx;
    private readonly before;
    private readonly id;
    constructor(column: IMapAbleColumn, dialog: IDialogContext, ctx: IRankingHeaderContext);
    private createTemplate;
    private applyColor;
    protected build(node: HTMLElement): void;
    private render;
    protected reset(): void;
    protected submit(): boolean;
    protected cancel(): void;
    private updateGradients;
}
//# sourceMappingURL=ColorMappingDialog.d.ts.map