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
import { Category, SupportType, toolbar } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import { integrateDefaults } from './internal';
import { AGGREGATION_LEVEL_WIDTH } from '../styles';
export var EAggregationState;
(function (EAggregationState) {
    EAggregationState["COLLAPSE"] = "collapse";
    EAggregationState["EXPAND"] = "expand";
    EAggregationState["EXPAND_TOP_N"] = "expand_top";
})(EAggregationState || (EAggregationState = {}));
/**
 * factory for creating a description creating a rank column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createAggregateDesc(label) {
    if (label === void 0) { label = 'Aggregate Groups'; }
    return { type: 'aggregate', label: label, fixed: true };
}
/**
 * a checkbox column for selections
 */
var AggregateGroupColumn = /** @class */ (function (_super) {
    __extends(AggregateGroupColumn, _super);
    function AggregateGroupColumn(id, desc) {
        return _super.call(this, id, integrateDefaults(desc, {
            width: AGGREGATION_LEVEL_WIDTH * 2,
        })) || this;
    }
    AggregateGroupColumn_1 = AggregateGroupColumn;
    Object.defineProperty(AggregateGroupColumn.prototype, "frozen", {
        get: function () {
            return this.desc.frozen !== false;
        },
        enumerable: false,
        configurable: true
    });
    AggregateGroupColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([AggregateGroupColumn_1.EVENT_AGGREGATE]);
    };
    AggregateGroupColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    AggregateGroupColumn.prototype.isAggregated = function (group) {
        var ranking = this.findMyRanker();
        if (this.desc.isAggregated) {
            return this.desc.isAggregated(ranking, group);
        }
        return false;
    };
    AggregateGroupColumn.prototype.setAggregated = function (group, value) {
        var n = typeof value === 'boolean' ? (value ? EAggregationState.EXPAND : EAggregationState.COLLAPSE) : value;
        var ranking = this.findMyRanker();
        var current = this.desc.isAggregated &&
            this.desc.isAggregated(ranking, group);
        if (current === n) {
            return true;
        }
        if (this.desc.setAggregated) {
            this.desc.setAggregated(ranking, group, n);
        }
        this.fire(AggregateGroupColumn_1.EVENT_AGGREGATE, ranking, group, n !== EAggregationState.COLLAPSE, n);
        return false;
    };
    var AggregateGroupColumn_1;
    AggregateGroupColumn.EVENT_AGGREGATE = 'aggregate';
    AggregateGroupColumn = AggregateGroupColumn_1 = __decorate([
        toolbar('setShowTopN', 'rename'),
        SupportType(),
        Category('support')
    ], AggregateGroupColumn);
    return AggregateGroupColumn;
}(Column));
export default AggregateGroupColumn;
//# sourceMappingURL=AggregateGroupColumn.js.map