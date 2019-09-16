import {timeFormat, timeParse} from 'd3-time-format';
import {IDateColumn, IDateFilter, noDateFilter, restoreDateFilter, isDummyDateFilter} from './IDateColumn';
import {IKeyValue} from './IArrayColumn';
import {IDataRow} from './interfaces';
import MapColumn, {IMapColumnDesc} from './MapColumn';
import {isMissingValue} from './missing';
import DatesColumn, {EDateSort, IDatesDesc} from './DatesColumn';
import DateColumn from './DateColumn';
import {dialogAddons, toolbar} from './annotations';
import Column, {widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged} from './Column';
import ValueColumn, {dataLoaded} from './ValueColumn';
import {IEventListener} from '../internal/AEventDispatcher';

export declare type IDateMapColumnDesc = IDatesDesc & IMapColumnDesc<Date | null>;

/**
 * emitted when the sort method property changes
 * @asMemberOf DatesMapColumn
 * @event
 */
export declare function sortMethodChanged(previous: EDateSort, current: EDateSort): void;

/**
 * emitted when the filter property changes
 * @asMemberOf DatesMapColumn
 * @event
 */
export declare function filterChanged(previous: IDateFilter | null, current: IDateFilter | null): void;


@toolbar('filterDate')
@dialogAddons('sort', 'sortDates')
export default class DatesMapColumn extends MapColumn<Date | null> implements IDateColumn {
  static readonly EVENT_SORTMETHOD_CHANGED = DatesColumn.EVENT_SORTMETHOD_CHANGED;
  static readonly EVENT_FILTER_CHANGED = DateColumn.EVENT_FILTER_CHANGED;

  private readonly format: (date: Date) => string;
  private readonly parse: (date: string) => Date | null;
  private sort: EDateSort;
  private currentFilter: IDateFilter = noDateFilter();

  constructor(id: string, desc: Readonly<IDateMapColumnDesc>) {
    super(id, desc);
    this.format = timeFormat(desc.dateFormat || '%x');
    this.parse = desc.dateParse ? timeParse(desc.dateParse) : timeParse(desc.dateFormat || '%x');
    this.sort = desc.sort || EDateSort.median;
    this.setDefaultRenderer('default');
  }

  protected createEventList() {
    return super.createEventList().concat([DatesMapColumn.EVENT_SORTMETHOD_CHANGED, DatesMapColumn.EVENT_FILTER_CHANGED]);
  }

  on(type: typeof DatesMapColumn.EVENT_SORTMETHOD_CHANGED, listener: typeof sortMethodChanged | null): this;
  on(type: typeof DatesMapColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged | null): this;
  on(type: typeof ValueColumn.EVENT_DATA_LOADED, listener: typeof dataLoaded | null): this;
  on(type: typeof Column.EVENT_WIDTH_CHANGED, listener: typeof widthChanged | null): this;
  on(type: typeof Column.EVENT_LABEL_CHANGED, listener: typeof labelChanged | null): this;
  on(type: typeof Column.EVENT_METADATA_CHANGED, listener: typeof metaDataChanged | null): this;
  on(type: typeof Column.EVENT_DIRTY, listener: typeof dirty | null): this;
  on(type: typeof Column.EVENT_DIRTY_HEADER, listener: typeof dirtyHeader | null): this;
  on(type: typeof Column.EVENT_DIRTY_VALUES, listener: typeof dirtyValues | null): this;
  on(type: typeof Column.EVENT_RENDERER_TYPE_CHANGED, listener: typeof rendererTypeChanged | null): this;
  on(type: typeof Column.EVENT_GROUP_RENDERER_TYPE_CHANGED, listener: typeof groupRendererChanged | null): this;
  on(type: typeof Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, listener: typeof summaryRendererChanged | null): this;
  on(type: typeof Column.EVENT_VISIBILITY_CHANGED, listener: typeof visibilityChanged | null): this;
  on(type: string | string[], listener: IEventListener | null): this; // required for correct typings in *.d.ts
  on(type: string | string[], listener: IEventListener | null): this {
    return super.on(<any>type, listener);
  }

  private parseValue(v: any) {
    if (isMissingValue(v)) {
      return null;
    }
    if (v instanceof Date) {
      return v;
    }
    return this.parse(String(v));
  }

  getValue(row: IDataRow) {
    return super.getValue(row).map(({key, value}) => ({
      key,
      value: this.parseValue(value)
    }));
  }

  getLabels(row: IDataRow): IKeyValue<string>[] {
    return this.getValue(row).map(({key, value}) => ({
      key,
      value: (value instanceof Date) ? this.format(value) : ''
    }));
  }

  getDates(row: IDataRow): (Date | null)[] {
    return this.getValue(row).map((v) => v.value);
  }

  getDate(row: IDataRow) {
    return DatesColumn.prototype.getDate.call(this, row);
  }

  getSortMethod() {
    return this.sort;
  }

  setSortMethod(sort: EDateSort) {
    return DatesColumn.prototype.setSortMethod.call(this, sort);
  }

  dump(toDescRef: (desc: any) => any): any {
    const r = super.dump(toDescRef);
    r.sortMethod = this.getSortMethod();
    r.filter = !isDummyDateFilter(this.currentFilter) ? this.currentFilter : null;
    return r;
  }

  restore(dump: any, factory: (dump: any) => Column | null) {
    super.restore(dump, factory);
    if (dump.sortMethod) {
      this.sort = dump.sortMethod;
    }
    if (dump.filter) {
      this.currentFilter = restoreDateFilter(dump.filter);
    }
  }

  isFiltered() {
    return DateColumn.prototype.isFiltered.call(this);
  }

  getFilter(): IDateFilter {
    return DateColumn.prototype.getFilter.call(this);
  }

  setFilter(value: IDateFilter = {min: -Infinity, max: +Infinity, filterMissing: false}) {
    DateColumn.prototype.setFilter.call(this, value);
  }

  filter(row: IDataRow) {
    return DateColumn.prototype.filter.call(this, row);
  }
}
