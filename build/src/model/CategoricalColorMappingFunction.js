import { DEFAULT_COLOR } from './Column';
export var DEFAULT_CATEGORICAL_COLOR_FUNCTION = {
    apply: function (v) { return (v ? v.color : DEFAULT_COLOR); },
    toJSON: function () { return null; },
    clone: function () { return DEFAULT_CATEGORICAL_COLOR_FUNCTION; },
    eq: function (other) { return other === DEFAULT_CATEGORICAL_COLOR_FUNCTION; },
};
var ReplacementColorMappingFunction = /** @class */ (function () {
    function ReplacementColorMappingFunction(map) {
        this.map = new Map(Array.from(map.entries()).map(function (_a) {
            var k = _a[0], v = _a[1];
            return [typeof k === 'string' ? k : k.name, v];
        }));
    }
    ReplacementColorMappingFunction.prototype.apply = function (v) {
        return this.map.has(v.name) ? this.map.get(v.name) : DEFAULT_CATEGORICAL_COLOR_FUNCTION.apply(v);
    };
    ReplacementColorMappingFunction.prototype.toJSON = function () {
        var r = {};
        this.map.forEach(function (v, k) { return (r[k] = v); });
        return {
            type: 'replace',
            map: r,
        };
    };
    ReplacementColorMappingFunction.prototype.clone = function () {
        return new ReplacementColorMappingFunction(new Map(this.map.entries()));
    };
    ReplacementColorMappingFunction.prototype.eq = function (other) {
        var _this = this;
        if (!(other instanceof ReplacementColorMappingFunction)) {
            return false;
        }
        if (other.map.size !== this.map.size) {
            return false;
        }
        return Array.from(this.map.keys()).every(function (k) { return _this.map.get(k) === other.map.get(k); });
    };
    ReplacementColorMappingFunction.restore = function (dump, categories) {
        if (dump.type === 'replace') {
            // new dump format
            dump = dump.map;
        }
        var lookup = new Map(categories.map(function (d) { return [d.name, d]; }));
        var r = new Map();
        for (var _i = 0, _a = Object.keys(dump); _i < _a.length; _i++) {
            var key = _a[_i];
            if (lookup.has(key)) {
                r.set(lookup.get(key), dump[key]);
            }
        }
        return new ReplacementColorMappingFunction(r);
    };
    return ReplacementColorMappingFunction;
}());
export { ReplacementColorMappingFunction };
/**
 * @internal
 */
export function restoreCategoricalColorMapping(dump, categories) {
    if (!dump) {
        return DEFAULT_CATEGORICAL_COLOR_FUNCTION;
    }
    return ReplacementColorMappingFunction.restore(dump, categories);
}
//# sourceMappingURL=CategoricalColorMappingFunction.js.map