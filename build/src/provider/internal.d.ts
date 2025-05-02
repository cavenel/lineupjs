import type { IAggregationStrategy } from './interfaces';
import { type IOrderedGroup, type IGroup, type IGroupData, type IGroupItem, EAggregationState } from '../model';
export declare function isAlwaysShowingGroupStrategy(strategy: IAggregationStrategy): strategy is "group+item" | "group+top+item" | "group+item+top";
export declare function hasTopNStrategy(strategy: IAggregationStrategy): strategy is "group+top+item" | "group+item+top";
export declare function convertAggregationState(state: boolean | number | EAggregationState, topN: number): number;
export declare type IGroupMeta = 'first' | 'last' | 'first last' | null;
export declare function toItemMeta(relativeIndex: number, group: IOrderedGroup, topN: number): IGroupMeta;
export declare function groupParents(group: IGroup, meta: IGroupMeta): {
    group: IGroup;
    meta: IGroupMeta;
}[];
export interface ITopNGetter {
    (item: IGroup): number;
}
/**
 * number of group levels this items ends
 */
export declare function groupEndLevel(item: IGroupData | IGroupItem, topNGetter: ITopNGetter): number;
export declare function isSummaryGroup(group: IGroup, strategy: IAggregationStrategy, topNGetter: ITopNGetter): boolean;
export declare function toRowMeta(item: IGroupData | IGroupItem, strategy: IAggregationStrategy, topNGetter: ITopNGetter): string | null;
//# sourceMappingURL=internal.d.ts.map