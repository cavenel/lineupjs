import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import type { IDataRow, IGroup, IValueColumnDesc, ITypeFactory } from './interfaces';
import type { dataLoaded } from './ValueColumn';
import ValueColumn from './ValueColumn';
import type { IEventListener, ISequence } from '../internal';
import { type IStringDesc, EAlignment, type IStringGroupCriteria, type IStringFilter } from './StringColumn';
export interface ILinkDesc extends IStringDesc {
    /**
     * replacement pattern, use use `${value}` for the current value, `${escapedValue}` for an url safe value and `${item}` for the whole item
     */
    pattern?: string;
    /**
     * optional list of pattern templates
     */
    patternTemplates?: string[];
}
export interface ILink {
    alt: string;
    href: string;
}
export declare type ILinkColumnDesc = ILinkDesc & IValueColumnDesc<string | ILink>;
/**
 * emitted when the filter property changes
 * @asMemberOf LinkColumn
 * @event
 */
export declare function filterChanged_LC(previous: string | RegExp | null, current: string | RegExp | null): void;
/**
 * emitted when the grouping property changes
 * @asMemberOf LinkColumn
 * @event
 */
export declare function groupingChanged_LC(previous: (RegExp | string)[][], current: (RegExp | string)[][]): void;
/**
 * emitted when the pattern property changes
 * @asMemberOf LinkColumn
 * @event
 */
export declare function patternChanged_LC(previous: string, current: string): void;
/**
 * a string column with optional alignment
 */
export default class LinkColumn extends ValueColumn<string | ILink> {
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    static readonly EVENT_GROUPING_CHANGED = "groupingChanged";
    static readonly EVENT_PATTERN_CHANGED = "patternChanged";
    private pattern;
    private patternFunction;
    readonly patternTemplates: string[];
    private currentFilter;
    private currentGroupCriteria;
    readonly alignment: EAlignment;
    readonly escape: boolean;
    constructor(id: string, desc: Readonly<ILinkColumnDesc>);
    setPattern(pattern: string): void;
    getPattern(): string;
    protected createEventList(): string[];
    on(type: typeof LinkColumn.EVENT_PATTERN_CHANGED, listener: typeof patternChanged_LC | null): this;
    on(type: typeof LinkColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_LC | null): this;
    on(type: typeof ValueColumn.EVENT_DATA_LOADED, listener: typeof dataLoaded | null): this;
    on(type: typeof LinkColumn.EVENT_GROUPING_CHANGED, listener: typeof groupingChanged_LC | null): this;
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
    getValue(row: IDataRow): string;
    getLink(row: IDataRow): ILink | null;
    private transformValue;
    getLabel(row: IDataRow): string;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    isFiltered(): boolean;
    filter(row: IDataRow): boolean;
    getFilter(): string | RegExp;
    setFilter(filter: IStringFilter): void;
    clearFilter(): boolean;
    getGroupCriteria(): IStringGroupCriteria;
    setGroupCriteria(value: IStringGroupCriteria): void;
    toCompareValue(a: IDataRow): string;
    toCompareValueType(): import("./interfaces").ECompareValueType;
    toCompareGroupValue(rows: ISequence<IDataRow>, group: IGroup): string;
    toCompareGroupValueType(): import("./interfaces").ECompareValueType;
    group(row: IDataRow): IGroup;
}
//# sourceMappingURL=LinkColumn.d.ts.map