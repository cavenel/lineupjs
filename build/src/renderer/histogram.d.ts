import { type IBin } from '../internal';
export declare function histogramTemplate(guessedBins: number): string;
export interface IHistogramLike<T> {
    readonly maxBin: number;
    readonly hist: ReadonlyArray<IBin<T>>;
}
export interface IFilterContext<T> {
    percent(v: T): number;
    unpercent(p: number): T;
    format(v: T): string;
    formatRaw(v: T): string;
    parseRaw(v: string): T;
    setFilter(filterMissing: boolean, min: T, max: T): void;
    edit(value: T, attachment: HTMLElement, type: 'min' | 'max', otherValue: T): Promise<T>;
    domain: [T, T];
}
export declare function filteredHistTemplate<T>(c: IFilterContext<T>, f: IFilterInfo<T>): string;
export declare function initFilter<T>(node: HTMLElement, context: IFilterContext<T>): (missing: number, f: IFilterInfo<T>) => void;
//# sourceMappingURL=histogram.d.ts.map