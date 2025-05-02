import { type IExceptionContext, type ITableSection } from 'lineupengine';
import { type IGroupData, type IGroupItem, Ranking } from '../model';
import { type IRankingHeaderContextContainer, EMode } from './interfaces';
export interface ISlopeGraphOptions {
    mode: EMode;
}
export default class SlopeGraph implements ITableSection {
    readonly header: HTMLElement;
    readonly body: HTMLElement;
    readonly id: string;
    private readonly ctx;
    readonly node: SVGSVGElement;
    private leftSlopes;
    private rightSlopes;
    private readonly pool;
    private scrollListener;
    readonly width: number;
    readonly height = 0;
    private current;
    private chosen;
    private chosenSelectionOnly;
    private _mode;
    constructor(header: HTMLElement, body: HTMLElement, id: string, ctx: IRankingHeaderContextContainer, options?: Partial<ISlopeGraphOptions>);
    init(): void;
    private initHeader;
    get mode(): EMode;
    set mode(value: EMode);
    get hidden(): boolean;
    set hidden(value: boolean);
    hide(): void;
    show(): void;
    destroy(): void;
    rebuild(leftRanking: Ranking, left: (IGroupItem | IGroupData)[], leftContext: IExceptionContext, rightRanking: Ranking, right: (IGroupItem | IGroupData)[], rightContext: IExceptionContext): void;
    private computeSlopes;
    private prepareRightSlopes;
    private revalidate;
    highlight(dataIndex: number): boolean;
    private onScrolledVertically;
    private choose;
    private chooseSelection;
    private updatePath;
    private render;
    private addPath;
    private matchLength;
    updateSelection(selectedDataIndices: Set<number>): void;
}
//# sourceMappingURL=SlopeGraph.d.ts.map