import { interpolateBlues, interpolateGreens, interpolateGreys, interpolateOranges, interpolatePurples, interpolateReds, interpolateCool, interpolateCubehelixDefault, interpolateWarm, interpolatePlasma, interpolateMagma, interpolateViridis, interpolateInferno, interpolateYlOrRd, interpolateYlOrBr, interpolateBuGn, interpolateBuPu, interpolateGnBu, interpolateOrRd, interpolatePuBuGn, interpolatePuBu, interpolatePuRd, interpolateRdPu, interpolateYlGnBu, interpolateYlGn, interpolateRainbow, interpolateBrBG, interpolatePRGn, interpolatePiYG, interpolatePuOr, interpolateRdBu, interpolateRdGy, interpolateRdYlBu, interpolateRdYlGn, interpolateSpectral, } from 'd3-scale-chromatic';
import { equal } from '../internal';
import { scaleLinear } from 'd3-scale';
import { DEFAULT_COLOR } from './Column';
var SequentialColorFunction = /** @class */ (function () {
    function SequentialColorFunction(name) {
        this.name = name;
        this.apply = SequentialColorFunction.FUNCTIONS[name] || interpolateBlues;
    }
    SequentialColorFunction.prototype.toJSON = function () {
        return this.name;
    };
    SequentialColorFunction.prototype.clone = function () {
        return this; // no clone needed since not parameterized
    };
    SequentialColorFunction.prototype.eq = function (other) {
        return other instanceof SequentialColorFunction && other.name === this.name;
    };
    SequentialColorFunction.FUNCTIONS = {
        interpolateBlues: interpolateBlues,
        interpolateGreens: interpolateGreens,
        interpolateGreys: interpolateGreys,
        interpolateOranges: interpolateOranges,
        interpolatePurples: interpolatePurples,
        interpolateReds: interpolateReds,
        interpolateCool: interpolateCool,
        interpolateCubehelixDefault: interpolateCubehelixDefault,
        interpolateWarm: interpolateWarm,
        interpolatePlasma: interpolatePlasma,
        interpolateMagma: interpolateMagma,
        interpolateViridis: interpolateViridis,
        interpolateInferno: interpolateInferno,
        interpolateYlOrRd: interpolateYlOrRd,
        interpolateYlOrBr: interpolateYlOrBr,
        interpolateBuGn: interpolateBuGn,
        interpolateBuPu: interpolateBuPu,
        interpolateGnBu: interpolateGnBu,
        interpolateOrRd: interpolateOrRd,
        interpolatePuBuGn: interpolatePuBuGn,
        interpolatePuBu: interpolatePuBu,
        interpolatePuRd: interpolatePuRd,
        interpolateRdPu: interpolateRdPu,
        interpolateYlGnBu: interpolateYlGnBu,
        interpolateYlGn: interpolateYlGn,
        interpolateRainbow: interpolateRainbow,
    };
    return SequentialColorFunction;
}());
export { SequentialColorFunction };
var DivergentColorFunction = /** @class */ (function () {
    function DivergentColorFunction(name) {
        this.name = name;
        this.apply = DivergentColorFunction.FUNCTIONS[name] || interpolateBlues;
    }
    DivergentColorFunction.prototype.toJSON = function () {
        return this.name;
    };
    DivergentColorFunction.prototype.clone = function () {
        return this; // no clone needed since not parameterized
    };
    DivergentColorFunction.prototype.eq = function (other) {
        return other instanceof DivergentColorFunction && other.name === this.name;
    };
    DivergentColorFunction.FUNCTIONS = {
        interpolateBrBG: interpolateBrBG,
        interpolatePRGn: interpolatePRGn,
        interpolatePiYG: interpolatePiYG,
        interpolatePuOr: interpolatePuOr,
        interpolateRdBu: interpolateRdBu,
        interpolateRdGy: interpolateRdGy,
        interpolateRdYlBu: interpolateRdYlBu,
        interpolateRdYlGn: interpolateRdYlGn,
        interpolateSpectral: interpolateSpectral,
    };
    return DivergentColorFunction;
}());
export { DivergentColorFunction };
var UnknownColorFunction = /** @class */ (function () {
    function UnknownColorFunction(apply) {
        this.apply = apply;
    }
    UnknownColorFunction.prototype.toJSON = function () {
        return this.apply.toString();
    };
    UnknownColorFunction.prototype.clone = function () {
        return this; // no clone needed since not parameterized
    };
    UnknownColorFunction.prototype.eq = function (other) {
        return other instanceof UnknownColorFunction && other.apply === this.apply;
    };
    return UnknownColorFunction;
}());
export { UnknownColorFunction };
var SolidColorFunction = /** @class */ (function () {
    function SolidColorFunction(color) {
        this.color = color;
    }
    SolidColorFunction.prototype.apply = function () {
        return this.color;
    };
    SolidColorFunction.prototype.toJSON = function () {
        return this.color;
    };
    SolidColorFunction.prototype.clone = function () {
        return this; // no clone needed since not parameterized
    };
    SolidColorFunction.prototype.eq = function (other) {
        return other instanceof SolidColorFunction && other.color === this.color;
    };
    return SolidColorFunction;
}());
export { SolidColorFunction };
var QuantizedColorFunction = /** @class */ (function () {
    function QuantizedColorFunction(base, steps) {
        if (typeof base.apply === 'function') {
            this.base = base;
            this.steps = steps == null ? 5 : steps;
        }
        else {
            var dump = base;
            this.base = steps.colorMappingFunction(dump.base);
            this.steps = dump.steps;
        }
    }
    QuantizedColorFunction.prototype.apply = function (v) {
        return this.base.apply(quantize(v, this.steps));
    };
    QuantizedColorFunction.prototype.toJSON = function () {
        return {
            type: 'quantized',
            base: this.base.toJSON(),
            steps: this.steps,
        };
    };
    QuantizedColorFunction.prototype.clone = function () {
        return new QuantizedColorFunction(this.base.clone(), this.steps);
    };
    QuantizedColorFunction.prototype.eq = function (other) {
        return other instanceof QuantizedColorFunction && other.base.eq(this.base) && other.steps === this.steps;
    };
    return QuantizedColorFunction;
}());
export { QuantizedColorFunction };
var CustomColorMappingFunction = /** @class */ (function () {
    function CustomColorMappingFunction(entries) {
        this.scale = scaleLinear();
        this.entries = Array.isArray(entries) ? entries : entries.entries;
        this.scale
            .domain(this.entries.map(function (d) { return d.value; }))
            .range(this.entries.map(function (d) { return d.color; }))
            .clamp(true);
    }
    CustomColorMappingFunction.prototype.apply = function (v) {
        return this.scale(v);
    };
    CustomColorMappingFunction.prototype.toJSON = function () {
        return {
            type: 'custom',
            entries: this.entries,
        };
    };
    CustomColorMappingFunction.prototype.clone = function () {
        return new CustomColorMappingFunction(this.entries.slice());
    };
    CustomColorMappingFunction.prototype.eq = function (other) {
        return other instanceof CustomColorMappingFunction && equal(this.entries, other.entries);
    };
    return CustomColorMappingFunction;
}());
export { CustomColorMappingFunction };
/**
 * @internal
 */
