import { suffix } from '../../internal';
import { categoryOfDesc, createAggregateDesc, createGroupDesc, createImpositionDesc, createNestedDesc, createRankDesc, createReduceDesc, createScriptDesc, createSelectionDesc, createStackDesc, Ranking, } from '../../model';
import { DataProvider } from '../../provider';
import { aria, cssClass } from '../../styles';
import ChooseRankingDialog from '../dialogs/ChooseRankingDialog';
import { dialogContext } from '../dialogs';
import SearchBox, {} from './SearchBox';
import SidePanelRanking from './SidePanelRanking';
import { format } from 'd3-format';
import { setText } from '../../renderer/utils';
function isWrapper(item) {
    return item.desc != null;
}
export default class SidePanel {
    constructor(ctx, document, options = {}) {
        this.ctx = ctx;
        this.options = {
            additionalDescs: [
                createStackDesc('Weighted Sum'),
                createScriptDesc('Scripted Formula'),
                createNestedDesc('Nested'),
                createReduceDesc(),
                createImpositionDesc(),
                createRankDesc(),
                createSelectionDesc(),
                createGroupDesc(),
                createAggregateDesc(),
            ],
            chooser: true,
            hierarchy: true,
            placeholder: 'Add Column...',
            formatItem: (item, node) => {
                const w = isWrapper(item) ? item : item.children[0];
                node.dataset.typeCat = w.category.name;
                node.classList.add(cssClass('typed-icon'));
                if (isWrapper(item)) {
                    node.dataset.type = w.desc.type;
                }
                if (node.parentElement) {
                    node.parentElement.classList.add(cssClass('feature-model'));
                    node.parentElement.classList.toggle(cssClass('feature-advanced'), w.category.featureLevel === 'advanced');
                    node.parentElement.classList.toggle(cssClass('feature-basic'), w.category.featureLevel === 'basic');
                    if (isWrapper(item)) {
                        const summary = w.desc.summary || w.desc.description;
                        node.classList.toggle(cssClass('searchbox-summary-entry'), Boolean(summary));
                        if (summary) {
                            const label = node.ownerDocument.createElement('span');
                            if (w.desc.labelAsHTML === true) {
                                label.innerHTML = w.desc.label;
                            }
                            else if (typeof w.desc.labelAsHTML === 'function') {
                                label.innerHTML = w.desc.labelAsHTML(w.desc, 'chooser');
                            }
                            else {
                                label.textContent = w.desc.label;
                            }
                            node.appendChild(label);
                            const desc = node.ownerDocument.createElement('span');
                            if (w.desc.summaryAsHTML === true) {
                                desc.innerHTML = summary;
                            }
                            else if (typeof w.desc.summaryAsHTML === 'function') {
                                desc.innerHTML = w.desc.summaryAsHTML(w.desc, 'chooser');
                            }
                            else {
                                desc.textContent = summary;
                            }
                            node.appendChild(desc);
                            return undefined;
                        }
                    }
                }
                if (isWrapper(item) && item.desc.labelAsHTML) {
                    if (typeof item.desc.labelAsHTML === 'function') {
                        node.innerHTML = item.desc.labelAsHTML(item.desc, 'chooser');
                    }
                    else {
                        node.innerHTML = item.text;
                    }
                }
                else {
                    setText(node, item.text);
                }
            },
            collapseable: true,
        };
        this.chooser = null;
        this.descs = [];
        this.rankings = [];
        Object.assign(this.options, options);
        this.node = document.createElement('aside');
        this.node.classList.add(cssClass('side-panel'));
        this.search = this.options.chooser ? new SearchBox(this.options) : null;
        this.data = ctx.provider;
        this.init();
        this.update(ctx);
    }
    init() {
        this.node.innerHTML = `
      <aside class="${cssClass('stats')}"></aside>
      <header class="${cssClass('side-panel-rankings')}">
        <i class="${cssClass('action')}" title="Choose …">${aria('Choose …')}</i>
      </header>
      <main class="${cssClass('side-panel-main')}"></main>
    `;
        {
            const choose = this.node.querySelector('header > i');
            choose.onclick = (evt) => {
                evt.stopPropagation();
                const dialog = new ChooseRankingDialog(this.rankings.map((d) => d.dropdown), dialogContext(this.ctx, 1, evt));
                dialog.open();
            };
        }
        if (this.options.collapseable) {
            this.node.insertAdjacentHTML('beforeend', `<div class="${cssClass('collapser')}" title="Collapse Panel">${aria('Collapse Panel')}</div>`);
            const last = this.node.lastElementChild;
            last.onclick = () => (this.collapsed = !this.collapsed);
            this.collapsed = this.options.collapseable === 'collapsed';
        }
        this.initChooser();
        this.changeDataStorage(null, this.data);
    }
    initChooser() {
        if (!this.search) {
            return;
        }
        this.chooser = this.node.ownerDocument.createElement('header');
        this.chooser.appendChild(this.chooser.ownerDocument.createElement('form'));
        this.chooser.classList.add(cssClass('side-panel-chooser'));
        this.chooser.firstElementChild.appendChild(this.search.node);
        this.search.on(SearchBox.EVENT_SELECT, (panel) => {
            const col = this.data.create(panel.desc);
            if (!col) {
                return;
            }
            const a = this.active;
            if (a) {
                a.ranking.push(col);
            }
        });
    }
    get active() {
        return this.rankings.find((d) => d.active);
    }
    changeDataStorage(old, data) {
        if (old) {
            old.on(suffix('.panel', DataProvider.EVENT_ADD_RANKING, DataProvider.EVENT_REMOVE_RANKING, DataProvider.EVENT_ADD_DESC, DataProvider.EVENT_REMOVE_DESC, DataProvider.EVENT_CLEAR_DESC, DataProvider.EVENT_ORDER_CHANGED, DataProvider.EVENT_SELECTION_CHANGED), null);
        }
        this.data = data;
        const wrapDesc = (desc) => ({
            desc,
            category: categoryOfDesc(desc, data.columnTypes),
            id: `${desc.type}@${desc.label}`,
            text: desc.label,
        });
        this.descs.splice(0, this.descs.length, ...data
            .getColumns()
            .filter((d) => d.visible !== false)
            .concat(this.options.additionalDescs)
            .map(wrapDesc));
        data.on(`${DataProvider.EVENT_ADD_DESC}.panel`, (desc) => {
            if (desc.visible !== false) {
                this.descs.push(wrapDesc(desc));
                this.updateChooser();
            }
        });
        data.on(`${DataProvider.EVENT_CLEAR_DESC}.panel`, () => {
            this.descs.splice(0, this.descs.length);
            this.updateChooser();
        });
        data.on(`${DataProvider.EVENT_REMOVE_DESC}.panel`, (desc) => {
            if (desc.visible !== false) {
                const index = this.descs.findIndex((d) => d.desc === desc);
                if (index >= 0) {
                    this.descs.splice(index, 1);
                    this.updateChooser();
                }
            }
        });
        data.on(suffix('.panel', DataProvider.EVENT_SELECTION_CHANGED, DataProvider.EVENT_ORDER_CHANGED), () => {
            this.updateStats();
        });
        data.on(suffix('.panel', DataProvider.EVENT_ADD_RANKING), (ranking, index) => {
            this.createEntry(ranking, index);
            this.makeActive(index);
        });
        data.on(suffix('.panel', DataProvider.EVENT_REMOVE_RANKING), (_, index) => {
            if (index < 0) {
                // remove all
                this.rankings.splice(0, this.rankings.length).forEach((d) => d.destroy());
                this.node.querySelector('header').dataset.count = '0';
                this.makeActive(-1);
                return;
            }
            const r = this.rankings.splice(index, 1)[0];
            this.node.querySelector('header').dataset.count = String(this.rankings.length);
            r.destroy();
            if (r.active) {
                this.makeActive(this.rankings.length === 0 ? -1 : Math.max(index - 1, 0));
            }
        });
        this.rankings.splice(0, this.rankings.length).forEach((d) => d.destroy());
        data.getRankings().forEach((d, i) => {
            this.createEntry(d, i);
        });
        if (this.rankings.length > 0) {
            this.makeActive(0);
        }
        this.updateStats();
    }
    createEntry(ranking, index) {
        const entry = new SidePanelRanking(ranking, this.ctx, this.node.ownerDocument, this.options);
        const header = this.node.querySelector('header');
        const main = this.node.querySelector('main');
        header.insertBefore(entry.header, header.children[index + 1]); // for the action
        header.dataset.count = String(this.rankings.length + 1);
        entry.header.onclick = (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.makeActive(this.rankings.indexOf(entry));
        };
        entry.dropdown.onclick = entry.header.onclick = (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.ctx.dialogManager.removeAboveLevel(0);
            this.makeActive(this.rankings.indexOf(entry));
        };
        main.insertBefore(entry.node, main.children[index]);
        this.rankings.splice(index, 0, entry);
    }
    get collapsed() {
        return this.node.classList.contains(cssClass('collapsed'));
    }
    set collapsed(value) {
        this.node.classList.toggle(cssClass('collapsed'), value);
        if (value) {
            return;
        }
        this.updateChooser();
        this.updateStats();
        this.updateRanking();
    }
    makeActive(index) {
        this.rankings.forEach((d, i) => (d.active = index === i));
        const active = this.active;
        if (active && this.chooser) {
            active.node.insertAdjacentElement('afterbegin', this.chooser);
            // scroll to body
            const parent = this.node.closest(`.${cssClass()}`);
            const body = parent ? parent.querySelector(`article[data-ranking="${active.ranking.id}"]`) : null;
            if (body) {
                body.scrollIntoView();
            }
        }
        this.updateRanking();
    }
    updateRanking() {
        const active = this.active;
        if (active && !this.collapsed) {
            active.update(this.ctx);
        }
    }
    update(ctx) {
        const bak = this.data;
        this.ctx = ctx;
        if (ctx.provider !== bak) {
            this.changeDataStorage(bak, ctx.provider);
        }
        this.updateChooser();
        this.updateStats();
        const active = this.active;
        if (active) {
            active.update(ctx);
        }
    }
    updateStats() {
        if (this.collapsed) {
            return;
        }
        const stats = this.node.querySelector(`.${cssClass('stats')}`);
        const s = this.data.getSelection();
        const clearSelection = s.length === 0
            ? ''
            : `<i class="${cssClass('action')} ${cssClass('action-clear-selection')} ${cssClass('stats-clear-selection')}" title="Clear selection"><span class="${cssClass('aria')}" aria-hidden="true">Clear Selection</span></i>`;
        const r = this.data.getFirstRanking();
        const f = format(',d');
        const visible = r ? r.getGroups().reduce((a, b) => a + b.order.length, 0) : 0;
        const total = this.data.getTotalNumberOfRows();
        stats.innerHTML = `Showing <strong>${f(visible)}</strong> of ${f(total)} items${s.length > 0 ? `; <span>${f(s.length)} selected ${clearSelection}</span>` : ''}${visible < total
            ? ` <i class="${cssClass('action')} ${cssClass('action-filter')} ${cssClass('stats-reset')}" title="Reset filters"><span>Reset</span></i>`
            : ''}`;
        const resetButton = stats.querySelector(`.${cssClass('stats-reset')}`);
        if (resetButton) {
            resetButton.onclick = (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                this.data.clearFilters();
            };
        }
        const clearButton = stats.querySelector(`.${cssClass('stats-clear-selection')}`);
        if (clearButton) {
            clearButton.onclick = (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                this.data.setSelection([]);
            };
        }
    }
    destroy() {
        this.node.remove();
        if (!this.data) {
            return;
        }
        this.rankings.forEach((d) => d.destroy());
        this.rankings.length = 0;
        this.data.on(suffix('.panel', DataProvider.EVENT_ADD_RANKING, DataProvider.EVENT_REMOVE_RANKING, DataProvider.EVENT_ADD_DESC), null);
    }
    static groupByType(entries) {
        const map = new Map();
        entries.forEach((entry) => {
            if (!map.has(entry.category)) {
                map.set(entry.category, [entry]);
            }
            else {
                map.get(entry.category).push(entry);
            }
        });
        return Array.from(map)
            .map(([key, value]) => {
            return {
                text: key.label,
                order: key.order,
                children: value.sort((a, b) => a.text.localeCompare(b.text)),
            };
        })
            .sort((a, b) => a.order - b.order);
    }
    updateChooser() {
        if (!this.search || this.collapsed) {
            return;
        }
        this.search.data = SidePanel.groupByType(this.descs);
    }
}
