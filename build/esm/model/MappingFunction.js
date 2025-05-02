import { scaleLinear, scaleLog, scalePow, scaleSqrt } from 'd3-scale';
import { similar } from '../internal';
function toScale(type = 'linear') {
    switch (type) {
        case 'log':
            return scaleLog().clamp(true);
        case 'sqrt':
            return scaleSqrt().clamp(true);
        case 'pow1.1':
            return scalePow().exponent(1.1).clamp(true);
        case 'pow2':
            return scalePow().exponent(2).clamp(true);
        case 'pow3':
            return scalePow().exponent(3).clamp(true);
        default:
            return scaleLinear().clamp(true);
    }
}
function isSame(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((ai, i) => similar(ai, b[i], 0.0001));
}
function fixDomain(domain, type) {
    if (type === 'log' && domain[0] === 0) {
        domain[0] = 0.0000001; //0 is bad
    }
    // replace Null with NaN since D3 converts them to 0
    if (domain[0] == null) {
        domain[0] = Number.NaN;
    }
    if (domain[1] == null) {
        domain[1] = Number.NaN;
    }
    return domain;
}
/**
 * a mapping function based on a d3 scale (linear, sqrt, log)
 */
export class ScaleMappingFunction {
    constructor(domain = [0, 1], type = 'linear', range = [0, 1]) {
        var _a;
        if (!domain || Array.isArray(domain)) {
            this.type = type;
            this.s = toScale(type)
                .domain(fixDomain((_a = domain) !== null && _a !== void 0 ? _a : [0, 1], this.type))
                .range(range);
        }
        else {
            const dump = domain;
            this.type = dump.type;
            this.s = toScale(dump.type).domain(fixDomain(dump.domain, dump.type)).range(dump.range);
        }
    }
    get domain() {
        return this.s.domain();
    }
    set domain(domain) {
        this.s.domain(fixDomain(domain, this.type));
    }
    get range() {
        return this.s.range();
    }
    set range(range) {
        this.s.range(range);
    }
    getRange(format) {
        return [format(this.invert(0)), format(this.invert(1))];
    }
    apply(v) {
        return this.s(v);
    }
    invert(r) {
        return this.s.invert(r);
    }
    get scaleType() {
        return this.type;
    }
    toJSON() {
        return {
            type: this.type,
            domain: this.domain,
            range: this.range,
        };
    }
    eq(other) {
        if (!(other instanceof ScaleMappingFunction)) {
            return false;
        }
        const that = other;
        return that.type === this.type && isSame(this.domain, that.domain) && isSame(this.range, that.range);
    }
    clone() {
        return new ScaleMappingFunction(this.domain, this.type, this.range);
    }
}
/**
 * a mapping function based on a custom user function using 'value' as the current value
 */
export class ScriptMappingFunction {
    constructor(domain = [0, 1], code = 'return this.linear(value,this.value_min,this.value_max);') {
        var _a;
        if (!domain || Array.isArray(domain)) {
            this.domain = (_a = domain) !== null && _a !== void 0 ? _a : [0, 1];
        }
        else {
            const dump = domain;
            this.domain = dump.domain;
            code = dump.code;
        }
        this.code = typeof code === 'string' ? code : code.toString();
        this.f = typeof code === 'function' ? code : new Function('value', code);
    }
    getRange() {
        return ['?', '?'];
    }
    apply(v) {
        const min = this.domain[0], max = this.domain[this.domain.length - 1];
        const r = this.f.call({
            value_min: min,
            value_max: max,
            value_range: max - min,
            value_domain: this.domain.slice(),
            linear: (v, mi, ma) => (v - mi) / (ma - mi),
        }, v);
        if (typeof r === 'number') {
            return Math.max(Math.min(r, 1), 0);
        }
        return NaN;
    }
    toJSON() {
        return {
            type: 'script',
            code: this.code,
            domain: this.domain,
        };
    }
    eq(other) {
        if (!(other instanceof ScriptMappingFunction)) {
            return false;
        }
        const that = other;
        return that.code === this.code || that.f === this.f;
    }
    clone() {
        return new ScriptMappingFunction(this.domain, this.f);
    }
}
/**
 * @internal
 */
export function createMappingFunction(types) {
    return (dump) => {
        if (typeof dump === 'function') {
            return new ScriptMappingFunction([0, 1], dump);
        }
        if (!dump || !dump.type) {
            return new ScaleMappingFunction();
        }
        const type = types[dump.type];
        if (!type) {
            console.warn('invalid mapping type dump', dump);
            return new ScaleMappingFunction(dump.domain || [0, 1], 'linear', dump.range || [0, 1]);
        }
        return new type(dump);
    };
}
/** @internal */
export function restoreMapping(desc, factory) {
    if (desc.map) {
        return factory.mappingFunction(desc.map);
    }
    return new ScaleMappingFunction(fixDomain(desc.domain || [0, 1], 'linear'), 'linear', desc.range || [0, 1]);
}
export function mappingFunctions() {
    return {
        script: ScriptMappingFunction,
        linear: ScaleMappingFunction,
        log: ScaleMappingFunction,
        'pow1.1': ScaleMappingFunction,
        pow2: ScaleMappingFunction,
        pow3: ScaleMappingFunction,
    };
}
