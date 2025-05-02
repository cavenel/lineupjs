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
export function createRankDesc(label = 'Rank') {
    return { type: 'rank', label };
}
/**
 * a rank column
 */
let RankColumn = class RankColumn extends Column {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            width: 50,
        }));
    }
    getLabel(row) {
        return String(this.getValue(row));
    }
    getRaw(row) {
        const ranking = this.findMyRanker();
        if (!ranking) {
            return -1;
        }
        return ranking.getRank(row.i);
    }
    getValue(row) {
        const r = this.getRaw(row);
        return r === -1 ? null : r;
    }
    get frozen() {
        return this.desc.frozen !== false;
    }
};
RankColumn = __decorate([
    SupportType(),
    Category('support')
], RankColumn);
export default RankColumn;
