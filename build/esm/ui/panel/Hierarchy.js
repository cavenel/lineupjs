import { clear } from '../../internal';
import { Column, Ranking, categoryOf, isSortingAscByDefault, isSupportType } from '../../model';
import { aria, cssClass } from '../../styles';
import AddonDialog from '../dialogs/AddonDialog';
import { actionCSSClass, updateHeader } from '../header';
import { getToolbarDialogAddons, isGroupAble, isGroupSortAble, isSortAble } from '../toolbarResolvers';
import SearchBox, {} from './SearchBox';
import { dialogContext } from '../dialogs';
/**
 * @internal
 */
export default class Hierarchy {
    constructor(ctx, document) {
        this.ctx = ctx;
        this.node = document.createElement('aside');
        this.node.classList.add(cssClass('hierarchy'), cssClass('feature-advanced'), cssClass('feature-ranking'));
        this.node.innerHTML = `
      <section class="${cssClass('group-hierarchy')}">
      </section>
      <section class="${cssClass('sort-hierarchy')}">
      </section>
      <section class="${cssClass('sort-groups-hierarchy')}">
      </section>
    `;
        const options = {
            doc: document,
            placeholder: 'Add Sort Criteria...',
            formatItem: (item, node) => {
                node.classList.add(cssClass('typed-icon'));
                node.dataset.typeCat = categoryOf(item.col).name;
                node.dataset.type = item.col.desc.type;
                const header = item.col.getHeaderLabel('reorder');
                const summary = item.col.getSummaryLabel('reorder', true);
                node.classList.toggle(cssClass('searchbox-summary-entry'), Boolean(summary));
                if (summary) {
                    const label = node.ownerDocument.createElement('span');
                    if (header.asHTML) {
                        label.innerHTML = header.content;
                    }
                    else {
                        label.textContent = header.content;
                    }
                    node.appendChild(label);
                    const desc = node.ownerDocument.createElement('span');
                    if (summary.asHTML) {
                        label.innerHTML = summary.content;
                    }
                    else {
                        label.textContent = summary.content;
                    }
                    node.appendChild(desc);
                }
                else if (header.asHTML) {
                    node.innerHTML = header.content;
                }
                else {
                    node.textContent = header.content;
                }
            },
        };
        this.groupAdder = new SearchBox(Object.assign({}, options, {
            placeholder: 'Add Grouping Criteria...',
        }));
        this.groupSortAdder = new SearchBox(Object.assign({}, options, {
            placeholder: 'Add Grouping Sort Criteria...',
        }));
        this.sortAdder = new SearchBox(options);
    }
    update(ranking) {
        if (!ranking) {
            this.node.style.display = 'none';
            return;
        }
        this.node.style.display = null;
        this.renderGroups(ranking, this.node.firstElementChild);
        this.renderSorting(ranking, this.node.children[1]);
        this.renderGroupSorting(ranking, this.node.lastElementChild);
    }
    render(node, items, toColumn, extras, addonKey, onChange) {
        const cache = new Map(Array.from(node.children).map((d) => [d.dataset.id, d]));
        clear(node);
        items.forEach((d) => {
            const col = toColumn(d);
            const item = cache.get(col.id);
            if (item) {
                node.appendChild(item);
                updateHeader(item, col, 'reorder', 0);
                return;
            }
            const addons = getToolbarDialogAddons(col, addonKey, this.ctx);
            node.insertAdjacentHTML('beforeend', `<div data-id="${col.id}" class="${cssClass('toolbar')} ${cssClass('hierarchy-entry')}">
      <div class="${cssClass('label')} ${cssClass('typed-icon')}"> </div>
      ${addons.length > 0 ? `<i title="Customize" class="${actionCSSClass('customize')}">${aria('Customize')}</i>` : ''}
      <i title="Move Up" class="${actionCSSClass('Move Up')}">${aria('Move Up')}</i>
      <i title="Move Down" class="${actionCSSClass('Move Down')}">${aria('Move Down')}</i>
      <i title="Remove from hierarchy" class="${actionCSSClass('Remove')}">${aria('Remove from hierarchy')}</i>
      </div>`);
            const last = node.lastElementChild;
            last.firstElementChild.textContent = col.label;
            function prevent(evt) {
                evt.preventDefault();
                evt.stopPropagation();
            }
            last.querySelector('i[title="Move Down"]').onclick = (evt) => {
                prevent(evt);
                onChange(d, +1);
            };
            last.querySelector('i[title="Move Up"]').onclick = (evt) => {
                prevent(evt);
                onChange(d, -1);
            };
            last.querySelector('i[title^=Remove]').onclick = (evt) => {
                prevent(evt);
                onChange(d, 0);
            };
            if (addons.length > 0) {
                last.querySelector('i[title=Customize]').onclick = (evt) => {
                    prevent(evt);
                    this.customize(col, addons, evt);
                };
            }
            extras(d, last);
            updateHeader(last, col, 'reorder', 0);
        });
    }
    renderGroups(ranking, node) {
        const groups = ranking.getGroupCriteria();
        if (groups.length === 0) {
            clear(node);
            return;
        }
        const click = (col, delta) => {
            if (delta === 0) {
                col.groupByMe();
                return;
            }
            const current = col.isGroupedBy();
            col.findMyRanker().groupBy(col, current + delta);
        };
        const addButton = (_, last) => {
            last.insertAdjacentHTML('afterbegin', `<i title="Group" class="${actionCSSClass('group')}" data-group="true">${aria('Group')}</i>`);
        };
        this.render(node, groups, (d) => d, addButton, 'group', click);
        this.addGroupAdder(ranking, groups, node);
    }
    renderSorting(ranking, node) {
        const sortCriterias = ranking.getSortCriteria();
        if (sortCriterias.length === 0) {
            clear(node);
            return;
        }
        const click = ({ col }, delta) => {
            const current = col.isSortedByMe();
            if (!isFinite(delta)) {
                col.sortByMe(current.asc === 'desc', current.priority);
                return;
            }
            if (delta === 0) {
                col.sortByMe(current.asc === 'asc', -1);
                return;
            }
            col.sortByMe(current.asc === 'asc', current.priority + delta);
        };
        const addButton = (s, last) => {
            last.insertAdjacentHTML('afterbegin', `
      <i title="Sort" class="${actionCSSClass('sort')}" data-sort="${s.asc ? 'asc' : 'desc'}">${aria('Toggle Sorting')}</i>`);
            last.querySelector('i[title=Sort]').onclick = (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                click(s, Number.POSITIVE_INFINITY);
            };
        };
        this.render(node, sortCriterias, (d) => d.col, addButton, 'sort', click);
        this.addSortAdder(ranking, sortCriterias, node);
    }
    renderGroupSorting(ranking, node) {
        const sortCriterias = ranking.getGroupSortCriteria();
        if (sortCriterias.length === 0) {
            clear(node);
            return;
        }
        const click = ({ col }, delta) => {
            const current = col.isGroupSortedByMe();
            if (!isFinite(delta)) {
                col.groupSortByMe(current.asc === 'desc', current.priority);
                return;
            }
            if (delta === 0) {
                col.groupSortByMe(current.asc === 'asc', -1);
                return;
            }
            col.groupSortByMe(current.asc === 'asc', current.priority + delta);
        };
        const addButton = (s, last) => {
            last.insertAdjacentHTML('afterbegin', `
      <i title="Sort Group" class="${actionCSSClass('sort-groups')}" data-sort="${s.asc ? 'asc' : 'desc'}">${aria('Toggle Sorting')}</i>`);
            last.querySelector('i[title="Sort Group"]').onclick = (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                click(s, Number.POSITIVE_INFINITY);
            };
        };
        this.render(node, sortCriterias, (d) => d.col, addButton, 'sortGroup', click);
        this.addGroupSortAdder(ranking, sortCriterias, node);
    }
    addAdder(adder, ranking, addonKey, current, node, check, onSelect) {
        const used = new Set(current);
        adder.data = ranking.children
            .filter((col) => !isSupportType(col) && !used.has(col) && check(col))
            .map((col) => ({ col, id: col.id, text: col.label }));
        adder.on(SearchBox.EVENT_SELECT, (item) => {
            const addons = getToolbarDialogAddons(item.col, addonKey, this.ctx);
            if (addons.length > 0) {
                this.customize(item.col, addons, adder.node, () => onSelect(item.col));
            }
            else {
                onSelect(item.col);
            }
        });
        if (adder.data.length <= 0) {
            return;
        }
        const wrapper = node.ownerDocument.createElement('footer');
        wrapper.appendChild(adder.node);
        wrapper.classList.add(cssClass('hierarchy-adder'));
        node.appendChild(wrapper);
    }
    addSortAdder(ranking, sortCriterias, node) {
        this.addAdder(this.sortAdder, ranking, 'sort', sortCriterias.map((d) => d.col), node, (d) => isSortAble(d, this.ctx), (col) => {
            ranking.sortBy(col, isSortingAscByDefault(col), sortCriterias.length);
        });
    }
    addGroupAdder(ranking, groups, node) {
        this.addAdder(this.groupAdder, ranking, 'group', groups, node, (d) => isGroupAble(d, this.ctx), (col) => {
            ranking.groupBy(col, groups.length);
        });
    }
    addGroupSortAdder(ranking, sortCriterias, node) {
        this.addAdder(this.groupSortAdder, ranking, 'sortGroup', sortCriterias.map((d) => d.col), node, (d) => isGroupSortAble(d, this.ctx), (col) => {
            ranking.groupSortBy(col, isSortingAscByDefault(col), sortCriterias.length);
        });
    }
    customize(col, addons, attachment, onClick) {
        const dialog = new AddonDialog(col, addons, dialogContext(this.ctx, 0, attachment), this.ctx, onClick);
        dialog.open();
    }
}
