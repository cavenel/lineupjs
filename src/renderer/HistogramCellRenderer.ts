import {dragHandle, IDragHandleOptions, normalizedStatsBuilder, IStatistics, round, getNumberOfBins} from '../internal';
import {Column, IDataRow, IOrderedGroup, INumberColumn, INumbersColumn, isNumberColumn, isNumbersColumn, IMapAbleColumn, isMapAbleColumn} from '../model';
import InputNumberDialog from '../ui/dialogs/InputNumberDialog';
import {filterMissingNumberMarkup, updateFilterMissingNumberMarkup} from '../ui/missing';
import {colorOf} from './impose';
import {IRenderContext, ERenderMode, ICellRendererFactory, IImposer} from './interfaces';
import {renderMissingDOM} from './missing';
import {cssClass} from '../styles';
import {histogramRender, histogramTemplate, IHistogramLike} from './histogram';

/** @internal */
export default class HistogramCellRenderer implements ICellRendererFactory {
  readonly title = 'Histogram';

  canRender(col: Column, mode: ERenderMode) {
    return (isNumberColumn(col) && mode !== ERenderMode.CELL) || (isNumbersColumn(col) && mode === ERenderMode.CELL);
  }

  create(col: INumbersColumn, _context: IRenderContext, imposer?: IImposer) {
    const {template, render, guessedBins} = getHistDOMRenderer(col, imposer);
    return {
      template: `${template}</div>`,
      update: (n: HTMLElement, row: IDataRow) => {
        if (renderMissingDOM(n, col, row)) {
          return;
        }
        const b = normalizedStatsBuilder(guessedBins);
        for (const n of col.getNumbers(row)) {
          b.push(n);
        }
        const hist = b.build();
        render(n, hist);
      }
    };
  }

  createGroup(col: INumberColumn, context: IRenderContext, imposer?: IImposer) {
    const {template, render} = getHistDOMRenderer(col, imposer);
    return {
      template: `${template}</div>`,
      update: (n: HTMLElement, group: IOrderedGroup) => {
        return context.tasks.groupNumberStats(col, group).then((r) => {
          if (typeof r === 'symbol') {
            return;
          }
          const {summary, group} = r;

          render(n, group, summary);
        });
      }
    };
  }

  createSummary(col: INumberColumn, context: IRenderContext, interactive: boolean, imposer?: IImposer) {
    const r = getHistDOMRenderer(col, imposer);

    const staticHist = !interactive || !isMapAbleColumn(col);
    return staticHist ? staticSummary(col, context, r.template, r.render) : interactiveSummary(<IMapAbleColumn>col, context, r.template, r.render);
  }
}


function staticSummary(col: INumberColumn, context: IRenderContext, template: string, render: (n: HTMLElement, stats: IStatistics, unfiltered?: IStatistics) => void) {
  if (isMapAbleColumn(col)) {
    const range = col.getRange();
    template += `<span class="${cssClass('mapping-hint')}">${range[0]}</span><span class="${cssClass('mapping-hint')}">${range[1]}</span>`;
  }
  return {
    template: `${template}</div>`,
    update: (node: HTMLElement) => {
      if (isMapAbleColumn(col)) {
        const range = col.getRange();
        Array.from(node.getElementsByTagName('span')).forEach((d: HTMLElement, i) => d.textContent = range[i]);
      }

      return context.tasks.summaryNumberStats(col).then((r) => {
        if (typeof r === 'symbol') {
          return;
        }
        const {summary} = r;

        node.classList.toggle(cssClass('missing'), !summary);
        if (!summary) {
          return;
        }
        render(node, summary);
      });
    }
  };
}

function interactiveSummary(col: IMapAbleColumn, context: IRenderContext, template: string, render: (n: HTMLElement, stats: IStatistics, unfiltered?: IStatistics) => void) {
  const f = filter(col);
  template += `
      <div class="${cssClass('histogram-min-hint')}" style="width: ${f.percent(f.filterMin)}%"></div>
      <div class="${cssClass('histogram-max-hint')}" style="width: ${100 - f.percent(f.filterMax)}%"></div>
      <div class="${cssClass('histogram-min')}" data-value="${round(f.filterMin, 2)}" style="left: ${f.percent(f.filterMin)}%" title="min filter, drag or shift click to change"></div>
      <div class="${cssClass('histogram-max')}" data-value="${round(f.filterMax, 2)}" style="right: ${100 - f.percent(f.filterMax)}%" title="max filter, drag or shift click to change"></div>
      ${filterMissingNumberMarkup(f.filterMissing, 0)}
    `;

  let updateFilter: (missing: number, col: IMapAbleColumn) => void;

  return {
    template: `${template}</div>`,
    update: (node: HTMLElement) => {
      if (!updateFilter) {
        updateFilter = initFilter(node, col, context);
      }
      return context.tasks.summaryNumberStats(col).then((r) => {
        if (typeof r === 'symbol') {
          return;
        }
        const {summary, data} = r;

        updateFilter(data ? data.missing : (summary ? summary.missing : 0), col);

        node.classList.add(cssClass('histogram-i'));
        node.classList.toggle(cssClass('missing'), !summary);
        if (!summary) {
          return;
        }
        render(node, summary, data);
      });
    }
  };
}

