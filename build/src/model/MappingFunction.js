import { scaleLinear, scaleLog, scalePow, scaleSqrt } from 'd3-scale';
import { similar } from '../internal';
function toScale(type) {
    if (type === void 0) { type = 'linear'; }
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
    return a.every(function (ai, i) { return similar(ai, b[i], 0.0001); });
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
var ScaleMappingFunction = /** @class */ (function () {
    function ScaleMappingFunction(domain, type, range) {
        if (domain === void 0) { domain = [0, 1]; }
        if (type === void 0) { type = 'linear'; }
        if (range === void 0) { range = [0, 1]; }
        var _a;
        if (!domain || Array.isArray(domain)) {
            this.type = type;
            this.s = toScale(type)
                .domain(fixDomain((_a = domain) !== null && _a !== void 0 ? _a : [0, 1], this.type))
                .range(range);
        }
        else {
            var dump = domain;
            this.type = dump.type;
            this.s = toScale(dump.type).domain(fixDomain(dump.domain, dump.type)).range(dump.range);
        }
    }
    Object.defineProperty(ScaleMappingFunction.prototype, "domain", {
        get: function () {
            return this.s.domain();
        },
        set: function (domain) {
            this.s.domain(fixDomain(domain, this.type));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScaleMappingFunction.prototype, "range", {
        get: function () {
            return this.s.range();
        },
        set: function (range) {
            this.s.range(range);
        },
        enumerable: false,
        configurable: true
    });
    ScaleMappingFunction.prototype.getRange = function (format) {
        return [format(this.invert(0)), format(this.invert(1))];
    };
    ScaleMappingFunction.prototype.apply = function (v) {
        return this.s(v);
    };
    ScaleMappingFunction.prototype.invert = function (r) {
        return this.s.invert(r);
    };
    Object.defineProperty(ScaleMappingFunction.prototype, "scaleType", {
        get: function () {
            return this.type;
        },
        enumerable: false,
        configurable: true
    });
    ScaleMappingFunction.prototype.toJSON = function () {
        return {
            type: this.type,
            domain: this.domain,
            range: this.range,
        };
    };
    ScaleMappingFunction.prototype.eq = function (other) {
        if (!(other instanceof ScaleMappingFunction)) {
            return false;
        }
        var that = other;
        return that.type === this.type && isSame(this.domain, that.domain) && isSame(this.range, that.range);
    };
    ScaleMappingFunction.prototype.clone = function () {
        return new ScaleMappingFunction(this.domain, this.type, this.range);
    };
    return ScaleMappingFunction;
}());
export { ScaleMappingFunction };
/**
 * a mapping function based on a custom user function using 'value' as the current value
 */
var ScriptMappingFunction = /** @class */ (function () {
    function ScriptMappingFunction(domain, code) {
        if (domain === void 0) { domain = [0, 1]; }
        if (code === void 0) { code = 'return this.linear(value,this.value_min,this.value_max);'; }
        var _a;
        if (!domain || Array.isArray(domain)) {
            this.domain = (_a = domain) !== null && _a !== void 0 ? _a : [0, 1];
        }
        else {
            var dump = domain;
            this.domain = dump.domain;
            code = dump.code;
        }
        this.code = typeof code === 'string' ? code : code.toString();
        this.f = typeof code === 'function' ? code : new Function('value', code);
    }
    ScriptMappingFunction.prototype.getRange = function () {
        return ['?', '?'];
    };
    ScriptMappingFunction.prototype.apply = function (v) {
        var min = this.domain[0], max = this.domain[this.domain.length - 1];
        var r = this.f.call({
            value_min: min,
            value_max: max,
            value_range: max - min,
            value_domain: this.domain.slice(),
            linear: function (v, mi, ma) { return (v - mi) / (ma - mi); },
        }, v);
        if (typeof r === 'number') {
            return Math.max(Math.min(r, 1), 0);
        }
        return NaN;
    };
    ScriptMappingFunction.prototype.toJSON = function () {
        return {
            type: 'script',
            code: this.code,
            domain: this.domain,
        };
    };
    ScriptMappingFunction.prototype.eq = function (other) {
        if (!(other instanceof ScriptMappingFunction)) {
            return false;
        }
        var that = other;
        return that.code === this.code || that.f === this.f;
    };
    ScriptMappingFunction.prototype.clone = function () {
        return new ScriptMappingFunction(this.domain, this.f);
    };
    return ScriptMappingFunction;
}());
export { ScriptMappingFunction };
/**
 * @internal
 */
export function createMappingFunction(types) {
    return function (dump) {
        if (typeof dump === 'function') {
            return new ScriptMappingFunction([0, 1], dump);
        }
        if (!dump || !dump.type) {
            return new ScaleMappingFunction();
        }
        var type = types[dump.type];
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
//# sourceMappingURL=MappingFunction.js.map