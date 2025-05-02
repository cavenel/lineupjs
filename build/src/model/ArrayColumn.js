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
import { empty } from '../internal';
var ArrayColumn = /** @class */ (function (_super) {
    __extends(ArrayColumn, _super);
    function ArrayColumn(id, desc) {
        var _this = _super.call(this, id, desc) || this;
        _this._dataLength = desc.dataLength == null || Number.isNaN(desc.dataLength) ? null : desc.dataLength;
        _this.originalLabels =
            desc.labels || empty(_this._dataLength == null ? 0 : _this._dataLength).map(function (_d, i) { return "Column ".concat(i); });
        return _this;
    }
    Object.defineProperty(ArrayColumn.prototype, "labels", {
        get: function () {
            return this.originalLabels;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ArrayColumn.prototype, "dataLength", {
        get: function () {
            return this._dataLength;
        },
        enumerable: false,
        configurable: true
    });
    ArrayColumn.prototype.getValue = function (row) {
        var r = this.getValues(row);
        return r.every(function (d) { return d === null; }) ? null : r;
    };
    ArrayColumn.prototype.getValues = function (row) {
        var r = _super.prototype.getValue.call(this, row);
        return r == null ? [] : r;
    };
    ArrayColumn.prototype.getLabels = function (row) {
        return this.getValues(row).map(String);
    };
    ArrayColumn.prototype.getLabel = function (row) {
        var v = this.getLabels(row);
        if (v.length === 0) {
            return '';
        }
        return v.toString();
    };
    ArrayColumn.prototype.getMap = function (row) {
        var labels = this.labels;
        return this.getValues(row).map(function (value, i) { return ({ key: labels[i], value: value }); });
    };
    ArrayColumn.prototype.getMapLabel = function (row) {
        var labels = this.labels;
        return this.getLabels(row).map(function (value, i) { return ({ key: labels[i], value: value }); });
    };
    ArrayColumn = __decorate([
        Category('array')
    ], ArrayColumn);
    return ArrayColumn;
}(ValueColumn));
export default ArrayColumn;
//# sourceMappingURL=ArrayColumn.js.map