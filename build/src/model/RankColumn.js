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
import { Category, SupportType } from './annotations';
import Column from './Column';
import { integrateDefaults } from './internal';
/**
 * factory for creating a description creating a rank column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createRankDesc(label) {
    if (label === void 0) { label = 'Rank'; }
    return { type: 'rank', label: label };
}
/**
 * a rank column
 */
var RankColumn = /** @class */ (function (_super) {
    __extends(RankColumn, _super);
    function RankColumn(id, desc) {
        return _super.call(this, id, integrateDefaults(desc, {
            width: 50,
        })) || this;
    }
    RankColumn.prototype.getLabel = function (row) {
        return String(this.getValue(row));
    };
    RankColumn.prototype.getRaw = function (row) {
        var ranking = this.findMyRanker();
        if (!ranking) {
            return -1;
        }
        return ranking.getRank(row.i);
    };
    RankColumn.prototype.getValue = function (row) {
        var r = this.getRaw(row);
        return r === -1 ? null : r;
    };
    Object.defineProperty(RankColumn.prototype, "frozen", {
        get: function () {
            return this.desc.frozen !== false;
        },
        enumerable: false,
        configurable: true
    });
    RankColumn = __decorate([
        SupportType(),
        Category('support')
    ], RankColumn);
    return RankColumn;
}(Column));
export default RankColumn;
//# sourceMappingURL=RankColumn.js.map