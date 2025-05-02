import type { ICellRendererFactory, IGroupCellRenderer, ISummaryRenderer } from './interfaces';
export default class LoadingCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(): boolean;
    create(): {
        template: string;
        update: () => void;
    };
    createGroup(): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=LoadingCellRenderer.d.ts.map