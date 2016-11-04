/**
 * Created by Samuel Gratzl on 06.08.2015.
 */

import Column, {IColumnParent, fixCSS, IFlatColumn, IColumnDesc} from './Column';
import StringColumn from './StringColumn';
import StackColumn from './StackColumn';
import SelectionColumn from './SelectionColumn';
import { AEventDispatcher} from '../utils';

export interface ISortCriteria {
  col:Column;
  asc:boolean;
}

export function isSupportType(col: IColumnDesc) {
  return ['rank', 'selection', 'actions'].indexOf(col.type) >= 0;
}

/**
 * a ranking
 */
export default class Ranking extends AEventDispatcher implements IColumnParent {

  /**
   * the current sort criteria
   * @type {null}
   * @private
   */
  private sortColumn:Column = null;
  /**
   * ascending or descending order
   * @type {boolean}
   */
  private ascending = false;

  /**
   * columns of this ranking
   * @type {Array}
   * @private
   */
  private columns:Column[] = [];

  comparator = (a:any, b:any) => {
    if (this.sortColumn === null) {
      return 0;
    }
    var r = this.sortColumn.compare(a, b);
    return this.ascending ? r : -r;
  };

  dirtyOrder = () => {
    this.fire(['dirtyOrder', 'dirtyValues', 'dirty'], this.getSortCriteria());
  };

  /**
   * the current ordering as an sorted array of indices
   * @type {Array}
   */
  private order:number[] = [];

  constructor(public id : string) {
    super();
    this.id = fixCSS(id);
  }

  createEventList() {
    return super.createEventList().concat(['widthChanged', 'filterChanged', 'labelChanged', 'compressChanged', 'addColumn', 'removeColumn', 'dirty', 'dirtyHeader', 'dirtyValues', 'sortCriteriaChanged', 'dirtyOrder', 'orderChanged']);
  }

  assignNewId(idGenerator:() => string) {
    this.id = fixCSS(idGenerator());
    this.columns.forEach((c) => c.assignNewId(idGenerator));
  }

  setOrder(order:number[]) {
    this.fire(['orderChanged', 'dirtyValues', 'dirty'], this.order, this.order = order);
  }

  getOrder() {
    return this.order;
  }

  dump(toDescRef:(desc:any) => any) {
    var r : any = {};
    r.columns = this.columns.map((d) => d.dump(toDescRef));
    r.sortColumn = {
      asc: this.ascending
    };
    if (this.sortColumn) {
      r.sortColumn.sortBy = this.sortColumn.id; //store the index not the object
    }
    return r;
  }

  restore(dump:any, factory:(dump:any) => Column) {
    this.clear();
    dump.columns.map((child) => {
      var c = factory(child);
      if (c) {
        this.push(c);
      }
    });
    if (dump.sortColumn) {
      this.ascending = dump.sortColumn.asc;
      if (dump.sortColumn.sortBy) {
        let help = this.columns.filter((d) => d.id === dump.sortColumn.sortBy);
        this.sortBy(help.length === 0 ? null : help[0], dump.sortColumn.asc);
      }
    }
  }

  flatten(r:IFlatColumn[], offset:number, levelsToGo = 0, padding = 0) {
    var acc = offset; // + this.getWidth() + padding;
    if (levelsToGo > 0 || levelsToGo <= Column.FLAT_ALL_COLUMNS) {
      this.columns.forEach((c) => {
        if (!c.isHidden() || levelsToGo <= Column.FLAT_ALL_COLUMNS) {
          acc += c.flatten(r, acc, levelsToGo - 1, padding) + padding;
        }
      });
    }
    return acc - offset;
  }

  getSortCriteria(): ISortCriteria {
    return {
      col: this.sortColumn,
      asc: this.ascending
    };
  }

  toggleSorting(col:Column) {
    if (this.sortColumn === col) {
      return this.sortBy(col, !this.ascending);
    }
    return this.sortBy(col);
  }

  setSortCriteria(value: ISortCriteria) {
    return this.sortBy(value.col, value.asc);
  }

  sortBy(col:Column, ascending = false) {
    if (col !== null && col.findMyRanker() !== this) {
      return false; //not one of mine
    }
    if (this.sortColumn === col && this.ascending === ascending) {
      return true; //already in this order
    }
    if (this.sortColumn) { //disable dirty listening
      this.sortColumn.on('dirtyValues.order', null);
    }
    var bak = this.getSortCriteria();
    this.sortColumn = col;
    if (this.sortColumn) { //enable dirty listening
      this.sortColumn.on('dirtyValues.order', this.dirtyOrder);
    }
    this.ascending = ascending;
    this.fire(['sortCriteriaChanged', 'dirtyOrder', 'dirtyHeader', 'dirtyValues', 'dirty'], bak, this.getSortCriteria());
    return true;
  }

