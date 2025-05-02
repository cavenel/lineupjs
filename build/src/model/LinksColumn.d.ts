import ArrayColumn, { type IArrayColumnDesc } from './ArrayColumn';
import type { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import type Column from './Column';
import type { dataLoaded } from './ValueColumn';
import type ValueColumn from './ValueColumn';
import type { IDataRow, ITypeFactory } from './interfaces';
import { EAlignment } from './StringColumn';
import type { IEventListener } from '../internal';
import { type ILink, type ILinkDesc } from './LinkColumn';
export declare type ILinksColumnDesc = ILinkDesc & IArrayColumnDesc<string | ILink>;
/**
 * emitted when the pattern property changes
 * @asMemberOf LinksColumn
 * @event
 */
export declare function patternChanged_LCS(previous: string, current: string): void;
export default class LinksColumn extends ArrayColumn<string | ILink> {
    static readonly EVENT_PATTERN_CHANGED = "patternChanged";
    readonly alignment: EAlignment;
    readonly escape: boolean;
    private pattern;
    private patternFunction;
    readonly patternTemplates: string[];
    constructor(id: string, desc: Readonly<ILinksColumnDesc>);
    setPattern(pattern: string): void;
    getPattern(): string;
    protected createEventList(): string[];
    on(type: typeof LinksColumn.EVENT_PATTERN_CHANGED, listener: typeof patternChanged_LCS | null): this;
    on(type: typeof ValueColumn.EVENT_DATA_LOADED, listener: typeof dataLoaded | null): this;
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
    getValues(row: IDataRow): string[];
    getLabels(row: IDataRow): string[];
    private transformValue;
    getLinks(row: IDataRow): ILink[];
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
}
//# sourceMappingURL=LinksColumn.d.ts.map