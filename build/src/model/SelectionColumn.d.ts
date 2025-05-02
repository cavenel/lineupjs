import { type IndicesArray, type IDataRow, type IGroup, ECompareValueType, type IValueColumnDesc, type ITypeFactory } from './interfaces';
import type { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches } from './Column';
import Column from './Column';
import type { dataLoaded } from './ValueColumn';
import ValueColumn from './ValueColumn';
import type { IEventListener } from '../internal';
/**
 * factory for creating a description creating a rank column
 * @param label
 * @returns {{type: string, label: string}}
 */
export declare function createSelectionDesc(label?: string): {
    type: string;
    label: string;
};
export interface ISelectionColumnDesc extends IValueColumnDesc<boolean> {
    /**
     * setter for selecting/deselecting the given row
     */
    setter(index: number, value: boolean): void;
    /**
     * setter for selecting/deselecting the given row
     */
    setterAll(indices: IndicesArray, value: boolean): void;
}
/**
 * emitted when rows are selected
 * @asMemberOf SelectionColumn
 * @param dataIndex the (de)selected row
 * @param value true if selected else false
 * @param dataIndices in case of multiple rows are selected
 * @event
 */
export declare function select_SEC(dataIndex: number, value: boolean, dataIndices?: IndicesArray): void;
/**
 * emitted when the filter property changes
 * @asMemberOf SelectionColumn
 * @event
 */
export declare function filterChanged_SEC(previous: Set<number> | null, current: Set<number> | null): void;
/**
 * a checkbox column for selections
 */
export default class SelectionColumn extends ValueColumn<boolean> {
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    static readonly EVENT_SELECT = "select";
    private static SELECTED_GROUP;
    private static NOT_SELECTED_GROUP;
    private currentFilter;
    constructor(id: string, desc: Readonly<ISelectionColumnDesc>);
    get frozen(): boolean;
    protected createEventList(): string[];
    on(type: typeof SelectionColumn.EVENT_SELECT, listener: typeof select_SEC | null): this;
    on(type: typeof SelectionColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_SEC | null): this;
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
    setValue(row: IDataRow, value: boolean): boolean;
    setValues(rows: IndicesArray, value: boolean): boolean;
    private setImpl;
    toggleValue(row: IDataRow): boolean;
    toCompareValue(row: IDataRow): 0 | 1;
    toCompareValueType(): ECompareValueType;
    group(row: IDataRow): IGroup;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    isFiltered(): boolean;
    filter(row: IDataRow): boolean;
    getFilter(): number[] | null;
    setFilter(filter: number[] | null): void;
    clearFilter(): boolean;
}
//# sourceMappingURL=SelectionColumn.d.ts.map