function initFilter(node: HTMLElement, col: IMapAbleColumn, context: IRenderContext) {
  const min = <HTMLElement>node.getElementsByClassName(cssClass('histogram-min'))[0];
  const max = <HTMLElement>node.getElementsByClassName(cssClass('histogram-max'))[0];
  const minHint = <HTMLElement>node.getElementsByClassName(cssClass('histogram-min-hint'))[0];
  const maxHint = <HTMLElement>node.getElementsByClassName(cssClass('histogram-max-hint'))[0];
  const filterMissing = <HTMLInputElement>node.getElementsByTagName('input')[0];

  const setFilter = () => {
    const f = filter(col);
    const minValue = f.unpercent(parseFloat(min.style.left!));
    const maxValue = f.unpercent(100 - parseFloat(max.style.right!));
    col.setFilter({
      filterMissing: filterMissing.checked,
      min: Math.abs(minValue - f.domain[0]) < 0.001 ? NaN : minValue,
      max: Math.abs(maxValue - f.domain[1]) < 0.001 ? NaN : maxValue
    });
  };

  min.onclick = (evt) => {
    if (!evt.shiftKey && !evt.ctrlKey) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();

    const f = filter(col);
    const value = f.unpercent(parseFloat(min.style.left!));

    const dialogCtx = {
      attachment: min,
      manager: context.dialogManager,
      level: 1,
      idPrefix: context.idPrefix
    };

    const dialog = new InputNumberDialog(dialogCtx, (newValue) => {
      minHint.style.width = `${f.percent(newValue)}%`;
      min.dataset.value = round(newValue, 2).toString();
      min.style.left = `${f.percent(newValue)}%`;
      min.classList.toggle(cssClass('swap-hint'), f.percent(newValue) > 15);
      setFilter();
    }, {
        value, min: f.domain[0], max: f.domain[1]
      });
    dialog.open();
  };

  max.onclick = (evt) => {
    if (!evt.shiftKey && !evt.ctrlKey) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();

    const f = filter(col);
    const value = f.unpercent(100 - parseFloat(max.style.right!));

    const dialogCtx = {
      attachment: max,
      manager: context.dialogManager,
      level: 1,
      idPrefix: context.idPrefix
    };

    const dialog = new InputNumberDialog(dialogCtx, (newValue) => {
      maxHint.style.width = `${100 - f.percent(newValue)}%`;
      max.dataset.value = round(newValue, 2).toString();
      max.style.right = `${100 - f.percent(newValue)}%`;
      min.classList.toggle(cssClass('swap-hint'), f.percent(newValue) < 85);
      setFilter();
    }, {
        value, min: f.domain[0], max: f.domain[1]
      });
    dialog.open();
  };

  filterMissing.onchange = () => setFilter();

  const options: Partial<IDragHandleOptions> = {
    minDelta: 0,
    filter: (evt) => evt.button === 0 && !evt.shiftKey && !evt.ctrlKey,
    onStart: (handle) => handle.classList.add(cssClass('hist-dragging')),
    onDrag: (handle, x) => {
      const total = node.clientWidth;
      const px = Math.max(0, Math.min(x, total));
      const percent = Math.round(100 * px / total);
      const domain = col.getMapping().domain;
      (<HTMLElement>handle).dataset.value = round(((percent / 100) * (domain[1] - domain[0]) + domain[0]), 2).toString();

      if ((<HTMLElement>handle).classList.contains(cssClass('histogram-min'))) {
        handle.style.left = `${percent}%`;
        handle.classList.toggle(cssClass('swap-hint'), percent > 15);
        minHint.style.width = `${percent}%`;
        return;
      }
      handle.style.right = `${100 - percent}%`;
      handle.classList.toggle(cssClass('swap-hint'), percent < 85);
      maxHint.style.width = `${100 - percent}%`;
    },
    onEnd: (handle) => {
      handle.classList.remove(cssClass('hist-dragging'));
      setFilter();
    }
  };
  dragHandle(min, options);
  dragHandle(max, options);

  return (missing: number, actCol: IMapAbleColumn) => {
    col = actCol;
    const f = filter(col);
    minHint.style.width = `${f.percent(f.filterMin)}%`;
    maxHint.style.width = `${100 - f.percent(f.filterMax)}%`;
    min.dataset.value = round(f.filterMin, 2).toString();
    max.dataset.value = round(f.filterMax, 2).toString();
    min.style.left = `${f.percent(f.filterMin)}%`;
    max.style.right = `${100 - f.percent(f.filterMax)}%`;
    filterMissing.checked = f.filterMissing;
    updateFilterMissingNumberMarkup(<HTMLElement>filterMissing.parentElement, missing);
  };
}

/** @internal */
export function getHistDOMRenderer(col: INumberColumn, imposer?: IImposer) {
  const ranking = col.findMyRanker();
  const guessedBins = ranking ? getNumberOfBins(ranking.getOrderLength()) : 10;
  const formatter = col.getNumberFormat();

  const render = (n: HTMLElement, stats: IHistogramLike<number>, unfiltered?: IHistogramLike<number>) => {
    return histogramRender(n, stats, unfiltered || null, formatter, (bin) => colorOf(col, null, imposer, (bin.x1 + bin.x0) / 2)!);
  };
  return {
    template: histogramTemplate(guessedBins),
    render,
    guessedBins
  };
}


function filter(col: IMapAbleColumn) {
  const filter = col.getFilter();
  const domain = col.getMapping().domain;
  const percent = (v: number) => Math.round(100 * (v - domain[0]) / (domain[1] - domain[0]));
  const unpercent = (v: number) => ((v / 100) * (domain[1] - domain[0]) + domain[0]);
  const filterMin = isFinite(filter.min) ? filter.min : domain[0];
  const filterMax = isFinite(filter.max) ? filter.max : domain[1];
  return {
    filterMissing: filter.filterMissing,
    domain,
    percent,
    unpercent,
    filterMin,
    filterMax
  };
}
