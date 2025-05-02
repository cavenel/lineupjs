import { clear, suffix } from '../../internal';
import { Ranking, isSupportType } from '../../model';
import { aria, cssClass } from '../../styles';
import MoreRankingOptionsDialog from '../dialogs/MoreRankingOptionsDialog';
import { actionCSSClass } from '../header';
import { dialogContext } from '../dialogs';
import Hierarchy from './Hierarchy';
import SidePanelEntryVis from './SidePanelEntryVis';
/** @internal */
var SidePanelRanking = /** @class */ (function () {
    function SidePanelRanking(ranking, ctx, document, options) {
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
        this.dropdown.innerHTML = "<span></span><i class=\"".concat(actionCSSClass('more'), "\" title=\"More \u2026\">").concat(aria('More …'), "</i>");
        this.header.innerHTML = this.dropdown.innerHTML;
        this.header.firstElementChild.textContent = ranking.getLabel();
        this.header.lastElementChild.onclick = this.dropdown.lastElementChild.onclick =
            function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                var dialog = new MoreRankingOptionsDialog(ranking, dialogContext(ctx, 1, evt), ctx);
                dialog.open();
            };
        this.hierarchy = this.options.hierarchy ? new Hierarchy(ctx, document) : null;
        this.init();
    }
    SidePanelRanking.prototype.init = function () {
        var _this = this;
        this.node.innerHTML = "<main class=\"".concat(cssClass('side-panel-ranking-main'), "\"></main>");
        if (this.hierarchy) {
            this.node.insertBefore(this.hierarchy.node, this.node.firstChild);
        }
        if (this.hierarchy) {
            this.ranking.on(suffix('.panel', Ranking.EVENT_GROUP_CRITERIA_CHANGED, Ranking.EVENT_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED), function () {
                _this.updateHierarchy();
            });
        }
        this.ranking.on(suffix('.panel', Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_MOVE_COLUMN), function () {
            _this.updateList();
            _this.updateHierarchy();
        });
        this.ranking.on(suffix('.panel', Ranking.EVENT_LABEL_CHANGED), function () {
            _this.dropdown.firstElementChild.textContent = _this.header.firstElementChild.textContent =
                _this.ranking.getLabel();
        });
    };
    Object.defineProperty(SidePanelRanking.prototype, "active", {
        get: function () {
            return this.node.classList.contains(cssClass('active'));
        },
        set: function (value) {
            this.node.classList.toggle(cssClass('active'), value);
            this.header.classList.toggle(cssClass('active'), value);
            this.dropdown.classList.toggle(cssClass('active'), value);
            if (value) {
                return;
            }
            this.updateList();
            this.updateHierarchy();
        },
        enumerable: false,
        configurable: true
    });
    SidePanelRanking.prototype.update = function (ctx) {
        this.ctx = ctx;
        this.updateList();
        this.updateHierarchy();
    };
    SidePanelRanking.prototype.updateHierarchy = function () {
        if (!this.hierarchy || !this.active) {
            return;
        }
        this.hierarchy.update(this.ranking);
    };
    SidePanelRanking.prototype.updateList = function () {
        var _this = this;
        if (!this.active) {
            return;
        }
        var node = this.node.querySelector('main');
        var columns = this.ranking.flatColumns.filter(function (d) { return !isSupportType(d); });
        if (columns.length === 0) {
            clear(node);
            this.entries.forEach(function (d) { return d.destroy(); });
            this.entries.clear();
            return;
        }
        var currentEntries = new Map(this.entries);
        this.entries.clear();
        columns.forEach(function (col, i) {
            var existing = currentEntries.get(col.id);
            if (existing) {
                existing.update(_this.ctx);
                if (node.children[i] !== existing.node) {
                    // change node order if it doesn't match
                    node.appendChild(existing.node);
                }
                _this.entries.set(col.id, existing);
                currentEntries.delete(col.id);
                return;
            }
            var entry = new SidePanelEntryVis(col, _this.ctx, node.ownerDocument);
            node.insertBefore(entry.node, node.children[i]);
            _this.entries.set(col.id, entry);
        });
        currentEntries.forEach(function (d) {
            d.node.remove();
            d.destroy();
        });
    };
    SidePanelRanking.prototype.destroy = function () {
        this.header.remove();
        this.node.remove();
        this.ranking.on(suffix('.panel', Ranking.EVENT_GROUP_CRITERIA_CHANGED, Ranking.EVENT_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_MOVE_COLUMN, Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_LABEL_CHANGED), null);
        this.entries.forEach(function (d) { return d.destroy(); });
        this.entries.clear();
    };
    return SidePanelRanking;
}());
export default SidePanelRanking;
//# sourceMappingURL=SidePanelRanking.js.map