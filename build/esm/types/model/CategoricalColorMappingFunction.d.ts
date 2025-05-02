import type { ICategory, ICategoricalColorMappingFunction } from './ICategoricalColumn';
export declare const DEFAULT_CATEGORICAL_COLOR_FUNCTION: ICategoricalColorMappingFunction;
export declare class ReplacementColorMappingFunction implements ICategoricalColorMappingFunction {
    readonly map: ReadonlyMap<string, string>;
    constructor(map: Map<ICategory | string, string>);
    apply(v: ICategory): string;
    toJSON(): {
        type: string;
        map: any;
    };
    clone(): ReplacementColorMappingFunction;
    eq(other: ICategoricalColorMappingFunction): boolean;
    static restore(dump: any, categories: ICategory[]): ReplacementColorMappingFunction;
}
//# sourceMappingURL=CategoricalColorMappingFunction.d.ts.map