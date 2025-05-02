import { interpolateBlues, interpolateGreens, interpolateGreys, interpolateOranges, interpolatePurples, interpolateReds, interpolateCool, interpolateCubehelixDefault, interpolateWarm, interpolatePlasma, interpolateMagma, interpolateViridis, interpolateInferno, interpolateYlOrRd, interpolateYlOrBr, interpolateBuGn, interpolateBuPu, interpolateGnBu, interpolateOrRd, interpolatePuBuGn, interpolatePuBu, interpolatePuRd, interpolateRdPu, interpolateYlGnBu, interpolateYlGn, interpolateRainbow, interpolateBrBG, interpolatePRGn, interpolatePiYG, interpolatePuOr, interpolateRdBu, interpolateRdGy, interpolateRdYlBu, interpolateRdYlGn, interpolateSpectral, } from 'd3-scale-chromatic';
import { equal } from '../internal';
import { scaleLinear } from 'd3-scale';
import { DEFAULT_COLOR } from './Column';
export class SequentialColorFunction {
    constructor(name) {
        this.name = name;
        this.apply = SequentialColorFunction.FUNCTIONS[name] || interpolateBlues;
    }
    toJSON() {
        return this.name;
    }
    clone() {
        return this; // no clone needed since not parameterized
    }
    eq(other) {
        return other instanceof SequentialColorFunction && other.name === this.name;
    }
}
SequentialColorFunction.FUNCTIONS = {
    interpolateBlues,
    interpolateGreens,
    interpolateGreys,
    interpolateOranges,
    interpolatePurples,
    interpolateReds,
    interpolateCool,
    interpolateCubehelixDefault,
    interpolateWarm,
    interpolatePlasma,
    interpolateMagma,
    interpolateViridis,
    interpolateInferno,
    interpolateYlOrRd,
    interpolateYlOrBr,
    interpolateBuGn,
    interpolateBuPu,
    interpolateGnBu,
    interpolateOrRd,
    interpolatePuBuGn,
    interpolatePuBu,
    interpolatePuRd,
    interpolateRdPu,
    interpolateYlGnBu,
    interpolateYlGn,
    interpolateRainbow,
};
export class DivergentColorFunction {
    constructor(name) {
        this.name = name;
        this.apply = DivergentColorFunction.FUNCTIONS[name] || interpolateBlues;
    }
    toJSON() {
        return this.name;
    }
    clone() {
        return this; // no clone needed since not parameterized
    }
    eq(other) {
        return other instanceof DivergentColorFunction && other.name === this.name;
    }
}
DivergentColorFunction.FUNCTIONS = {
    interpolateBrBG,
    interpolatePRGn,
    interpolatePiYG,
    interpolatePuOr,
    interpolateRdBu,
    interpolateRdGy,
    interpolateRdYlBu,
    interpolateRdYlGn,
    interpolateSpectral,
};
export class UnknownColorFunction {
    constructor(apply) {
        this.apply = apply;
    }
    toJSON() {
        return this.apply.toString();
    }
    clone() {
        return this; // no clone needed since not parameterized
    }
    eq(other) {
        return other instanceof UnknownColorFunction && other.apply === this.apply;
    }
}
export class SolidColorFunction {
    constructor(color) {
        this.color = color;
    }
    apply() {
        return this.color;
    }
    toJSON() {
        return this.color;
    }
    clone() {
        return this; // no clone needed since not parameterized
    }
    eq(other) {
        return other instanceof SolidColorFunction && other.color === this.color;
    }
}
export class QuantizedColorFunction {
    constructor(base, steps) {
        if (typeof base.apply === 'function') {
            this.base = base;
            this.steps = steps == null ? 5 : steps;
        }
        else {
            const dump = base;
            this.base = steps.colorMappingFunction(dump.base);
            this.steps = dump.steps;
        }
    }
    apply(v) {
        return this.base.apply(quantize(v, this.steps));
    }
    toJSON() {
        return {
            type: 'quantized',
            base: this.base.toJSON(),
            steps: this.steps,
        };
    }
    clone() {
        return new QuantizedColorFunction(this.base.clone(), this.steps);
    }
    eq(other) {
        return other instanceof QuantizedColorFunction && other.base.eq(this.base) && other.steps === this.steps;
    }
}
export class CustomColorMappingFunction {
    constructor(entries) {
        this.scale = scaleLinear();
        this.entries = Array.isArray(entries) ? entries : entries.entries;
        this.scale
            .domain(this.entries.map((d) => d.value))
            .range(this.entries.map((d) => d.color))
            .clamp(true);
    }
    apply(v) {
        return this.scale(v);
    }
    toJSON() {
        return {
            type: 'custom',
            entries: this.entries,
        };
    }
    clone() {
        return new CustomColorMappingFunction(this.entries.slice());
    }
    eq(other) {
        return other instanceof CustomColorMappingFunction && equal(this.entries, other.entries);
    }
}
/**
 * @internal
 */
export function quantize(v, steps) {
    const perStep = 1 / steps;
    if (v <= perStep) {
        return 0;
    }
    if (v >= 1 - perStep) {
        return 1;
    }
    for (let acc = 0; acc < 1; acc += perStep) {
        if (v < acc) {
            return acc - perStep / 2; // center
        }
    }
    return v;
}
export function colorMappingFunctions() {
    const types = {
        [DEFAULT_COLOR]: SolidColorFunction,
        quantized: QuantizedColorFunction,
        custom: CustomColorMappingFunction,
    };
    for (const key of Object.keys(SequentialColorFunction.FUNCTIONS)) {
        types[key] = SequentialColorFunction;
    }
    for (const key of Object.keys(DivergentColorFunction.FUNCTIONS)) {
        types[key] = DivergentColorFunction;
    }
    return types;
}
export const DEFAULT_COLOR_FUNCTION = new SolidColorFunction(DEFAULT_COLOR);
/**
 * @internal
 */
export function createColorMappingFunction(types, factory) {
    return (dump) => {
        if (!dump) {
            return DEFAULT_COLOR_FUNCTION;
        }
        if (typeof dump === 'function') {
            return new UnknownColorFunction(dump);
        }
        const typeName = typeof dump === 'string' ? dump : dump.type;
        const type = types[typeName];
        if (type) {
            return new type(dump, factory);
        }
        if (Array.isArray(dump)) {
            return new CustomColorMappingFunction(dump);
        }
        return new SolidColorFunction(dump.toString());
    };
}
