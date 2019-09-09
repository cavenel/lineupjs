import {suffix} from '../../internal/AEventDispatcher';
import {
  createImpositionDesc,
  createNestedDesc,
  createReduceDesc,
  createScriptDesc,
  createStackDesc,
  createRankDesc,
  createGroupDesc,
  createAggregateDesc,
  createSelectionDesc,
  IColumnDesc
} from '../../model';
import {categoryOfDesc, IColumnCategory} from '../../model/annotations';
import Ranking from '../../model/Ranking';
import DataProvider, {IDataProvider} from '../../provider/ADataProvider';
import {IRankingHeaderContext} from '../interfaces';
import SearchBox, {IGroupSearchItem, ISearchBoxOptions} from './SearchBox';
import SidePanelRanking from './SidePanelRanking';
import {dialogContext} from '../toolbar';
import ChooseRankingDialog from '../dialogs/ChooseRankingDialog';


interface IColumnWrapper {
  desc: IColumnDesc;
  category: IColumnCategory;
  id: string;
  text: string;
}

function isWrapper(item: IColumnWrapper | IGroupSearchItem<IColumnWrapper>): item is IColumnWrapper {
  return (<IColumnWrapper>item).desc != null;
}

export interface ISidePanelOptions extends Partial<ISearchBoxOptions<IColumnWrapper>> {
  additionalDescs: IColumnDesc[];
  chooser: boolean;
  hierarchy: boolean;
  collapseable: boolean | 'collapsed';
}

export default class SidePanel {

  private readonly options: ISidePanelOptions = {
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
    formatItem: (item: IColumnWrapper | IGroupSearchItem<IColumnWrapper>, node: HTMLElement) => {
      const w: IColumnWrapper = isWrapper(item) ? item : (<IColumnWrapper>item.children[0]);
      node.dataset.typeCat = w.category.name;
      if (isWrapper(item)) {
        node.dataset.type = w.desc.type;
      }
      if (node.parentElement) {
        node.parentElement.classList.add('lu-feature-model');
        node.parentElement.classList.toggle('lu-feature-advanced', w.category.featureLevel === 'advanced');
        node.parentElement.classList.toggle('lu-feature-basic', w.category.featureLevel === 'basic');
      }
      return item.text;
    },
    collapseable: true
  };

  readonly node: HTMLElement;
  private readonly search: SearchBox<IColumnWrapper> | null;
  private chooser: HTMLElement | null = null;
  private readonly descs: IColumnWrapper[] = [];
  private data: IDataProvider;
  private readonly rankings: SidePanelRanking[] = [];

  constructor(private ctx: IRankingHeaderContext, document: Document, options: Partial<ISidePanelOptions> = {}) {
    Object.assign(this.options, options);

    this.node = document.createElement('aside');
    this.node.classList.add('lu-side-panel');

    this.search = this.options.chooser ? new SearchBox<IColumnWrapper>(this.options) : null;

    this.data = ctx.provider;
    this.init();
    this.update(ctx);
  }

  private init() {
    this.node.innerHTML = `
      <aside class="lu-stats"></aside>
      <header>
        <i class="lu-action" title="Choose &hellip;"><span aria-hidden="true">Choose &hellip;</span></i>
      </header>
      <main></main>
    `;

    {
      const choose = <HTMLElement>this.node.querySelector('header > i');
      choose.onclick = (evt) => {
        evt.stopPropagation();
        const dialog = new ChooseRankingDialog(this.rankings.map((d) => d.dropdown), dialogContext(this.ctx, 1, <any>evt));
        dialog.open();
      };
    }

    if (this.options.collapseable) {
      this.node.insertAdjacentHTML('beforeend', `<div class="lu-collapser" title="Collapse Panel"></div>`);
      const last = <HTMLElement>this.node.lastElementChild;
      last.onclick = () => this.collapsed = !this.collapsed;
      this.collapsed = this.options.collapseable === 'collapsed';
    }
    this.initChooser();
    this.changeDataStorage(null, this.data);
  }

