var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AggregateGroupColumn_1;
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
export function createAggregateDesc(label = 'Aggregate Groups') {
    return { type: 'aggregate', label, fixed: true };
}
/**
 * a checkbox column for selections
 */
let AggregateGroupColumn = AggregateGroupColumn_1 = class AggregateGroupColumn extends Column {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            width: AGGREGATION_LEVEL_WIDTH * 2,
        }));
    }
    get frozen() {
        return this.desc.frozen !== false;
    }
    createEventList() {
        return super.createEventList().concat([AggregateGroupColumn_1.EVENT_AGGREGATE]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    isAggregated(group) {
        const ranking = this.findMyRanker();
        if (this.desc.isAggregated) {
            return this.desc.isAggregated(ranking, group);
        }
        return false;
    }
    setAggregated(group, value) {
        const n = typeof value === 'boolean' ? (value ? EAggregationState.EXPAND : EAggregationState.COLLAPSE) : value;
        const ranking = this.findMyRanker();
        const current = this.desc.isAggregated &&
            this.desc.isAggregated(ranking, group);
        if (current === n) {
            return true;
        }
        if (this.desc.setAggregated) {
            this.desc.setAggregated(ranking, group, n);
        }
        this.fire(AggregateGroupColumn_1.EVENT_AGGREGATE, ranking, group, n !== EAggregationState.COLLAPSE, n);
        return false;
    }
};
AggregateGroupColumn.EVENT_AGGREGATE = 'aggregate';
AggregateGroupColumn = AggregateGroupColumn_1 = __decorate([
    toolbar('setShowTopN', 'rename'),
    SupportType(),
    Category('support')
], AggregateGroupColumn);
export default AggregateGroupColumn;
