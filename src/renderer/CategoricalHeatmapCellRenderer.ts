import {IDataRow, IGroup} from '../model';
import Column from '../model/Column';
import {ISetColumn, isSetColumn} from '../model/ICategoricalColumn';
import {CANVAS_HEIGHT} from '../styles';
import {default as IRenderContext, ICellRendererFactory} from './interfaces';
import {renderMissingCanvas, renderMissingDOM} from './missing';
import {union} from './UpSetCellRenderer';
import {noop, wideEnough, forEachChild} from './utils';

export default class CategoricalHeatmapCellRenderer implements ICellRendererFactory {
  title = 'Heatmap';

  canRender(col: Column) {
    return isSetColumn(col);
  }

  private static createDOMContext(col: ISetColumn) {
    const categories = col.categories;
    let templateRows = '';
    for (const cat of categories) {
      templateRows += `<div title="${cat.label}" style="background-color: ${cat.color}"></div>`;
    }
    return {
      templateRow: templateRows,
      render: (n: HTMLElement, value: boolean[]) => {
        forEachChild(n, (d: HTMLElement, i) => {
          const v = value[i];
          d.style.visibility = v ? null : 'hidden';
        });
      }
    };
  }

  create(col: ISetColumn, context: IRenderContext) {
    const {templateRow, render} = CategoricalHeatmapCellRenderer.createDOMContext(col);
    const width = context.colWidth(col);
    const cellDimension = width / col.dataLength!;
    const cats = col.categories;

    return {
      template: `<div>${templateRow}</div>`,
      update: (n: HTMLElement, d: IDataRow) => {
        if (renderMissingDOM(n, col, d)) {
          return;
        }
        render(n, col.getValues(d));
      },
      render: (ctx: CanvasRenderingContext2D, d: IDataRow) => {
        if (renderMissingCanvas(ctx, col, d, width)) {
          return;
        }
        // Circle
        const data = col.getValues(d);

        ctx.save();
        cats.forEach((d, j) => {
          if (!data[j]) {
            return;
          }
          const posx = (j * cellDimension);
          ctx.fillStyle = d.color;
          ctx.fillRect(posx, 0, cellDimension, CANVAS_HEIGHT);
        });

        ctx.restore();
      }
    };
  }

  createGroup(col: ISetColumn) {
    const {templateRow, render} = CategoricalHeatmapCellRenderer.createDOMContext(col);
    return {
      template: `<div>${templateRow}</div>`,
      update: (n: HTMLElement, _group: IGroup, rows: IDataRow[]) => {
        const value = union(col, rows);
        render(n, value);
      }
    };
  }

  createSummary(col: ISetColumn) {
    const categories = col.categories;
    let templateRows = '<div>';
    const labels = wideEnough(col);
    for (const cat of categories) {
      templateRows += `<div title="${cat.label}"${labels ? ` data-title="${cat.label}"` : ''} style="background-color: ${cat.color}"></div>`;
    }
    templateRows += '</div>';
    return {
      template: templateRows,
      update: noop
    };
  }
}