  private initChooser() {
    if (!this.search) {
      return;
    }
    console.assert(this.node.ownerDocument != null);
    this.chooser = this.node.ownerDocument!.createElement('header');
    this.chooser.innerHTML = '<form></form>';
    this.chooser.firstElementChild!.appendChild(this.search.node);
    this.search.on(SearchBox.EVENT_SELECT, (panel: IColumnWrapper) => {
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

  private get active() {
    return this.rankings.find((d) => d.active);
  }

  private changeDataStorage(old: IDataProvider | null, data: IDataProvider) {
    if (old) {
      old.on(suffix('.panel', DataProvider.EVENT_ADD_RANKING, DataProvider.EVENT_REMOVE_RANKING,
        DataProvider.EVENT_ADD_DESC, DataProvider.EVENT_CLEAR_DESC, DataProvider.EVENT_ORDER_CHANGED, DataProvider.EVENT_SELECTION_CHANGED), null);
    }
    this.data = data;

    const wrapDesc = (desc: IColumnDesc) => ({
        desc,
        category: categoryOfDesc(desc, data.columnTypes),
        id: `${desc.type}@${desc.label}`,
        text: desc.label
      });
    this.descs.splice(0, this.descs.length, ...data.getColumns().concat(this.options.additionalDescs).map(wrapDesc));

    data.on(`${DataProvider.EVENT_ADD_DESC}.panel`, (desc) => {
      this.descs.push(wrapDesc(desc));
      this.updateChooser();
    });

    data.on(`${DataProvider.EVENT_CLEAR_DESC}.panel`, () => {
      this.descs.splice(0, this.descs.length);
      this.updateChooser();
    });

    data.on(suffix('.panel', DataProvider.EVENT_SELECTION_CHANGED, DataProvider.EVENT_ORDER_CHANGED), () => {
      this.updateStats();
    });

    data.on(suffix('.panel', DataProvider.EVENT_ADD_RANKING), (ranking: Ranking, index: number) => {
      this.createEntry(ranking, index);
      this.makeActive(index);
    });

    data.on(suffix('.panel', DataProvider.EVENT_REMOVE_RANKING), (_: Ranking, index: number) => {
      if (index < 0) {
        // remove all
        this.rankings.splice(0, this.rankings.length).forEach((d) => d.destroy());
        this.node.querySelector('header')!.dataset.count = '0';
        this.makeActive(-1);
        return;
      }
      const r = this.rankings.splice(index, 1)[0];
      this.node.querySelector('header')!.dataset.count = String(this.rankings.length);
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

  private createEntry(ranking: Ranking, index: number) {
    console.assert(this.node.ownerDocument != null);
    const entry = new SidePanelRanking(ranking, this.ctx, this.node.ownerDocument!, this.options);

    const header = this.node.querySelector('header')!;
    const main = this.node.querySelector('main')!;

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
    return this.node.classList.contains('lu-collapsed');
  }

  set collapsed(value: boolean) {
    this.node.classList.toggle('lu-collapsed', value);
    if (value) {
      return;
    }
    this.updateChooser();
    this.updateStats();
    this.updateRanking();
  }

  private makeActive(index: number) {
    this.rankings.forEach((d, i) => d.active = index === i);

    const active = this.active;
    if (active && this.chooser) {
      active.node.insertAdjacentElement('afterbegin', this.chooser);
      // scroll to body
      const parent = <HTMLElement>this.node.closest('.lu')!;
      const body = parent ? parent.querySelector(`article[data-ranking="${active.ranking.id}"]`) : null;
      if (body) {
        body.scrollIntoView();
      }
    }
    this.updateRanking();
  }

  private updateRanking() {
    const active = this.active;
    if (active && !this.collapsed) {
      active.update(this.ctx);
    }
  }

  update(ctx: IRankingHeaderContext) {
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

  private updateStats() {
    if (this.collapsed) {
      return;
    }
    const stats = <HTMLElement>this.node.querySelector('aside.lu-stats');
    const s = this.data.getSelection();
    const r = this.data.getFirstRanking();
    const visible = r ? r.getGroups().reduce((a, b) => a + b.order.length, 0) : 0;
    stats.innerHTML = `Showing <strong>${visible}</strong> of ${this.data.getTotalNumberOfRows()} items${s.length > 0 ? `; <span>${s.length} selected</span>` : ''}`;
  }

  destroy() {
    this.node.remove();
    if (!this.data) {
      return;
    }
    this.rankings.forEach((d) => d.destroy());
    this.rankings.length = 0;
    this.data.on(suffix('.panel', DataProvider.EVENT_ADD_RANKING, DataProvider.EVENT_REMOVE_RANKING,
      DataProvider.EVENT_ADD_DESC), null);
  }

  private static groupByType(entries: IColumnWrapper[]): { text: string, children: IColumnWrapper[] }[] {
    const map = new Map<IColumnCategory, IColumnWrapper[]>();
    entries.forEach((entry) => {
      if (!map.has(entry.category)) {
        map.set(entry.category, [entry]);
      } else {
        map.get(entry.category)!.push(entry);
      }
    });
    return Array.from(map).map(([key, value]) => {
      return {
        text: key.label,
        order: key.order,
        children: value.sort((a, b) => a.text.localeCompare(b.text))
      };
    }).sort((a, b) => a.order - b.order);
  }

  private updateChooser() {
    if (!this.search || this.collapsed) {
      return;
    }
    this.search.data = SidePanel.groupByType(this.descs);
  }
}
