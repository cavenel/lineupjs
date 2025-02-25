import {
  SetColumn,
  CategoricalColumn,
  type ICategoricalFilter,
  type ISetCategoricalFilter,
  Ranking,
  BooleanColumn,
} from '../../model';
import ADialog, { type IDialogContext } from './ADialog';
import { forEach } from './utils';
import { cssClass, engineCssClass } from '../../styles';
import { isCategoryIncluded } from '../../model/internalCategorical';
import type { IRankingHeaderContext } from '../interfaces';

/** @internal */
export default class CategoricalFilterDialog extends ADialog {
  private readonly before: ICategoricalFilter;

  constructor(
    private readonly column: CategoricalColumn | SetColumn | BooleanColumn,
    dialog: IDialogContext,
    private readonly ctx: IRankingHeaderContext
  ) {
    super(dialog, {
      livePreview: 'filter',
    });
    this.before = this.column.getFilter() || { filter: '', filterMissing: false };
  }

  protected build(node: HTMLElement) {
    node.insertAdjacentHTML(
      'beforeend',
      `<div class="${cssClass('dialog-table')}">
        <input type="text" placeholder="Filter categories..." class="${cssClass('category-filter-input')}" data-filter="">
        <label class="${cssClass('checkbox')} ${cssClass('dialog-filter-table-entry')}">
          <input type="checkbox" checked>
          <span>
            <span class="${cssClass('dialog-filter-table-color')}"></span>
            <div>Un/Select All</div>
          </span>
        </label>
        ${this.column.categories
          .map(
            (c) => `<label class="${cssClass('checkbox')} ${cssClass('dialog-filter-table-entry')}" data-cat="">
          <input data-cat="" type="checkbox"${isCategoryIncluded(this.before, c) ? 'checked' : ''}>
          <span>
            <span class="${cssClass('dialog-filter-table-color')}" style="background-color: ${this.ctx.sanitize(
              c.color
            )}"></span>
            <div class="${cssClass('dialog-filter-table-entry-label')}"> </div>
            <a href="#" class="${cssClass('dialog-filter-table-only')}" data-cat="${c.name}">[Only]</a>&nbsp;
            <div class="${cssClass('dialog-filter-table-entry-stats')}"></div>
          </span>
        </label>`
          )
          .join('')}
        <label class="${cssClass('checkbox')} ${cssClass('dialog-filter-table-entry')}" data-missing="">
          <input type="checkbox" ${!this.before.filterMissing ? 'checked="checked"' : ''} data-missing="">
          <span>
            <span class="${cssClass('dialog-filter-table-color')} ${cssClass('missing')}"></span>
            <div class="${cssClass('dialog-filter-table-entry-label')}">missing value rows</div>
            <a href="#" class="${cssClass('dialog-filter-table-only')}" data-cat="">[Only]</a>&nbsp;
            <div class="${cssClass('dialog-filter-table-entry-stats')}">0</div>
          </span>
        </label>
    </div>`
    );
    
    const filterInput = node.querySelector(`.${cssClass('category-filter-input')}`) as HTMLInputElement;
    const categoryLabels = node.querySelectorAll(`label.${cssClass('checkbox')}[data-cat]`);
    // Focus the filter input when the dialog is shown
    setTimeout(() => filterInput.focus(), 10);
    filterInput.addEventListener('input', () => {
      const filterValue = filterInput.value.toLowerCase();
      categoryLabels.forEach((label) => {
        const categoryLabel = label.querySelector(`.${cssClass('dialog-filter-table-entry-label')}`)?.textContent?.toLowerCase();
        if (categoryLabel && categoryLabel.includes(filterValue)) {
          (label as HTMLElement).style.display = '';
        } else {
          (label as HTMLElement).style.display = 'none';
        }
      });
    });
    node.querySelectorAll(`.${cssClass('dialog-filter-table-only')}`).forEach((onlyLink) => {
      onlyLink.addEventListener('click', (event) => {
        event.preventDefault();

        // Uncheck Select All checkbox
        const selectAll = this.findInput('input:not([data-cat]):not([data-filter])');
        selectAll.checked = false;

        const catName = (event.target as HTMLElement).dataset.cat;
        
        // Uncheck all categories
        forEach(node, 'input[data-cat]', (checkbox: HTMLInputElement) => {
          checkbox.checked = false;
        });
    
        // Uncheck missing value rows if the category is not missing
        const missingCheckbox = this.findInput('input[data-missing]');
        if (catName) {
          missingCheckbox.checked = false;
        }
        else {
          missingCheckbox.checked = true;
        }

        // Check only the clicked category
        const targetCheckbox = node.querySelector(`input[data-cat][data-cat="${catName}"]`) as HTMLInputElement;
        if (targetCheckbox) {
          targetCheckbox.checked = true;
        }
        this.submit(); // Ensures the filter is applied immediately
      });
    });
    const categories = this.column.categories;
    categoryLabels.forEach((n, i) => {
      const cat = categories[i];
      (n.firstElementChild as HTMLElement).dataset.cat = cat.name;
      n.querySelector(`.${cssClass('dialog-filter-table-entry-label')}`).textContent = cat.label;
    });
    Array.from(node.querySelectorAll(`label.${cssClass('checkbox')}[data-cat]`)).forEach((n, i) => {
      const cat = categories[i];
      (n.firstElementChild as HTMLElement).dataset.cat = cat.name;
      n.querySelector(`.${cssClass('dialog-filter-table-entry-label')}`).textContent = cat.label;
    });
    // selectAll
    const selectAll = this.findInput('input:not([data-cat]):not([data-filter])');
    selectAll.onchange = () => {
      forEach(node, 'input[data-cat],input[data-missing]', (n: HTMLInputElement) => (n.checked = selectAll.checked));
    };
    if (this.column instanceof SetColumn) {
      const some = (this.before as ISetCategoricalFilter).mode !== 'every';
      node.insertAdjacentHTML('beforeend', `<strong>Show rows where</strong>`);
      node.insertAdjacentHTML(
        'beforeend',
        `<label class="${cssClass('checkbox')}">
        <input type="radio" ${!some ? 'checked="checked"' : ''} name="mode" value="every">
        <span>all are selected</span>
      </label>`
      );
      node.insertAdjacentHTML(
        'beforeend',
        `<label class="${cssClass('checkbox')}" style="padding-bottom: 0.6em">
        <input type="radio" ${some ? 'checked="checked"' : ''} name="mode" value="some">
        <span>some are selected</span>
      </label>`
      );
    }
    this.enableLivePreviews('input[type=checkbox],input[type=radio]');

    const ranking = this.column.findMyRanker()!;
    if (ranking) {
      ranking.on(`${Ranking.EVENT_ORDER_CHANGED}.catFilter`, () => this.updateStats());
    }
    this.updateStats();
  }

  private updateStats() {
    const ready = this.ctx.provider
      .getTaskExecutor()
      .summaryCategoricalStats(this.column)
      .then((r) => {
        if (typeof r === 'symbol') {
          return;
        }
        const { summary, data } = r;

        if (!summary || !data) {
          return;
        }
        const missingNode = this.find(`label[data-missing] .${cssClass('dialog-filter-table-entry-stats')}`);
        missingNode.textContent = `${summary.missing.toLocaleString()}/${data.count.toLocaleString()}`;
        this.forEach(`label[data-cat] .${cssClass('dialog-filter-table-entry-stats')}`, (n: HTMLElement, i) => {
          const bin = summary.hist[i];
          const raw = data.hist[i];
          n.textContent = `${bin.count.toLocaleString()}/${raw.count.toLocaleString()}`;
        });
      });
    if (!ready) {
      return;
    }
    this.node.classList.add(engineCssClass('loading'));
    ready.then(() => {
      this.node.classList.remove(engineCssClass('loading'));
    });
  }

  private updateFilter(filter: string[] | null | RegExp | string, filterMissing: boolean, someMode = false) {
    const noFilter = filter == null && filterMissing === false;
    const f: ISetCategoricalFilter = { filter: filter!, filterMissing };
    if (this.column instanceof SetColumn) {
      f.mode = someMode ? 'some' : 'every';
    }
    this.column.setFilter(noFilter ? null : f);
  }

  protected reset() {
    this.forEach('input[data-cat]', (n: HTMLInputElement) => (n.checked = true));
    this.findInput('input[data-missing]').checked = true;

    const mode = this.findInput('input[value=every]');
    if (mode) {
      mode.checked = true;
    }
  }

  protected cancel() {
    this.updateFilter(
      this.before.filter === '' ? null : this.before.filter,
      this.before.filterMissing,
      (this.before as ISetCategoricalFilter).mode === 'some'
    );
  }

  protected submit() {
    let f: string[] | null = this.forEach('input[data-cat]:checked', (n: HTMLInputElement) => n.dataset.cat!);
    if (f.length === this.column.categories.length) {
      // all checked = no filter
      f = null;
    }
    // TODO
    const filterMissing = !this.findInput('input[data-missing]').checked;
    const mode = this.findInput('input[value=some]');
    this.updateFilter(f, filterMissing, mode != null && mode.checked);
    return true;
  }

  cleanUp(action: 'cancel' | 'confirm' | 'handled') {
    super.cleanUp(action);
    const ranking = this.column.findMyRanker()!;
    if (ranking) {
      ranking.on(`${Ranking.EVENT_ORDER_CHANGED}.catFilter`, null);
    }
  }
}
