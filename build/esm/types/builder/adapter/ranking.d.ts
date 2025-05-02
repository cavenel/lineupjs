import type { Ranking } from '../../model';
import type { LocalDataProvider } from '../../provider';
import { type INestedBuilder, type IReduceBuilder, type IScriptedBuilder, type IWeightedSumBuilder } from '../RankingBuilder';
import type { IBuilderAdapterImposeColumnProps, IBuilderAdapterNestedColumnProps, IBuilderAdapterRankingProps, IBuilderAdapterReduceColumnProps, IBuilderAdapterScriptColumnProps, IBuilderAdapterSupportColumnProps, IBuilderAdapterWeightedSumColumnProps } from './interfaces';
export declare function buildRanking(props: IBuilderAdapterRankingProps, data: LocalDataProvider): Ranking;
export declare function buildGeneric(props: {
    column: '*' | string;
}): string;
export declare function buildImposeRanking(props: IBuilderAdapterImposeColumnProps): {
    type: string;
} & IBuilderAdapterImposeColumnProps;
export declare function buildNestedRanking(props: IBuilderAdapterNestedColumnProps, children: string[]): INestedBuilder;
export declare function buildWeightedSumRanking(props: IBuilderAdapterWeightedSumColumnProps, children: {
    column: string;
    weight: number;
}[]): IWeightedSumBuilder;
export declare function buildReduceRanking(props: IBuilderAdapterReduceColumnProps, children: string[]): IReduceBuilder;
export declare function buildScriptRanking(props: IBuilderAdapterScriptColumnProps, children: string[]): IScriptedBuilder;
export declare function buildSupportRanking(props: IBuilderAdapterSupportColumnProps): string;
export declare function buildAllColumnsRanking(): string;
//# sourceMappingURL=ranking.d.ts.map