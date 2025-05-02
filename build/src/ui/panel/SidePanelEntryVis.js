import { Column, isMapAbleColumn, NumberColumn } from '../../model';
import { cssClass, engineCssClass } from '../../styles';
import { createShortcutMenuItems, updateHeader } from '../header';
import { suffix } from '../../internal';
/** @internal */
var SidePanelEntryVis = /** @class */ (function () {
    function SidePanelEntryVis(column, ctx, document) {
        var _this = this;
        this.column = column;
        this.ctx = ctx;
        this.summaryUpdater = null;
        this.node = document.createElement('article');
        this.node.classList.add(cssClass('side-panel-entry'));
        this.node.dataset.colId = column.id;
        this.node.dataset.type = column.desc.type;
        this.summary = ctx.summaryRenderer(column, true);
        this.column.on(suffix('.panel', NumberColumn.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_HEADER), function () {
            _this.update();
        });
        this.column.on(suffix('.panel', Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_CACHES), function () {
            _this.recreateSummary();
        });
        this.init();
        this.update();
    }
    SidePanelEntryVis.prototype.init = function () {
        this.node.innerHTML = "\n      <header class=\"".concat(cssClass('side-panel-entry-header'), "\">\n        <div class=\"").concat(cssClass('side-panel-labels'), "\">\n          <span class=\"").concat(cssClass('label'), " ").concat(cssClass('typed-icon'), " ").concat(cssClass('side-panel-label'), "\"></span>\n          <span class=\"").concat(cssClass('sublabel'), " ").concat(cssClass('side-panel-sublabel'), "\"></span>\n        </div>\n        <div class=\"").concat(cssClass('toolbar'), " ").concat(cssClass('side-panel-toolbar'), "\"></div>\n      </header>");
        createShortcutMenuItems(this.node.querySelector(".".concat(cssClass('toolbar'))), 0, this.column, this.ctx, 'sidePanel', false);
        this.appendSummary();
    };
    SidePanelEntryVis.prototype.update = function (ctx) {
        if (ctx === void 0) { ctx = this.ctx; }
        this.ctx = ctx;
        updateHeader(this.node, this.column, 'sidePanel');
        this.updateSummary();
    };
    SidePanelEntryVis.prototype.updateSummary = function () {
        var summaryNode = this.node.querySelector(".".concat(cssClass('summary')));
        if (this.summaryUpdater) {
            this.summaryUpdater.abort();
            summaryNode.classList.remove(engineCssClass('loading'));
            this.summaryUpdater = null;
        }
        var r = this.summary.update(summaryNode);
        if (!r) {
            return;
        }
        this.summaryUpdater = r;
        summaryNode.classList.add(engineCssClass('loading'));
        r.then(function (a) {
            if (typeof a === 'symbol') {
                return;
            }
            summaryNode.classList.remove(engineCssClass('loading'));
        });
    };
    SidePanelEntryVis.prototype.appendSummary = function () {
        var summary = this.ctx.asElement(this.summary.template);
        summary.classList.add(cssClass('summary'), cssClass('side-panel-summary'), cssClass('renderer'), cssClass("renderer-".concat(this.column.getSummaryRenderer())));
        summary.dataset.renderer = this.column.getSummaryRenderer();
        summary.dataset.interactive = isMapAbleColumn(this.column).toString();
        this.node.appendChild(summary);
    };
    SidePanelEntryVis.prototype.recreateSummary = function () {
        // remove old summary
        this.node.removeChild(this.node.querySelector(".".concat(cssClass('summary'))));
        this.summary = this.ctx.summaryRenderer(this.column, true);
        this.appendSummary();
        this.updateSummary();
    };
    SidePanelEntryVis.prototype.destroy = function () {
        this.column.on(suffix('.panel', NumberColumn.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_CACHES), null);
        this.node.remove();
    };
    return SidePanelEntryVis;
}());
export default SidePanelEntryVis;
//# sourceMappingURL=SidePanelEntryVis.js.map