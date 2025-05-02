import { type IColumnCategory, type IColumnDesc } from '../../model';
import type { IRankingHeaderContext } from '../interfaces';
import { type ISearchBoxOptions } from './SearchBox';
export interface IColumnWrapper {
    desc: IColumnDesc;
    category: IColumnCategory;
    id: string;
    text: string;
}
export interface ISidePanelOptions extends Partial<ISearchBoxOptions<IColumnWrapper>> {
    additionalDescs: IColumnDesc[];
    chooser: boolean;
    hierarchy: boolean;
    collapseable: boolean | 'collapsed';
}
export default class SidePanel {
    private ctx;
    private readonly options;
    readonly node: HTMLElement;
    private readonly search;
    private chooser;
    private readonly descs;
    private data;
    private readonly rankings;
    constructor(ctx: IRankingHeaderContext, document: Document, options?: Partial<ISidePanelOptions>);
    private init;
    private initChooser;
    private get active();
    private changeDataStorage;
    private createEntry;
    get collapsed(): boolean;
    set collapsed(value: boolean);
    private makeActive;
    private updateRanking;
    update(ctx: IRankingHeaderContext): void;
    private updateStats;
    destroy(): void;
    private static groupByType;
    private updateChooser;
}
//# sourceMappingURL=SidePanel.d.ts.map