  get children() {
    return this.columns.slice();
  }

  get length() {
    return this.columns.length;
  }

  insert(col:Column, index:number = this.columns.length) {
    this.columns.splice(index, 0, col);
    col.parent = this;
    this.forward(col, 'dirtyValues.ranking', 'dirtyHeader.ranking', 'dirty.ranking', 'filterChanged.ranking');
    col.on('filterChanged.order', this.dirtyOrder);


    this.fire(['addColumn', 'dirtyHeader', 'dirtyValues', 'dirty'], col, index);

    if (this.sortColumn === null && !isSupportType(col.desc)) {
      this.sortBy(col, col instanceof StringColumn);
    }
    return col;
  }

  get fqpath() {
    return '';
  }

  findByPath(fqpath: string): Column {
    var p : IColumnParent|Column = <any>this;
    const indices = fqpath.split('@').map(Number).slice(1); //ignore the first entry = ranking
    while(indices.length > 0) {
      let i = indices.shift();
      p = (<IColumnParent>p).at(i);
    }
    return <Column>p;
  }

  indexOf(col: Column) {
    return this.columns.indexOf(col);
  }

  at(index: number) {
    return this.columns[index];
  }

  insertAfter(col:Column, ref:Column) {
    var i = this.columns.indexOf(ref);
    if (i < 0) {
      return null;
    }
    return this.insert(col, i + 1);
  }

  push(col:Column) {
    return this.insert(col);
  }

  remove(col:Column) {
    var i = this.columns.indexOf(col);
    if (i < 0) {
      return false;
    }

    this.unforward(col, 'dirtyValues.ranking', 'dirtyHeader.ranking', 'dirty.ranking', 'filterChanged.ranking');

    if (this.sortColumn === col) { //was my sorting one
      let next = this.columns.filter((d) => d !== col && !isSupportType(d.desc))[0];
      this.sortBy(next ? next : null);
    }

    col.parent = null;
    this.columns.splice(i, 1);

    this.fire(['removeColumn', 'dirtyHeader', 'dirtyValues', 'dirty'], col, i);
    return true;
  }

  clear() {
    if (this.columns.length === 0) {
      return;
    }
    this.sortColumn = null;
    this.columns.forEach((col) => {
      this.unforward(col, 'dirtyValues.ranking', 'dirtyHeader.ranking', 'dirty.ranking', 'filterChanged.ranking');
      col.parent = null;
    });
    this.columns.length = 0;
    this.fire(['removeColumn', 'dirtyHeader', 'dirtyValues', 'dirty'], null);
  }

  get flatColumns() {
    var r:IFlatColumn[] = [];
    this.flatten(r, 0, Column.FLAT_ALL_COLUMNS);
    return r.map((d) => d.col);
  }

  find(id_or_filter:(col:Column) => boolean | string) {
    var filter = typeof(id_or_filter) === 'string' ? (col) => col.id === id_or_filter : id_or_filter;
    var r = this.flatColumns;
    for (var i = 0; i < r.length; ++i) {
      if (filter(r[i])) {
        return r[i];
      }
    }
    return null;
  }

  /**
   * converts the sorting criteria to a json compatible notation for transferring it to the server
   * @param toId
   * @return {any}
   */
  toSortingDesc(toId:(desc:any) => string) {
    //TODO describe also all the filter settings
    var resolve = (s:Column):any => {
      if (s === null) {
        return null;
      }
      if (s instanceof StackColumn) {
        var w = (<StackColumn>s).getWeights();
        return (<StackColumn>s).children.map((child, i) => {
          return {
            weight: w[i],
            id: resolve(child)
          };
        });
      }
      return toId(s.desc);
    };
    var id = resolve(this.sortColumn);
    if (id === null) {
      return null;
    }
    return {
      id: id,
      asc: this.ascending
    };
  }

  isFiltered() {
    return this.columns.some((d) => d.isFiltered());
  }

  filter(row:any) {
    return this.columns.every((d) => d.filter(row));
  }

  findMyRanker() {
    return this;
  }

  get fqid() {
    return this.id;
  }
}
