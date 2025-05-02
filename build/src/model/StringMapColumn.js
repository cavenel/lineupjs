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
import { toolbar } from './annotations';
import MapColumn, {} from './MapColumn';
import { EAlignment } from './StringColumn';
import { isMissingValue } from './missing';
import { integrateDefaults } from './internal';
/**
 * a string column with optional alignment
 */
var StringMapColumn = /** @class */ (function (_super) {
    __extends(StringMapColumn, _super);
    function StringMapColumn(id, desc) {
        var _a;
        var _this = _super.call(this, id, integrateDefaults(desc, {
            width: 200,
            renderer: 'map',
        })) || this;
        _this.alignment = (_a = desc.alignment) !== null && _a !== void 0 ? _a : EAlignment.left;
        _this.escape = desc.escape !== false;
        return _this;
    }
    StringMapColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    StringMapColumn.prototype.getValue = function (row) {
        var r = this.getMapValue(row);
        return r.every(function (d) { return d.value === ''; }) ? null : r;
    };
    StringMapColumn.prototype.getMapValue = function (row) {
        return _super.prototype.getMap.call(this, row).map(function (_a) {
            var key = _a.key, value = _a.value;
            return ({
                key: key,
                value: isMissingValue(value) ? '' : String(value),
            });
        });
    };
    StringMapColumn = __decorate([
        toolbar('rename', 'search')
    ], StringMapColumn);
    return StringMapColumn;
}(MapColumn));
export default StringMapColumn;
//# sourceMappingURL=StringMapColumn.js.map