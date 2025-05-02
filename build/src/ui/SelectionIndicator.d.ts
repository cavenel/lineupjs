import { type IGroupData, type IGroupItem } from '../model';
import type { IExceptionContext } from 'lineupengine';
export default class SelectionIndicator {
    private readonly scrollerNode;
    readonly node: HTMLElement;
    readonly canvas: HTMLCanvasElement;
    private selection;
    private data;
    private rowContext;
    private blocks;
    constructor(scrollerNode: HTMLElement);
    private toSelectionBlocks;
    updateData(data: readonly (IGroupItem | IGroupData)[], rowContext: IExceptionContext): void;
    updateSelection(selection: Set<number>): void;
    private onClick;
    private render;
}
//# sourceMappingURL=SelectionIndicator.d.ts.map