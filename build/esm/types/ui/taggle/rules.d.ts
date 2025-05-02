import { type IGroupData, type IGroupItem } from '../../model';
import { type ITopNGetter } from '../../provider/internal';
export interface IRule {
    apply(data: (IGroupData | IGroupItem)[], availableHeight: number, selection: Set<number>, topNGetter: ITopNGetter): IRuleInstance;
    levelOfDetail(item: IGroupData | IGroupItem, height: number): 'high' | 'low';
}
export interface IRuleInstance {
    item: number | ((item: IGroupItem) => number);
    group: number | ((group: IGroupData) => number);
    violation?: string;
}
export declare function spaceFillingRule(config: {
    groupHeight: number;
    rowHeight: number;
    groupPadding: number;
}): IRule;
//# sourceMappingURL=rules.d.ts.map