import type { IBuilderAdapter, IChangeDetecter } from './interfaces';
export declare class Adapter {
    private readonly adapter;
    private data;
    private instance;
    private prevRankings;
    private prevColumns;
    private prevHighlight;
    private readonly onSelectionChanged;
    private readonly onHighlightChanged;
    constructor(adapter: IBuilderAdapter);
    private get props();
    componentDidMount(): void;
    private resolveColumnDescs;
    private resolveRankings;
    private buildColumns;
    private buildRankings;
    private buildProvider;
    private updateLineUp;
    private updateProvider;
    componentDidUpdate(changeDetector: IChangeDetecter): void;
    componentWillUnmount(): void;
}
//# sourceMappingURL=lineup.d.ts.map