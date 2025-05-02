import type { ITypedDump } from './interfaces';
import type { IMappingFunction } from './INumberColumn';
/**
 * interface of a d3 scale
 */
export interface IScale {
    (v: number): number;
    invert(r: number): number;
    domain(): number[];
    domain(domain: number[]): this;
    range(): number[];
    range(range: number[]): this;
}
/**
 * a mapping function based on a d3 scale (linear, sqrt, log)
 */
export declare class ScaleMappingFunction implements IMappingFunction {
    private s;
    private readonly type;
    constructor();
    constructor(dump: ITypedDump);
    constructor(domain: number[], type: string, range: number[]);
    get domain(): number[];
    set domain(domain: number[]);
    get range(): number[];
    set range(range: number[]);
    getRange(format: (v: number) => string): [string, string];
    apply(v: number): number;
    invert(r: number): number;
    get scaleType(): string;
    toJSON(): {
        type: string;
        domain: number[];
        range: number[];
    };
    eq(other: IMappingFunction): boolean;
    clone(): ScaleMappingFunction;
}
export interface IScriptMappingFunctionContext {
    value_min: number;
    value_max: number;
    value_range: number;
    value_domain: number[];
    linear(v: number, min: number, max: number): number;
}
export interface IScriptMappingFunctionType {
    (this: IScriptMappingFunctionContext, value: number): number;
}
/**
 * a mapping function based on a custom user function using 'value' as the current value
 */
export declare class ScriptMappingFunction implements IMappingFunction {
    private readonly f;
    domain: number[];
    readonly code: string;
    constructor();
    constructor(dump: ITypedDump);
    constructor(domain: number[], code?: string | IScriptMappingFunctionType);
    getRange(): [string, string];
    apply(v: number): number;
    toJSON(): {
        type: string;
        code: string;
        domain: number[];
    };
    eq(other: IMappingFunction): boolean;
    clone(): ScriptMappingFunction;
}
export declare function mappingFunctions(): {
    script: typeof ScriptMappingFunction;
    linear: typeof ScaleMappingFunction;
    log: typeof ScaleMappingFunction;
    'pow1.1': typeof ScaleMappingFunction;
    pow2: typeof ScaleMappingFunction;
    pow3: typeof ScaleMappingFunction;
};
//# sourceMappingURL=MappingFunction.d.ts.map