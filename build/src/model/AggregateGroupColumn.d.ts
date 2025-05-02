import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import type { IGroup, IColumnDesc } from './interfaces';
import type Ranking from './Ranking';
import type { IEventListener } from '../internal';
export declare enum EAggregationState {
    COLLAPSE = "collapse",
    EXPAND = "expand",
    EXPAND_TOP_N = "expand_top"
}
/**
 * factory for creating a description creating a rank column
 * @param label
 * @returns {{type: string, label: string}}
 */
export declare function createAggregateDesc(label?: string): {
    type: string;
    label: string;
    fixed: boolean;
};
export interface IAggregateGroupColumnDesc extends IColumnDesc {
    isAggregated(ranking: Ranking, group: IGroup): EAggregationState;
    setAggregated(ranking: Ranking, group: IGroup, value: EAggregationState): void;
}
/**
 * emitted upon changing of the aggregate attribute
 * @param value -1 = no, 0 = fully aggregated, N = show top N
 * @asMemberOf AggregateGroupColumn
 * @event
 */
export declare function aggregate(ranking: Ranking, group: IGroup, value: boolean, state: EAggregationState): void;
/**
 * a checkbox column for selections
 */
export default class AggregateGroupColumn extends Column {
    static readonly EVENT_AGGREGATE = "aggregate";
    constructor(id: string, desc: Readonly<IAggregateGroupColumnDesc>);
    get frozen(): boolean;
    protected createEventList(): string[];
    on(type: typeof AggregateGroupColumn.EVENT_AGGREGATE, listener: typeof aggregate | null): this;
    on(type: typeof Column.EVENT_WIDTH_CHANGED, listener: typeof widthChanged | null): this;
    on(type: typeof Column.EVENT_LABEL_CHANGED, listener: typeof labelChanged | null): this;
    on(type: typeof Column.EVENT_METADATA_CHANGED, listener: typeof metaDataChanged | null): this;
    on(type: typeof Column.EVENT_DIRTY, listener: typeof dirty | null): this;
    on(type: typeof Column.EVENT_DIRTY_HEADER, listener: typeof dirtyHeader | null): this;
    on(type: typeof Column.EVENT_DIRTY_VALUES, listener: typeof dirtyValues | null): this;
    on(type: typeof Column.EVENT_DIRTY_CACHES, listener: typeof dirtyCaches | null): this;
    on(type: typeof Column.EVENT_RENDERER_TYPE_CHANGED, listener: typeof rendererTypeChanged | null): this;
    on(type: typeof Column.EVENT_GROUP_RENDERER_TYPE_CHANGED, listener: typeof groupRendererChanged | null): this;
    on(type: typeof Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, listener: typeof summaryRendererChanged | null): this;
    on(type: typeof Column.EVENT_VISIBILITY_CHANGED, listener: typeof visibilityChanged | null): this;
    on(type: string | string[], listener: IEventListener | null): this;
    isAggregated(group: IGroup): false | EAggregationState;
    setAggregated(group: IGroup, value: boolean | EAggregationState): boolean;
}
//# sourceMappingURL=AggregateGroupColumn.d.ts.map