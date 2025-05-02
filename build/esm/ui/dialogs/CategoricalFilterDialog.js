import { SetColumn, CategoricalColumn, Ranking, BooleanColumn, } from '../../model';
import ADialog, {} from './ADialog';
import { forEach } from './utils';
import { cssClass, engineCssClass } from '../../styles';
import { isCategoryIncluded } from '../../model/internalCategorical';
/** @internal */
export default class CategoricalFilterDialog extends ADialog {
    constructor(column, dialog, ctx) {
        super(dialog, {
            livePreview: 'filter',
        });
        this.column = column;
        this.ctx = ctx;
        this.before = this.column.getFilter() || { filter: '', filterMissing: false };
    }
    build(node) {
        node.insertAdjacentHTML('beforeend', `<div class="${cssClass('dialog-table')}">
        <input type="text" placeholder="Filter categories..." class="${cssClass('category-filter-input')}" data-filter="">
        <label class="${cssClass('checkbox')} ${cssClass('dialog-filter-table-entry')}">
          <input type="checkbox" checked>
          <span>
            <span class="${cssClass('dialog-filter-table-color')}"></span>
            <div>Un/Select All</div>
          </span>
        </label>
        ${this.column.categories
            .map((c) => `<label class="${cssClass('checkbox')} ${cssClass('dialog-filter-table-entry')}" data-cat="">
          <input data-cat="" type="checkbox"${isCategoryIncluded(this.before, c) ? 'checked' : ''}>
          <span>
            <span class="${cssClass('dialog-filter-table-color')}" style="background-color: ${this.ctx.sanitize(c.color)}"></span>
            <div class="${cssClass('dialog-filter-table-entry-label')}"> </div>
            <a href="#" class="${cssClass('dialog-filter-table-only')}" data-cat="${c.name}">[Only]</a>&nbsp;
            <div class="${cssClass('dialog-filter-table-entry-stats')}"></div>
          </span>
        </label>`)
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
    </div>`);
        const filterInput = node.querySelector(`.${cssClass('category-filter-input')}`);
        const categoryLabels = node.querySelectorAll(`label.${cssClass('checkbox')}[data-cat]`);
        // Focus the filter input when the dialog is shown
        setTimeout(() => filterInput.focus(), 10);
        filterInput.addEventListener('input', () => {
            const filterValue = filterInput.value.toLowerCase();
            categoryLabels.forEach((label) => {
                var _a, _b;
                const categoryLabel = (_b = (_a = label.querySelector(`.${cssClass('dialog-filter-table-entry-label')}`)) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                if (categoryLabel && categoryLabel.includes(filterValue)) {
                    label.style.display = '';
                }
                else {
                    label.style.display = 'none';
                }
            });
        });
        node.querySelectorAll(`.${cssClass('dialog-filter-table-only')}`).forEach((onlyLink) => {
            onlyLink.addEventListener('click', (event) => {
                event.preventDefault();
                // Uncheck Select All checkbox
                const selectAll = this.findInput('input:not([data-cat]):not([data-filter])');
                selectAll.checked = false;
                const catName = event.target.dataset.cat;
                // Uncheck all categories
                forEach(node, 'input[data-cat]', (checkbox) => {
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
                const targetCheckbox = node.querySelector(`input[data-cat][data-cat="${catName}"]`);
                if (targetCheckbox) {
                    targetCheckbox.checked = true;
                }
                this.submit(); // Ensures the filter is applied immediately
            });
        });
        const categories = this.column.categories;
        categoryLabels.forEach((n, i) => {
            const cat = categories[i];
            n.firstElementChild.dataset.cat = cat.name;
            n.querySelector(`.${cssClass('dialog-filter-table-entry-label')}`).textContent = cat.label;
        });
        Array.from(node.querySelectorAll(`label.${cssClass('checkbox')}[data-cat]`)).forEach((n, i) => {
            const cat = categories[i];
            n.firstElementChild.dataset.cat = cat.name;
            n.querySelector(`.${cssClass('dialog-filter-table-entry-label')}`).textContent = cat.label;
        });
        // selectAll
        const selectAll = this.findInput('input:not([data-cat]):not([data-filter])');
        selectAll.onchange = () => {
            forEach(node, 'input[data-cat],input[data-missing]', (n) => (n.checked = selectAll.checked));
        };
        if (this.column instanceof SetColumn) {
            const some = this.before.mode !== 'every';
            node.insertAdjacentHTML('beforeend', `<strong>Show rows where</strong>`);
            node.insertAdjacentHTML('beforeend', `<label class="${cssClass('checkbox')}">
        <input type="radio" ${!some ? 'checked="checked"' : ''} name="mode" value="every">
        <span>all are selected</span>
      </label>`);
            node.insertAdjacentHTML('beforeend', `<label class="${cssClass('checkbox')}" style="padding-bottom: 0.6em">
        <input type="radio" ${some ? 'checked="checked"' : ''} name="mode" value="some">
        <span>some are selected</span>
      </label>`);
        }
        this.enableLivePreviews('input[type=checkbox],input[type=radio]');
        const ranking = this.column.findMyRanker();
        if (ranking) {
            ranking.on(`${Ranking.EVENT_ORDER_CHANGED}.catFilter`, () => this.updateStats());
        }
        this.updateStats();
    }
    updateStats() {
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
            this.forEach(`label[data-cat] .${cssClass('dialog-filter-table-entry-stats')}`, (n, i) => {
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
    updateFilter(filter, filterMissing, someMode = false) {
        const noFilter = filter == null && filterMissing === false;
        const f = { filter: filter, filterMissing };
        if (this.column instanceof SetColumn) {
            f.mode = someMode ? 'some' : 'every';
        }
        this.column.setFilter(noFilter ? null : f);
    }
    reset() {
        this.forEach('input[data-cat]', (n) => (n.checked = true));
        this.findInput('input[data-missing]').checked = true;
        const mode = this.findInput('input[value=every]');
        if (mode) {
            mode.checked = true;
        }
    }
    cancel() {
        this.updateFilter(this.before.filter === '' ? null : this.before.filter, this.before.filterMissing, this.before.mode === 'some');
    }
    submit() {
        let f = this.forEach('input[data-cat]:checked', (n) => n.dataset.cat);
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
    cleanUp(action) {
        super.cleanUp(action);
        const ranking = this.column.findMyRanker();
        if (ranking) {
            ranking.on(`${Ranking.EVENT_ORDER_CHANGED}.catFilter`, null);
        }
    }
}
