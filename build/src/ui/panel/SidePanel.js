var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
var SidePanel = /** @class */ (function () {
    function SidePanel(ctx, document, options) {
        if (options === void 0) { options = {}; }
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
            formatItem: function (item, node) {
                var w = isWrapper(item) ? item : item.children[0];
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
                        var summary = w.desc.summary || w.desc.description;
                        node.classList.toggle(cssClass('searchbox-summary-entry'), Boolean(summary));
                        if (summary) {
                            var label = node.ownerDocument.createElement('span');
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
                            var desc = node.ownerDocument.createElement('span');
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
    SidePanel.prototype.init = function () {
        var _this = this;
        this.node.innerHTML = "\n      <aside class=\"".concat(cssClass('stats'), "\"></aside>\n      <header class=\"").concat(cssClass('side-panel-rankings'), "\">\n        <i class=\"").concat(cssClass('action'), "\" title=\"Choose \u2026\">").concat(aria('Choose …'), "</i>\n      </header>\n      <main class=\"").concat(cssClass('side-panel-main'), "\"></main>\n    ");
        {
            var choose = this.node.querySelector('header > i');
            choose.onclick = function (evt) {
                evt.stopPropagation();
                var dialog = new ChooseRankingDialog(_this.rankings.map(function (d) { return d.dropdown; }), dialogContext(_this.ctx, 1, evt));
                dialog.open();
            };
        }
        if (this.options.collapseable) {
            this.node.insertAdjacentHTML('beforeend', "<div class=\"".concat(cssClass('collapser'), "\" title=\"Collapse Panel\">").concat(aria('Collapse Panel'), "</div>"));
            var last = this.node.lastElementChild;
            last.onclick = function () { return (_this.collapsed = !_this.collapsed); };
            this.collapsed = this.options.collapseable === 'collapsed';
        }
        this.initChooser();
        this.changeDataStorage(null, this.data);
    };
    SidePanel.prototype.initChooser = function () {
        var _this = this;
        if (!this.search) {
            return;
        }
        this.chooser = this.node.ownerDocument.createElement('header');
        this.chooser.appendChild(this.chooser.ownerDocument.createElement('form'));
        this.chooser.classList.add(cssClass('side-panel-chooser'));
        this.chooser.firstElementChild.appendChild(this.search.node);
        this.search.on(SearchBox.EVENT_SELECT, function (panel) {
            var col = _this.data.create(panel.desc);
            if (!col) {
                return;
            }
            var a = _this.active;
            if (a) {
                a.ranking.push(col);
            }
        });
    };
    Object.defineProperty(SidePanel.prototype, "active", {
        get: function () {
            return this.rankings.find(function (d) { return d.active; });
        },
        enumerable: false,
        configurable: true
    });
    SidePanel.prototype.changeDataStorage = function (old, data) {
        var _a;
        var _this = this;
        if (old) {
            old.on(suffix('.panel', DataProvider.EVENT_ADD_RANKING, DataProvider.EVENT_REMOVE_RANKING, DataProvider.EVENT_ADD_DESC, DataProvider.EVENT_REMOVE_DESC, DataProvider.EVENT_CLEAR_DESC, DataProvider.EVENT_ORDER_CHANGED, DataProvider.EVENT_SELECTION_CHANGED), null);
        }
        this.data = data;
        var wrapDesc = function (desc) { return ({
            desc: desc,
            category: categoryOfDesc(desc, data.columnTypes),
            id: "".concat(desc.type, "@").concat(desc.label),
            text: desc.label,
        }); };
        (_a = this.descs).splice.apply(_a, __spreadArray([0,
            this.descs.length], data
            .getColumns()
            .filter(function (d) { return d.visible !== false; })
            .concat(this.options.additionalDescs)
            .map(wrapDesc), false));
        data.on("".concat(DataProvider.EVENT_ADD_DESC, ".panel"), function (desc) {
            if (desc.visible !== false) {
                _this.descs.push(wrapDesc(desc));
                _this.updateChooser();
            }
        });
        data.on("".concat(DataProvider.EVENT_CLEAR_DESC, ".panel"), function () {
            _this.descs.splice(0, _this.descs.length);
            _this.updateChooser();
        });
        data.on("".concat(DataProvider.EVENT_REMOVE_DESC, ".panel"), function (desc) {
            if (desc.visible !== false) {
                var index = _this.descs.findIndex(function (d) { return d.desc === desc; });
                if (index >= 0) {
                    _this.descs.splice(index, 1);
                    _this.updateChooser();
                }
            }
        });
        data.on(suffix('.panel', DataProvider.EVENT_SELECTION_CHANGED, DataProvider.EVENT_ORDER_CHANGED), function () {
            _this.updateStats();
        });
        data.on(suffix('.panel', DataProvider.EVENT_ADD_RANKING), function (ranking, index) {
            _this.createEntry(ranking, index);
            _this.makeActive(index);
        });
        data.on(suffix('.panel', DataProvider.EVENT_REMOVE_RANKING), function (_, index) {
            if (index < 0) {
                // remove all
                _this.rankings.splice(0, _this.rankings.length).forEach(function (d) { return d.destroy(); });
                _this.node.querySelector('header').dataset.count = '0';
                _this.makeActive(-1);
                return;
            }
            var r = _this.rankings.splice(index, 1)[0];
            _this.node.querySelector('header').dataset.count = String(_this.rankings.length);
            r.destroy();
            if (r.active) {
                _this.makeActive(_this.rankings.length === 0 ? -1 : Math.max(index - 1, 0));
            }
        });
        this.rankings.splice(0, this.rankings.length).forEach(function (d) { return d.destroy(); });
        data.getRankings().forEach(function (d, i) {
            _this.createEntry(d, i);
        });
        if (this.rankings.length > 0) {
            this.makeActive(0);
        }
        this.updateStats();
    };
    SidePanel.prototype.createEntry = function (ranking, index) {
        var _this = this;
        var entry = new SidePanelRanking(ranking, this.ctx, this.node.ownerDocument, this.options);
        var header = this.node.querySelector('header');
        var main = this.node.querySelector('main');
        header.insertBefore(entry.header, header.children[index + 1]); // for the action
        header.dataset.count = String(this.rankings.length + 1);
        entry.header.onclick = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            _this.makeActive(_this.rankings.indexOf(entry));
        };
        entry.dropdown.onclick = entry.header.onclick = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            _this.ctx.dialogManager.removeAboveLevel(0);
            _this.makeActive(_this.rankings.indexOf(entry));
        };
        main.insertBefore(entry.node, main.children[index]);
        this.rankings.splice(index, 0, entry);
    };
    Object.defineProperty(SidePanel.prototype, "collapsed", {
        get: function () {
            return this.node.classList.contains(cssClass('collapsed'));
        },
        set: function (value) {
            this.node.classList.toggle(cssClass('collapsed'), value);
            if (value) {
                return;
            }
            this.updateChooser();
            this.updateStats();
            this.updateRanking();
        },
        enumerable: false,
        configurable: true
    });
    SidePanel.prototype.makeActive = function (index) {
        this.rankings.forEach(function (d, i) { return (d.active = index === i); });
        var active = this.active;
        if (active && this.chooser) {
            active.node.insertAdjacentElement('afterbegin', this.chooser);
            // scroll to body
            var parent_1 = this.node.closest(".".concat(cssClass()));
            var body = parent_1 ? parent_1.querySelector("article[data-ranking=\"".concat(active.ranking.id, "\"]")) : null;
            if (body) {
                body.scrollIntoView();
            }
        }
        this.updateRanking();
    };
    SidePanel.prototype.updateRanking = function () {
        var active = this.active;
        if (active && !this.collapsed) {
            active.update(this.ctx);
        }
    };
    SidePanel.prototype.update = function (ctx) {
        var bak = this.data;
        this.ctx = ctx;
        if (ctx.provider !== bak) {
            this.changeDataStorage(bak, ctx.provider);
        }
        this.updateChooser();
        this.updateStats();
        var active = this.active;
        if (active) {
            active.update(ctx);
        }
    };
    SidePanel.prototype.updateStats = function () {
        var _this = this;
        if (this.collapsed) {
            return;
        }
        var stats = this.node.querySelector(".".concat(cssClass('stats')));
        var s = this.data.getSelection();
        var clearSelection = s.length === 0
            ? ''
            : "<i class=\"".concat(cssClass('action'), " ").concat(cssClass('action-clear-selection'), " ").concat(cssClass('stats-clear-selection'), "\" title=\"Clear selection\"><span class=\"").concat(cssClass('aria'), "\" aria-hidden=\"true\">Clear Selection</span></i>");
        var r = this.data.getFirstRanking();
        var f = format(',d');
        var visible = r ? r.getGroups().reduce(function (a, b) { return a + b.order.length; }, 0) : 0;
        var total = this.data.getTotalNumberOfRows();
        stats.innerHTML = "Showing <strong>".concat(f(visible), "</strong> of ").concat(f(total), " items").concat(s.length > 0 ? "; <span>".concat(f(s.length), " selected ").concat(clearSelection, "</span>") : '').concat(visible < total
            ? " <i class=\"".concat(cssClass('action'), " ").concat(cssClass('action-filter'), " ").concat(cssClass('stats-reset'), "\" title=\"Reset filters\"><span>Reset</span></i>")
            : '');
        var resetButton = stats.querySelector(".".concat(cssClass('stats-reset')));
        if (resetButton) {
            resetButton.onclick = function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                _this.data.clearFilters();
            };
        }
        var clearButton = stats.querySelector(".".concat(cssClass('stats-clear-selection')));
        if (clearButton) {
            clearButton.onclick = function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                _this.data.setSelection([]);
            };
        }
    };
    SidePanel.prototype.destroy = function () {
        this.node.remove();
        if (!this.data) {
            return;
        }
        this.rankings.forEach(function (d) { return d.destroy(); });
        this.rankings.length = 0;
        this.data.on(suffix('.panel', DataProvider.EVENT_ADD_RANKING, DataProvider.EVENT_REMOVE_RANKING, DataProvider.EVENT_ADD_DESC), null);
    };
    SidePanel.groupByType = function (entries) {
        var map = new Map();
        entries.forEach(function (entry) {
            if (!map.has(entry.category)) {
                map.set(entry.category, [entry]);
            }
            else {
                map.get(entry.category).push(entry);
            }
        });
        return Array.from(map)
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return {
                text: key.label,
                order: key.order,
                children: value.sort(function (a, b) { return a.text.localeCompare(b.text); }),
            };
        })
            .sort(function (a, b) { return a.order - b.order; });
    };
    SidePanel.prototype.updateChooser = function () {
        if (!this.search || this.collapsed) {
            return;
        }
        this.search.data = SidePanel.groupByType(this.descs);
    };
    return SidePanel;
}());
export default SidePanel;
//# sourceMappingURL=SidePanel.js.map