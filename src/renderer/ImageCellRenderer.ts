import {IDataRow} from '../model';
import Column from '../model/Column';
import {ERenderMode, ICellRendererFactory} from './interfaces';
import {renderMissingDOM} from './missing';
import {noop, noRenderer} from './utils';
import LinkColumn from '../model/LinkColumn';

export default class ImageCellRenderer implements ICellRendererFactory {
  readonly title: string = 'Image';

  canRender(col: Column, mode: ERenderMode) {
    return col instanceof LinkColumn && mode === ERenderMode.CELL;
  }

  create(col: LinkColumn) {
    return {
      template: `<div></div>`,
      update: (n: HTMLElement, d: IDataRow) => {
        const missing = renderMissingDOM(n, col, d);
        const v = col.getLink(d);
        n.title = v ? v.alt : '';
        n.style.backgroundImage = missing || !v ? null : `url('${v.href}')`;
      },
      render: noop
    };
  }

  createGroup() {
    return noRenderer;
  }

  createSummary() {
    return noRenderer;
  }
}
