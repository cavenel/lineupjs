import {IDataRow, IGroup, isMissingValue} from '../model';
import Column from '../model/Column';
import {IArrayColumn, IKeyValue, IMapColumn, isArrayColumn, isMapColumn} from '../model/IArrayColumn';
import {ICellRendererFactory, ICellRenderer, IGroupCellRenderer, ISummaryRenderer} from './interfaces';
import {renderMissingDOM} from './missing';
import {forEach, noop} from './utils';

export default class TableCellRenderer implements ICellRendererFactory {
  readonly title: string = 'Table';

  canRender(col: Column): boolean {
    return isMapColumn(col);
  }

  create(col: IMapColumn<any>): ICellRenderer {
    if (isArrayColumn(col) && col.dataLength) {
      // fixed length optimized rendering
      return this.createFixed(col);
    }
    return {
      template: `<div></div>`,
      update: (node: HTMLElement, d: IDataRow) => {
        if (renderMissingDOM(node, col, d)) {
          return;
        }
        node.innerHTML = col.getMapLabel(d).map(({key, value}) => `<div>${key}</div><div>${value}</div>`).join('');
      },
      render: noop
    };
  }

  private static template(col: IArrayColumn<any>) {
    const labels = col.labels;
    return `<div>${labels.map((l) => `<div>${l}</div><div data-v></div>`).join('\n')}</div>`;
  }

  private createFixed(col: IArrayColumn<any>) {
    return {
      template: TableCellRenderer.template(col),
      update: (node: HTMLElement, d: IDataRow) => {
        if (renderMissingDOM(node, col, d)) {
          return;
        }
        const value = col.getLabels(d);
        forEach(node, '[data-v]', (n: HTMLElement, i) => {
          n.innerHTML = value[i];
        });
      },
      render: noop
    };
  }

  private static example(arr: IKeyValue<string>[]) {
    const numExampleRows = 5;
    return `${arr.slice(0, numExampleRows).map((d) => d.value).join(', ')}${numExampleRows < arr.length ? ', &hellip;' : ''}`;
  }

  createGroup(col: IMapColumn<any>): IGroupCellRenderer {
    if (isArrayColumn(col) && col.dataLength) {
      // fixed length optimized rendering
      return this.createFixedGroup(col);
    }
    return {
      template: `<div></div>`,
      update: (node: HTMLElement, _group: IGroup, rows: IDataRow[]) => {
        const vs = rows.filter((d) => !col.isMissing(d)).map((d) => col.getMapLabel(d));

        const entries = groupByKey(vs);

        node.innerHTML = entries.map(({key, values}) => `<div>${key}</div><div>${TableCellRenderer.example(values)}</div>`).join('');
      }
    };
  }

  private createFixedGroup(col: IArrayColumn<any>) {
    return {
      template: TableCellRenderer.template(col),
      update: (node: HTMLElement, _group: IGroup, rows: IDataRow[]) => {
        const numExampleRows = 5;
        const vs = rows.filter((d) => !col.isMissing(d)).map((d) => col.getLabels(d));
        forEach(node, '[data-v]', (n: HTMLElement, i) => {
          const values = <string[]>[];
          for (const v of vs) {
            const vi = v[i];
            if (isMissingValue(vi)) {
              continue;
            }
            values.push(vi);
            if (values.length >= numExampleRows) {
              break;
            }
          }
          n.innerHTML = `${values.join(', ')}${numExampleRows < vs.length ? ', &hellip;' : ''}`;
        });
      }
    };
  }

  createSummary(): ISummaryRenderer {
    return {
      template: `<div><div>Key</div><div>Value</div></div>`,
      update: noop
    };
  }

}

export function groupByKey<T extends { key: string }>(arr: T[][]) {
  const m = new Map<string, T[]>();
  arr.forEach((a) => a.forEach((d) => {
    if (!m.has(d.key)) {
      m.set(d.key, [d]);
    } else {
      m.get(d.key)!.push(d);
    }
  }));
  return Array.from(m).sort((a, b) => a[0].localeCompare(b[0])).map(([key, values]) => ({key, values}));
}
