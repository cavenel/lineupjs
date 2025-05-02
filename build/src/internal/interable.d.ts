export interface IForEachAble<T> extends Iterable<T> {
    forEach(callback: (v: T, i: number) => void): void;
}
/**
 * generalized version of Array function similar to Scala ISeq
 */
export interface ISequence<T> extends IForEachAble<T> {
    readonly length: number;
    filter(callback: (v: T, i: number) => boolean): ISequence<T>;
    map<U>(callback: (v: T, i: number) => U): ISequence<U>;
    some(callback: (v: T, i: number) => boolean): boolean;
    every(callback: (v: T, i: number) => boolean): boolean;
    reduce<U>(callback: (acc: U, v: T, i: number) => U, initial: U): U;
}
export declare function concatSeq<T>(seq1: ISequence<T>, seq2: ISequence<T>, ...seqs: ISequence<T>[]): ISequence<T>;
//# sourceMappingURL=interable.d.ts.map