import type { ITypedDump, ITypeFactory } from './interfaces';
import type { IColorMappingFunction } from './INumberColumn';
export declare class SequentialColorFunction implements IColorMappingFunction {
    readonly name: string;
    static readonly FUNCTIONS: {
        [key: string]: (v: number) => string;
    };
    readonly apply: (v: number) => string;
    constructor(name: string);
    toJSON(): string;
    clone(): this;
    eq(other: IColorMappingFunction): boolean;
}
export declare class DivergentColorFunction implements IColorMappingFunction {
    readonly name: string;
    static readonly FUNCTIONS: {
        [key: string]: (v: number) => string;
    };
    readonly apply: (v: number) => string;
    constructor(name: string);
    toJSON(): string;
    clone(): this;
    eq(other: IColorMappingFunction): boolean;
}
export declare class UnknownColorFunction implements IColorMappingFunction {
    readonly apply: (v: number) => string;
    constructor(apply: (v: number) => string);
    toJSON(): string;
    clone(): this;
    eq(other: IColorMappingFunction): boolean;
}
export declare class SolidColorFunction implements IColorMappingFunction {
    readonly color: string;
    constructor(color: string);
    apply(): string;
    toJSON(): string;
    clone(): this;
    eq(other: IColorMappingFunction): boolean;
}
export declare class QuantizedColorFunction implements IColorMappingFunction {
    readonly base: IColorMappingFunction;
    readonly steps: number;
    constructor(dump: ITypedDump, factory: ITypeFactory);
    constructor(base: IColorMappingFunction, steps: number);
    apply(v: number): string;
    toJSON(): {
        type: string;
        base: string | ITypedDump;
        steps: number;
    };
    clone(): QuantizedColorFunction;
    eq(other: IColorMappingFunction): boolean;
}
export declare class CustomColorMappingFunction implements IColorMappingFunction {
    private readonly scale;
    readonly entries: {
        value: number;
        color: string;
    }[];
    constructor(dump: ITypedDump);
    constructor(entries: {
        value: number;
        color: string;
    }[]);
    apply(v: number): string;
    toJSON(): {
        type: string;
        entries: {
            value: number;
            color: string;
        }[];
    };
    clone(): CustomColorMappingFunction;
    eq(other: IColorMappingFunction): boolean;
}
export declare function colorMappingFunctions(): any;
export declare const DEFAULT_COLOR_FUNCTION: SolidColorFunction;
//# sourceMappingURL=ColorMappingFunction.d.ts.map