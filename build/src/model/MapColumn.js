var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Category } from './annotations';
import ValueColumn from './ValueColumn';
import { integrateDefaults } from './internal';
var MapColumn = /** @class */ (function (_super) {
    __extends(MapColumn, _super);
    function MapColumn(id, desc) {
        return _super.call(this, id, integrateDefaults(desc, {
            width: 200,
        })) || this;
    }
    MapColumn.prototype.getValue = function (row) {
        var r = this.getMap(row);
        return r.length === 0 ? null : r;
    };
    MapColumn.prototype.getLabels = function (row) {
        var v = this.getMap(row);
        return v.map(function (_a) {
            var key = _a.key, value = _a.value;
            return ({ key: key, value: String(value) });
        });
    };
    MapColumn.prototype.getMap = function (row) {
        return toKeyValue(_super.prototype.getValue.call(this, row));
    };
    MapColumn.prototype.getMapLabel = function (row) {
        return this.getLabels(row);
    };
    MapColumn.prototype.getLabel = function (row) {
        var v = this.getLabels(row);
        return "{".concat(v.map(function (_a) {
            var key = _a.key, value = _a.value;
            return "".concat(key, ": ").concat(value);
        }).join(', '), "}");
    };
    MapColumn = __decorate([
        Category('map')
    ], MapColumn);
    return MapColumn;
}(ValueColumn));
export default MapColumn;
function byKey(a, b) {
    if (a === b) {
        return 0;
    }
    return a.key.localeCompare(b.key);
}
function toKeyValue(v) {
    if (!v) {
        return [];
    }
    if (v instanceof Map) {
        return Array.from(v.entries())
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return ({ key: key, value: value });
        })
            .sort(byKey);
    }
    if (Array.isArray(v)) {
        return v; // keep original order
    }
    // object
    return Object.keys(v)
        .map(function (key) { return ({ key: key, value: v[key] }); })
        .sort(byKey);
}
//# sourceMappingURL=MapColumn.js.map