export function quantize(v, steps) {
    var perStep = 1 / steps;
    if (v <= perStep) {
        return 0;
    }
    if (v >= 1 - perStep) {
        return 1;
    }
    for (var acc = 0; acc < 1; acc += perStep) {
        if (v < acc) {
            return acc - perStep / 2; // center
        }
    }
    return v;
}
export function colorMappingFunctions() {
    var _a;
    var types = (_a = {},
        _a[DEFAULT_COLOR] = SolidColorFunction,
        _a.quantized = QuantizedColorFunction,
        _a.custom = CustomColorMappingFunction,
        _a);
    for (var _i = 0, _b = Object.keys(SequentialColorFunction.FUNCTIONS); _i < _b.length; _i++) {
        var key = _b[_i];
        types[key] = SequentialColorFunction;
    }
    for (var _c = 0, _d = Object.keys(DivergentColorFunction.FUNCTIONS); _c < _d.length; _c++) {
        var key = _d[_c];
        types[key] = DivergentColorFunction;
    }
    return types;
}
export var DEFAULT_COLOR_FUNCTION = new SolidColorFunction(DEFAULT_COLOR);
/**
 * @internal
 */
export function createColorMappingFunction(types, factory) {
    return function (dump) {
        if (!dump) {
            return DEFAULT_COLOR_FUNCTION;
        }
        if (typeof dump === 'function') {
            return new UnknownColorFunction(dump);
        }
        var typeName = typeof dump === 'string' ? dump : dump.type;
        var type = types[typeName];
        if (type) {
            return new type(dump, factory);
        }
        if (Array.isArray(dump)) {
            return new CustomColorMappingFunction(dump);
        }
        return new SolidColorFunction(dump.toString());
    };
}
//# sourceMappingURL=ColorMappingFunction.js.map