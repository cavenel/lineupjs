var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { GridStyleManager, MultiTableRowRenderer, nonUniformContext } from 'lineupengine';
import { AEventDispatcher, debounce, round, suffix } from '../internal';
import { Column, isGroup, Ranking } from '../model';
import { DataProvider } from '../provider';
import { isSummaryGroup, groupEndLevel } from '../provider/internal';
import { chooseGroupRenderer, chooseRenderer, chooseSummaryRenderer, getPossibleRenderer } from '../renderer/renderers';
import { cssClass, engineCssClass } from '../styles';
import DialogManager from './dialogs/DialogManager';
import domElementCache, { createSanitizer } from './domElementCache';
import EngineRanking, {} from './EngineRanking';
import { EMode } from './interfaces';
import SlopeGraph from './SlopeGraph';
import SelectionIndicator from './SelectionIndicator';
var EngineRenderer = /** @class */ (function (_super) {
    __extends(EngineRenderer, _super);
    function EngineRenderer(data, parent, options) {
        var _this = _super.call(this) || this;
        _this.data = data;
        _this.rankings = [];
        _this.slopeGraphs = [];
        _this.updateAbles = [];
        _this.zoomFactor = 1;
        _this.enabledHighlightListening = false;
        _this.options = options;
        _this.idPrefix = _this.options.instanceId
            ? "lu-".concat(_this.options.instanceId)
            : "lu-".concat(Math.random().toString(36).slice(-8).substring(0, 3));
        _this.node = parent.ownerDocument.createElement('main');
        _this.node.id = _this.idPrefix;
        // FIXME inline
        _this.node.classList.toggle(cssClass('whole-hover'), options.expandLineOnHover);
        parent.appendChild(_this.node);
        var dialogManager = new DialogManager({
            doc: parent.ownerDocument,
            livePreviews: options.livePreviews,
            onDialogBackgroundClick: options.onDialogBackgroundClick,
        });
        _this.forward.apply(_this, __spreadArray([dialogManager], suffix('.main', EngineRenderer.EVENT_DIALOG_OPENED, EngineRenderer.EVENT_DIALOG_CLOSED), false));
        parent.appendChild(dialogManager.node);
        _this.ctx = {
            idPrefix: _this.idPrefix,
            document: parent.ownerDocument,
            provider: data,
            tasks: data.getTaskExecutor(),
            dialogManager: dialogManager,
            resolveToolbarActions: function (col, keys) { return _this.options.resolveToolbarActions(col, keys, _this.options.toolbarActions); },
            resolveToolbarDialogAddons: function (col, keys) {
                return _this.options.resolveToolbarDialogAddons(col, keys, _this.options.toolbarDialogAddons);
            },
            flags: _this.options.flags,
            asElement: domElementCache(parent.ownerDocument),
            sanitize: createSanitizer(parent.ownerDocument),
            renderer: function (col, imposer) {
                var r = chooseRenderer(col, _this.options.renderers);
                return r.create(col, _this.ctx, imposer);
            },
            groupRenderer: function (col, imposer) {
                var r = chooseGroupRenderer(col, _this.options.renderers);
                return r.createGroup(col, _this.ctx, imposer);
            },
            summaryRenderer: function (col, interactive, imposer) {
                var r = chooseSummaryRenderer(col, _this.options.renderers);
                return r.createSummary(col, _this.ctx, interactive, imposer);
            },
            createRenderer: function (col, imposer) {
                var single = this.renderer(col, imposer);
                var group = this.groupRenderer(col, imposer);
                var summary = options.summaryHeader ? this.summaryRenderer(col, false, imposer) : null;
                return {
                    single: single,
                    group: group,
                    summary: summary,
                    singleId: col.getRenderer(),
                    groupId: col.getGroupRenderer(),
                    summaryId: col.getSummaryRenderer(),
                    singleTemplate: null,
                    groupTemplate: null,
                    summaryTemplate: null,
                };
            },
            getPossibleRenderer: function (col) { return getPossibleRenderer(col, _this.options.renderers, _this.options.canRender); },
            colWidth: function (col) { return (!col.isVisible() ? 0 : col.getWidth()); },
            caches: {
                toolbar: new Map(),
                toolbarAddons: new Map(),
            },
        };
        _this.table = new MultiTableRowRenderer(_this.node, _this.idPrefix);
        {
            // helper object for better resizing experience
            var footer = _this.table.node.querySelector(".".concat(engineCssClass('body'), " .").concat(engineCssClass('footer')));
            var copy = footer.cloneNode(true);
            copy.classList.add(cssClass('resize-helper'));
            footer.insertAdjacentElement('afterend', copy);
        }
        {
            // selection indicator
            var body = _this.table.node.querySelector(".".concat(engineCssClass('body')));
            _this.selectionIndicator = new SelectionIndicator(body);
            parent.insertBefore(_this.selectionIndicator.node, _this.node);
        }
        //apply rules
        {
            _this.style.addRule('lineup_rowPadding0', "\n        .".concat(_this.style.cssClasses.tr), {
                marginTop: "".concat(options.rowPadding, "px"),
            });
            for (var level = 0; level < 4; ++level) {
                _this.style.addRule("lineup_groupPadding".concat(level), "\n        .".concat(_this.style.cssClasses.tr, "[data-meta~=last").concat(level === 0 ? '' : level, "]"), {
                    marginBottom: "".concat(options.groupPadding * (level + 1), "px"),
                });
            }
            _this.style.addRule('lineup_rowPaddingAgg0', "\n        .".concat(cssClass('agg-level'), "::after"), {
                top: "-".concat(options.rowPadding, "px"),
            });
            for (var level = 1; level <= 4; ++level) {
                _this.style.addRule("lineup_rowPaddingAgg".concat(level), "\n        .".concat(cssClass('agg-level'), "[data-level='").concat(level, "']::after"), {
                    top: "-".concat(options.rowPadding + options.groupPadding, "px"),
                });
            }
            // FIXME flat
            _this.style.addRule('lineup_rotation', "\n       #".concat(_this.idPrefix, ".").concat(cssClass('rotated-label'), " .").concat(cssClass('label'), ".").concat(cssClass('rotated')), {
                transform: "rotate(".concat(-_this.options.labelRotation, "deg)"),
            });
            var toDisable = [];
            if (!_this.options.flags.advancedRankingFeatures) {
                toDisable.push('ranking');
            }
            if (!_this.options.flags.advancedModelFeatures) {
                toDisable.push('model');
            }
            if (!_this.options.flags.advancedUIFeatures) {
                toDisable.push('ui');
            }
            if (toDisable.length > 0) {
                _this.style.addRule('lineup_feature_disable', "\n        ".concat(toDisable.map(function (d) { return ".".concat(cssClass('feature'), "-").concat(d, ".").concat(cssClass('feature-advanced')); }).join(', ')), {
                    display: 'none !important',
                });
            }
        }
        _this.initProvider(data);
        // update on container resizes
        _this.resizeObserver = new ResizeObserver(debounce(function () {
            _this.update();
        }, 100));
        _this.resizeObserver.observe(_this.node.parentElement, {
            box: 'content-box',
        });
        return _this;
    }
    Object.defineProperty(EngineRenderer.prototype, "style", {
        get: function () {
            return this.table.style;
        },
        enumerable: false,
        configurable: true
    });
    EngineRenderer.prototype.zoomOut = function () {
        this.zoomFactor = Math.max(this.zoomFactor - 0.1, 0.5);
        this.updateZoomFactor();
        this.update();
    };
    EngineRenderer.prototype.zoomIn = function () {
        this.zoomFactor = Math.min(this.zoomFactor + 0.1, 2.0);
        this.updateZoomFactor();
        this.update();
    };
    EngineRenderer.prototype.updateZoomFactor = function () {
        var body = this.node.querySelector('main');
        body.style.fontSize = "".concat(this.zoomFactor * 100, "%");
    };
    EngineRenderer.prototype.pushUpdateAble = function (updateAble) {
        this.updateAbles.push(updateAble);
    };
    EngineRenderer.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            EngineRenderer.EVENT_HIGHLIGHT_CHANGED,
            EngineRenderer.EVENT_DIALOG_OPENED,
            EngineRenderer.EVENT_DIALOG_CLOSED,
        ]);
    };
    EngineRenderer.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    EngineRenderer.prototype.setDataProvider = function (data) {
        this.takeDownProvider();
        this.data = data;
        this.ctx.provider = data;
        this.ctx.tasks = data.getTaskExecutor();
        this.initProvider(data);
    };
    EngineRenderer.prototype.takeDownProvider = function () {
        var _this = this;
        this.data.on("".concat(DataProvider.EVENT_SELECTION_CHANGED, ".body"), null);
        this.data.on("".concat(DataProvider.EVENT_ADD_RANKING, ".body"), null);
        this.data.on("".concat(DataProvider.EVENT_REMOVE_RANKING, ".body"), null);
        this.data.on("".concat(DataProvider.EVENT_GROUP_AGGREGATION_CHANGED, ".body"), null);
        this.data.on("".concat(DataProvider.EVENT_SHOWTOPN_CHANGED, ".body"), null);
        this.data.on("".concat(DataProvider.EVENT_JUMP_TO_NEAREST, ".body"), null);
        this.data.on("".concat(DataProvider.EVENT_BUSY, ".body"), null);
        this.rankings.forEach(function (r) { return _this.table.remove(r); });
        this.rankings.splice(0, this.rankings.length);
        this.slopeGraphs.forEach(function (s) { return _this.table.remove(s); });
        this.slopeGraphs.splice(0, this.slopeGraphs.length);
    };
    EngineRenderer.prototype.initProvider = function (data) {
        var _this = this;
        data.on("".concat(DataProvider.EVENT_SELECTION_CHANGED, ".body"), function () { return _this.updateSelection(data.getSelection()); });
        data.on("".concat(DataProvider.EVENT_ADD_RANKING, ".body"), function (ranking) {
            _this.addRanking(ranking);
        });
        data.on("".concat(DataProvider.EVENT_REMOVE_RANKING, ".body"), function (ranking) {
            _this.removeRanking(ranking);
        });
        data.on("".concat(DataProvider.EVENT_GROUP_AGGREGATION_CHANGED, ".body"), function (ranking) {
            _this.update(_this.rankings.filter(function (r) { return r.ranking === ranking; }));
        });
        data.on("".concat(DataProvider.EVENT_SHOWTOPN_CHANGED, ".body"), function () {
            _this.update(_this.rankings);
        });
        data.on("".concat(DataProvider.EVENT_JUMP_TO_NEAREST, ".body"), function (indices) {
            _this.setHighlightToNearest(indices, true);
        });
        this.ctx.provider = data;
        this.data.getRankings().forEach(function (r) { return _this.addRanking(r); });
    };
    EngineRenderer.prototype.updateSelection = function (dataIndices) {
        var s = new Set(dataIndices);
        this.rankings.forEach(function (r) { return r.updateSelection(s); });
        this.slopeGraphs.forEach(function (r) { return r.updateSelection(s); });
        this.selectionIndicator.updateSelection(s);
    };
    EngineRenderer.prototype.updateHist = function (ranking, col) {
        if (!this.options.summaryHeader) {
            return;
        }
        var rankings = ranking ? [ranking] : this.rankings;
        for (var _i = 0, rankings_1 = rankings; _i < rankings_1.length; _i++) {
            var r = rankings_1[_i];
            if (col) {
                // single update
                r.updateHeaderOf(col);
            }
            else {
                r.updateHeaders();
            }
        }
        this.updateUpdateAbles();
    };
    EngineRenderer.prototype.addRanking = function (ranking) {
        var _this = this;
        if (this.rankings.length > 0) {
            // add slope graph first
            var s = this.table.pushSeparator(function (header, body) {
                return new SlopeGraph(header, body, "".concat(ranking.id, "S"), _this.ctx, {
                    mode: _this.options.defaultSlopeGraphMode === 'band' ? EMode.BAND : EMode.ITEM,
                });
            });
            this.slopeGraphs.push(s);
        }
        var r = this.table.pushTable(function (header, body, tableId, style) {
            return new EngineRanking(ranking, header, body, tableId, style, _this.ctx, {
                animation: _this.options.animated,
                customRowUpdate: _this.options.customRowUpdate || (function () { return undefined; }),
                levelOfDetail: _this.options.levelOfDetail || (function () { return 'high'; }),
                flags: _this.options.flags,
                selectionActivateFilter: _this.options.selectionActivateFilter,
            });
        });
        r.on(EngineRanking.EVENT_WIDTH_CHANGED, function () {
            _this.updateRotatedHeaderState();
            _this.table.widthChanged();
        });
        r.on(EngineRanking.EVENT_UPDATE_DATA, function () { return _this.update([r]); });
        r.on(EngineRanking.EVENT_RECREATE, function () { return _this.updateUpdateAbles(); });
        this.forward(r, EngineRanking.EVENT_HIGHLIGHT_CHANGED);
        if (this.enabledHighlightListening) {
            r.enableHighlightListening(true);
        }
        ranking.on(suffix('.renderer', Ranking.EVENT_ORDER_CHANGED), function () { return _this.updateHist(r); });
        this.rankings.push(r);
        this.update([r]);
    };
    EngineRenderer.prototype.updateRotatedHeaderState = function () {
        if (this.options.labelRotation === 0) {
            return;
        }
        var l = this.node.querySelector(".".concat(cssClass('label'), ".").concat(cssClass('rotated')));
        this.node.classList.toggle(cssClass('rotated-label'), Boolean(l));
    };
    EngineRenderer.prototype.removeRanking = function (ranking) {
        if (!ranking) {
            // remove all
            this.rankings.splice(0, this.rankings.length);
            this.slopeGraphs.splice(0, this.slopeGraphs.length);
            this.table.clear();
            return;
        }
        var index = this.rankings.findIndex(function (r) { return r.ranking === ranking; });
        if (index < 0) {
            return; // error
        }
        var section = this.rankings.splice(index, 1)[0];
        var slope = this.slopeGraphs.splice(index === 0 ? index : index - 1, 1)[0];
        this.table.remove(section);
        if (slope) {
            this.table.remove(slope);
        }
    };
    EngineRenderer.prototype.update = function (rankings) {
        var _this = this;
        if (rankings === void 0) { rankings = this.rankings; }
        // visible and has parent = part of dom
        rankings = rankings.filter(function (d) { return !d.hidden && d.body.parentElement; });
        if (rankings.length === 0) {
            return;
        }
        var round2 = function (v) { return round(v, 2); };
        var rowPadding = round2(this.zoomFactor * this.options.rowPadding);
        var groupPadding = round2(this.zoomFactor * this.options.groupPadding);
        var heightsFor = function (ranking, data) {
            if (_this.options.dynamicHeight) {
                var impl_1 = _this.options.dynamicHeight(data, ranking);
                var f_1 = function (v, d) { return (typeof v === 'number' ? v : v(d)); };
                if (impl_1) {
                    return {
                        defaultHeight: round2(_this.zoomFactor * impl_1.defaultHeight),
                        height: function (d) { return round2(_this.zoomFactor * f_1(impl_1.height, d)); },
                        padding: function (d) { return round2(_this.zoomFactor * f_1(impl_1.padding, d)); },
                    };
                }
            }
            var item = round2(_this.zoomFactor * _this.options.rowHeight);
            var group = round2(_this.zoomFactor * _this.options.groupHeight);
            return {
                defaultHeight: item,
                height: function (d) { return (isGroup(d) ? group : item); },
                padding: rowPadding,
            };
        };
        var _loop_1 = function (r) {
            var grouped = r.groupData();
            // inline with creating the groupData
            var _a = heightsFor(r.ranking, grouped), height = _a.height, defaultHeight = _a.defaultHeight, padding = _a.padding;
            var strategy = this_1.data.getAggregationStrategy();
            var topNGetter = function (group) { return _this.data.getTopNAggregated(r.ranking, group); };
            // inline and create manually for better performance
            var rowContext = nonUniformContext(grouped.map(height), defaultHeight, function (index) {
                var pad = typeof padding === 'number' ? padding : padding(grouped[index] || null);
                var v = grouped[index];
                if (index < 0 || !v || (isGroup(v) && isSummaryGroup(v, strategy, topNGetter))) {
                    return pad;
                }
                return pad + groupPadding * groupEndLevel(v, topNGetter);
            });
            r.render(grouped, rowContext);
            if (r === this_1.rankings[0]) {
                // first ranking
                this_1.selectionIndicator.updateData(grouped, rowContext);
            }
        };
        var this_1 = this;
        for (var _i = 0, rankings_2 = rankings; _i < rankings_2.length; _i++) {
            var r = rankings_2[_i];
            _loop_1(r);
        }
        this.updateSlopeGraphs(rankings);
        this.updateUpdateAbles();
        this.updateRotatedHeaderState();
        this.table.widthChanged();
    };
    EngineRenderer.prototype.updateUpdateAbles = function () {
        for (var _i = 0, _a = this.updateAbles; _i < _a.length; _i++) {
            var u = _a[_i];
            u(this.ctx);
        }
    };
    EngineRenderer.prototype.updateSlopeGraphs = function (rankings) {
        var _this = this;
        if (rankings === void 0) { rankings = this.rankings; }
        var indices = new Set(rankings.map(function (d) { return _this.rankings.indexOf(d); }));
        for (var i = 0; i < this.slopeGraphs.length; ++i) {
            var s = this.slopeGraphs[i];
            if (s.hidden) {
                return;
            }
            var left = i;
            var right = i + 1;
            if (!indices.has(left) && !indices.has(right)) {
                return;
            }
            var leftRanking = this.rankings[left];
            var rightRanking = this.rankings[right];
            s.rebuild(leftRanking.ranking, leftRanking.currentData, leftRanking.context, rightRanking.ranking, rightRanking.currentData, rightRanking.context);
        }
    };
    EngineRenderer.prototype.setHighlight = function (dataIndex, scrollIntoView) {
        var found = this.rankings.map(function (r) { return r.setHighlight(dataIndex); });
        this.fire(EngineRenderer.EVENT_HIGHLIGHT_CHANGED, dataIndex);
        if (this.rankings.length === 0 || dataIndex < 0) {
            return false;
        }
        if (!scrollIntoView) {
            return found[0];
        }
        return this.rankings[0].scrollIntoView(dataIndex);
    };
    EngineRenderer.prototype.setHighlightToNearest = function (dataIndices, scrollIntoView) {
        if (this.rankings.length === 0) {
            return false;
        }
        var nearest = this.rankings[0].findNearest(dataIndices);
        if (nearest >= 0) {
            return this.setHighlight(nearest, scrollIntoView);
        }
        return false;
    };
    EngineRenderer.prototype.getHighlight = function () {
        for (var _i = 0, _a = this.rankings; _i < _a.length; _i++) {
            var ranking = _a[_i];
            var h = ranking.getHighlight();
            if (h >= 0) {
                return h;
            }
        }
        return -1;
    };
    EngineRenderer.prototype.enableHighlightListening = function (enable) {
        for (var _i = 0, _a = this.rankings; _i < _a.length; _i++) {
            var ranking = _a[_i];
            ranking.enableHighlightListening(enable);
        }
        this.enabledHighlightListening = enable;
    };
    EngineRenderer.prototype.destroy = function () {
        if (this.node.parentElement) {
            this.resizeObserver.unobserve(this.node.parentElement);
        }
        this.resizeObserver.disconnect();
        this.takeDownProvider();
        this.table.destroy();
        this.node.remove();
    };
    EngineRenderer.EVENT_HIGHLIGHT_CHANGED = EngineRanking.EVENT_HIGHLIGHT_CHANGED;
    EngineRenderer.EVENT_DIALOG_OPENED = DialogManager.EVENT_DIALOG_OPENED;
    EngineRenderer.EVENT_DIALOG_CLOSED = DialogManager.EVENT_DIALOG_CLOSED;
    return EngineRenderer;
}(AEventDispatcher));
export default EngineRenderer;
//# sourceMappingURL=EngineRenderer.js.map