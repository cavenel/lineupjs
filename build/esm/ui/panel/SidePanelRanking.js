import { clear, suffix } from '../../internal';
import { Ranking, isSupportType } from '../../model';
import { aria, cssClass } from '../../styles';
import MoreRankingOptionsDialog from '../dialogs/MoreRankingOptionsDialog';
import { actionCSSClass } from '../header';
import { dialogContext } from '../dialogs';
import Hierarchy from './Hierarchy';
import SidePanelEntryVis from './SidePanelEntryVis';
/** @internal */
export default class SidePanelRanking {
    constructor(ranking, ctx, document, options) {
        this.ranking = ranking;
        this.ctx = ctx;
        this.options = options;
        this.entries = new Map();
        this.node = document.createElement('section');
        this.header = document.createElement('div');
        this.dropdown = document.createElement('div');
        this.node.classList.add(cssClass('side-panel-ranking'));
        this.header.classList.add(cssClass('side-panel-ranking-header'), cssClass('side-panel-ranking-label'));
        this.dropdown.classList.add(cssClass('side-panel-ranking-label'));
        this.dropdown.innerHTML = `<span></span><i class="${actionCSSClass('more')}" title="More …">${aria('More …')}</i>`;
        this.header.innerHTML = this.dropdown.innerHTML;
        this.header.firstElementChild.textContent = ranking.getLabel();
        this.header.lastElementChild.onclick = this.dropdown.lastElementChild.onclick =
            (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                const dialog = new MoreRankingOptionsDialog(ranking, dialogContext(ctx, 1, evt), ctx);
                dialog.open();
            };
        this.hierarchy = this.options.hierarchy ? new Hierarchy(ctx, document) : null;
        this.init();
    }
    init() {
        this.node.innerHTML = `<main class="${cssClass('side-panel-ranking-main')}"></main>`;
        if (this.hierarchy) {
            this.node.insertBefore(this.hierarchy.node, this.node.firstChild);
        }
        if (this.hierarchy) {
            this.ranking.on(suffix('.panel', Ranking.EVENT_GROUP_CRITERIA_CHANGED, Ranking.EVENT_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED), () => {
                this.updateHierarchy();
            });
        }
        this.ranking.on(suffix('.panel', Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_MOVE_COLUMN), () => {
            this.updateList();
            this.updateHierarchy();
        });
        this.ranking.on(suffix('.panel', Ranking.EVENT_LABEL_CHANGED), () => {
            this.dropdown.firstElementChild.textContent = this.header.firstElementChild.textContent =
                this.ranking.getLabel();
        });
    }
    get active() {
        return this.node.classList.contains(cssClass('active'));
    }
    set active(value) {
        this.node.classList.toggle(cssClass('active'), value);
        this.header.classList.toggle(cssClass('active'), value);
        this.dropdown.classList.toggle(cssClass('active'), value);
        if (value) {
            return;
        }
        this.updateList();
        this.updateHierarchy();
    }
    update(ctx) {
        this.ctx = ctx;
        this.updateList();
        this.updateHierarchy();
    }
    updateHierarchy() {
        if (!this.hierarchy || !this.active) {
            return;
        }
        this.hierarchy.update(this.ranking);
    }
    updateList() {
        if (!this.active) {
            return;
        }
        const node = this.node.querySelector('main');
        const columns = this.ranking.flatColumns.filter((d) => !isSupportType(d));
        if (columns.length === 0) {
            clear(node);
            this.entries.forEach((d) => d.destroy());
            this.entries.clear();
            return;
        }
        const currentEntries = new Map(this.entries);
        this.entries.clear();
        columns.forEach((col, i) => {
            const existing = currentEntries.get(col.id);
            if (existing) {
                existing.update(this.ctx);
                if (node.children[i] !== existing.node) {
                    // change node order if it doesn't match
                    node.appendChild(existing.node);
                }
                this.entries.set(col.id, existing);
                currentEntries.delete(col.id);
                return;
            }
            const entry = new SidePanelEntryVis(col, this.ctx, node.ownerDocument);
            node.insertBefore(entry.node, node.children[i]);
            this.entries.set(col.id, entry);
        });
        currentEntries.forEach((d) => {
            d.node.remove();
            d.destroy();
        });
    }
    destroy() {
        this.header.remove();
        this.node.remove();
        this.ranking.on(suffix('.panel', Ranking.EVENT_GROUP_CRITERIA_CHANGED, Ranking.EVENT_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_MOVE_COLUMN, Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_LABEL_CHANGED), null);
        this.entries.forEach((d) => d.destroy());
        this.entries.clear();
    }
}
