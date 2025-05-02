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
import { ACellTableSection, GridStyleManager, isAbortAble, isAsyncUpdate, isLoadingCell, nonUniformContext, PrefetchMixin, tableIds, uniformContext, } from 'lineupengine';
import { HOVER_DELAY_SHOW_DETAIL } from '../constants';
import { AEventDispatcher, clear, debounce, suffix, } from '../internal';
import { Column, isGroup, isMultiLevelColumn, Ranking, StackColumn, defaultGroup, } from '../model';
import { CANVAS_HEIGHT, COLUMN_PADDING, cssClass, engineCssClass } from '../styles';
import { lineupAnimation } from './animation';
import MultiLevelRenderColumn from './MultiLevelRenderColumn';
import RenderColumn, {} from './RenderColumn';
import SelectionManager from './SelectionManager';
import { groupRoots } from '../model/internal';
import { isAlwaysShowingGroupStrategy, toRowMeta } from '../provider/internal';
/** @internal */
var RankingEvents = /** @class */ (function (_super) {
    __extends(RankingEvents, _super);
    function RankingEvents() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RankingEvents.prototype.fire = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        _super.prototype.fire.apply(this, __spreadArray([type], args, false));
    };
    RankingEvents.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            RankingEvents.EVENT_WIDTH_CHANGED,
            RankingEvents.EVENT_UPDATE_DATA,
            RankingEvents.EVENT_RECREATE,
            RankingEvents.EVENT_HIGHLIGHT_CHANGED,
        ]);
    };
    RankingEvents.EVENT_WIDTH_CHANGED = 'widthChanged';
    RankingEvents.EVENT_UPDATE_DATA = 'updateData';
    RankingEvents.EVENT_RECREATE = 'recreate';
    RankingEvents.EVENT_HIGHLIGHT_CHANGED = 'highlightChanged';
    return RankingEvents;
}(AEventDispatcher));
var PASSIVE = {
    passive: false,
};
var EngineRanking = /** @class */ (function (_super) {
    __extends(EngineRanking, _super);
    function EngineRanking(ranking, header, body, tableId, style, ctx, roptions) {
        if (roptions === void 0) { roptions = {}; }
        var _this = _super.call(this, header, body, tableId, style, { mixins: [PrefetchMixin], batchSize: 20 }) || this;
        _this.ranking = ranking;
        _this.ctx = ctx;
        _this.loadingCanvas = new WeakMap();
        _this.data = [];
        _this.highlight = -1;
        _this.canvasPool = [];
        _this.currentCanvasShift = 0;
        _this.currentCanvasWidth = 0;
        _this.events = new RankingEvents();
        _this.roptions = {
            animation: true,
            levelOfDetail: function () { return 'high'; },
            customRowUpdate: function () { return undefined; },
            flags: {
                disableFrozenColumns: false,
                advancedModelFeatures: true,
                advancedRankingFeatures: true,
                advancedUIFeatures: true,
                combineViaDragNDrop: true,
            },
            selectionActivateFilter: true,
        };
        _this.canvasMouseHandler = {
            timer: new Set(),
            hoveredRows: new Set(),
            cleanUp: function () {
                var c = _this.canvasMouseHandler;
                c.timer.forEach(function (timer) {
                    clearTimeout(timer);
                });
                c.timer.clear();
                for (var _i = 0, _a = Array.from(c.hoveredRows); _i < _a.length; _i++) {
                    var row = _a[_i];
                    c.unhover(row);
                }
            },
            enter: function (evt) {
                var c = _this.canvasMouseHandler;
                c.cleanUp();
                var row = evt.currentTarget;
                row.addEventListener('mouseleave', c.leave, PASSIVE);
                c.timer.add(setTimeout(function () {
                    c.hoveredRows.add(row);
                    _this.updateHoveredRow(row, true);
                }, HOVER_DELAY_SHOW_DETAIL));
            },
            leave: function (evt) {
                // on row to survive canvas removal
                var c = _this.canvasMouseHandler;
                var row = (typeof evt.currentTarget !== 'undefined' ? evt.currentTarget : evt);
                c.unhover(row);
                c.cleanUp();
            },
            unhover: function (row) {
                // remove self
                var c = _this.canvasMouseHandler;
                c.hoveredRows.delete(row);
                row.removeEventListener('mouseleave', c.leave);
                if (!EngineRanking.isCanvasRenderedRow(row) && row.parentElement) {
                    // and part of dom
                    setTimeout(function () { return _this.updateHoveredRow(row, false); });
                }
            },
        };
        _this.highlightHandler = {
            enabled: false,
            enter: function (evt) {
                if (_this.highlight >= 0) {
                    var old = _this.body.getElementsByClassName(engineCssClass('highlighted'))[0];
                    if (old) {
                        old.classList.remove(engineCssClass('highlighted'));
                    }
                    _this.highlight = -1;
                }
                var row = evt.currentTarget;
                var dataIndex = Number.parseInt(row.dataset.i || '-1', 10);
                _this.events.fire(EngineRanking.EVENT_HIGHLIGHT_CHANGED, dataIndex);
            },
            leave: function () {
                if (_this.highlight >= 0) {
                    var old = _this.body.getElementsByClassName(engineCssClass('highlighted'))[0];
                    if (old) {
                        old.classList.remove(engineCssClass('highlighted'));
                    }
                    _this.highlight = -1;
                }
                _this.events.fire(EngineRanking.EVENT_HIGHLIGHT_CHANGED, -1);
            },
        };
        Object.assign(_this.roptions, roptions);
        body.dataset.ranking = ranking.id;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = _this;
        _this.delayedUpdate = debounce(function () {
            if (this.type !== Ranking.EVENT_DIRTY_VALUES) {
                that.events.fire(EngineRanking.EVENT_UPDATE_DATA);
                return;
            }
            if (this.primaryType !== Column.EVENT_RENDERER_TYPE_CHANGED &&
                this.primaryType !== Column.EVENT_GROUP_RENDERER_TYPE_CHANGED &&
                this.primaryType !== Column.EVENT_LABEL_CHANGED) {
                // just the single column will be updated
                that.updateBody();
            }
        }, 50, function (current, next) {
            var currentEvent = current.self.type;
            // order changed is more important
            return currentEvent === Ranking.EVENT_ORDER_CHANGED ? current : next;
        });
        _this.delayedUpdateAll = debounce(function () { return _this.updateAll(); }, 50);
        _this.delayedUpdateColumnWidths = debounce(function () { return _this.updateColumnWidths(); }, 50);
        ranking.on("".concat(Ranking.EVENT_ADD_COLUMN, ".hist"), function (col, index) {
            // index doesn't consider the hidden columns
            var hiddenOffset = _this.ranking.children.slice(0, index).reduce(function (acc, c) { return acc + (!c.isVisible() ? 1 : 0); }, 0);
            var shiftedIndex = index - hiddenOffset;
            _this.columns.splice(shiftedIndex, 0, _this.createCol(col, shiftedIndex));
            _this.reindex();
            _this.delayedUpdateAll();
        });
        ranking.on("".concat(Ranking.EVENT_REMOVE_COLUMN, ".body"), function (col, index) {
            EngineRanking.disableListener(col);
            // index doesn't consider the hidden columns
            var hiddenOffset = _this.ranking.children.slice(0, index).reduce(function (acc, c) { return acc + (!c.isVisible() ? 1 : 0); }, 0);
            var shiftedIndex = index - hiddenOffset;
            _this.columns.splice(shiftedIndex, 1);
            _this.reindex();
            _this.delayedUpdateAll();
        });
        ranking.on("".concat(Ranking.EVENT_MOVE_COLUMN, ".body"), function (col, index) {
            //delete first
            var shiftedOld = _this.columns.findIndex(function (d) { return d.c === col; });
            var c = _this.columns.splice(shiftedOld, 1)[0];
            // adapt target index based on previous index, i.e shift by one
            var hiddenOffset = _this.ranking.children.slice(0, index).reduce(function (acc, c) { return acc + (!c.isVisible() ? 1 : 0); }, 0);
            var shiftedIndex = index - hiddenOffset;
            _this.columns.splice(shiftedOld < shiftedIndex ? shiftedIndex - 1 : shiftedIndex, 0, c);
            _this.reindex();
            _this.delayedUpdateAll();
        });
        ranking.on("".concat(Ranking.EVENT_COLUMN_VISIBILITY_CHANGED, ".body"), function (col, _oldValue, newValue) {
            if (newValue) {
                // become visible
                var index = ranking.children.indexOf(col);
                var hiddenOffset = _this.ranking.children
                    .slice(0, index)
                    .reduce(function (acc, c) { return acc + (!c.isVisible() ? 1 : 0); }, 0);
                var shiftedIndex = index - hiddenOffset;
                _this.columns.splice(shiftedIndex, 0, _this.createCol(col, shiftedIndex));
            }
            else {
                // hide
                var index = _this.columns.findIndex(function (d) { return d.c === col; });
                EngineRanking.disableListener(col);
                _this.columns.splice(index, 1);
            }
            _this.reindex();
            _this.delayedUpdateAll();
        });
        ranking.on("".concat(Ranking.EVENT_ORDER_CHANGED, ".body"), _this.delayedUpdate);
        _this.selection = new SelectionManager(_this.ctx, body, _this.roptions);
        _this.selection.on(SelectionManager.EVENT_SELECT_RANGE, function (from, to, additional) {
            _this.selection.selectRange(_this.data.slice(from, to + 1), additional);
        });
        _this.renderCtx = Object.assign({
            isGroup: function (index) { return isGroup(_this.data[index]); },
            getRow: function (index) { return _this.data[index]; },
            getGroup: function (index) { return _this.data[index]; },
        }, ctx);
        // default context
        _this.columns = ranking.children.filter(function (c) { return c.isVisible(); }).map(function (c, i) { return _this.createCol(c, i); });
        _this._context = Object.assign({
            columns: _this.columns,
            column: nonUniformContext(_this.columns.map(function (w) { return w.width; }), 100, COLUMN_PADDING),
        }, uniformContext(0, 20));
        _this.columns.forEach(function (column) {
            if (column instanceof MultiLevelRenderColumn) {
                column.updateWidthRule(_this.style);
            }
            column.renderers = _this.ctx.createRenderer(column.c);
        });
        _this.style.updateRule("hoverOnly".concat(_this.tableId), "\n      #".concat(tableIds(_this.tableId).tbody, ":hover > .").concat(engineCssClass('tr'), ":hover .").concat(cssClass('hover-only'), ",\n      #").concat(tableIds(_this.tableId).tbody, " > .").concat(engineCssClass('tr'), ".").concat(cssClass('selected'), " .").concat(cssClass('hover-only'), ",\n      #").concat(tableIds(_this.tableId).tbody, " > .").concat(engineCssClass('tr'), ".").concat(engineCssClass('highlighted'), " .").concat(cssClass('hover-only')), {
            visibility: 'visible',
        });
        _this.updateCanvasRule();
        return _this;
    }
    EngineRanking.prototype.on = function (type, listener) {
        this.events.on(type, listener);
        return this;
    };
    Object.defineProperty(EngineRanking.prototype, "id", {
        get: function () {
            return this.ranking.id;
        },
        enumerable: false,
        configurable: true
    });
    EngineRanking.prototype.onVisibilityChanged = function (visible) {
        _super.prototype.onVisibilityChanged.call(this, visible);
        if (visible) {
            this.delayedUpdate.call({ type: Ranking.EVENT_ORDER_CHANGED });
        }
    };
    EngineRanking.prototype.updateHeaders = function () {
        this.updateColumnSummaryFlag();
        return _super.prototype.updateHeaders.call(this);
    };
    Object.defineProperty(EngineRanking.prototype, "currentData", {
        get: function () {
            return this.data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EngineRanking.prototype, "context", {
        get: function () {
            return this._context;
        },
        enumerable: false,
        configurable: true
    });
    EngineRanking.prototype.createHeader = function (_document, column) {
        return column.createHeader();
    };
    EngineRanking.prototype.updateColumnSummaryFlag = function () {
        // updates the header flag depending on whether there are any sublabels
        this.header.classList.toggle(cssClass('show-sublabel'), this.columns.some(function (c) { return c.hasSummaryLine(); }));
    };
    EngineRanking.prototype.updateHeader = function (node, column) {
        if (column instanceof MultiLevelRenderColumn) {
            column.updateWidthRule(this.style);
        }
        return column.updateHeader(node);
    };
    EngineRanking.prototype.createCell = function (_document, index, column) {
        return column.createCell(index);
    };
    EngineRanking.prototype.createCellHandled = function (col, index) {
        var r = col.createCell(index);
        var item;
        if (isAsyncUpdate(r)) {
            item = this.handleCellReady(r.item, r.ready, col.index);
        }
        else {
            item = r;
        }
        this.initCellClasses(item, col.id);
        return item;
    };
    EngineRanking.prototype.updateCell = function (node, index, column) {
        return column.updateCell(node, index);
    };
    EngineRanking.prototype.selectCanvas = function () {
        if (this.canvasPool.length > 0) {
            return this.canvasPool.pop();
        }
        var c = this.body.ownerDocument.createElement('canvas');
        c.classList.add(cssClass("low-c".concat(this.tableId)));
        return c;
    };
    EngineRanking.prototype.rowFlags = function (row) {
        var rowany = row;
        var v = rowany.__lu__;
        if (v == null) {
            return (rowany.__lu__ = {});
        }
        return v;
    };
    EngineRanking.prototype.visibleRenderedWidth = function () {
        var width = 0;
        for (var _i = 0, _a = this.visibleColumns.frozen; _i < _a.length; _i++) {
            var col = _a[_i];
            width += this.columns[col].width + COLUMN_PADDING;
        }
        for (var col = this.visibleColumns.first; col <= this.visibleColumns.last; ++col) {
            width += this.columns[col].width + COLUMN_PADDING;
        }
        if (width > 0) {
            width -= COLUMN_PADDING; // for the last one
        }
        return width;
    };
    EngineRanking.prototype.pushLazyRedraw = function (canvas, x, column, render) {
        var _this = this;
        render.then(function (r) {
            var l = _this.loadingCanvas.get(canvas) || [];
            var pos = l.findIndex(function (d) { return d.render === render && d.col === column.index; });
            if (pos < 0) {
                // not part anymore ignore
                return;
            }
            l.splice(pos, 1);
            if (typeof r === 'function') {
                // i.e not aborted
                var ctx = canvas.getContext('2d');
                ctx.clearRect(x - 1, 0, column.width + 2, canvas.height);
                ctx.save();
                ctx.translate(x, 0);
                r(ctx);
                ctx.restore();
            }
            if (l.length > 0) {
                return;
            }
            _this.loadingCanvas.delete(canvas);
            canvas.classList.remove(cssClass('loading-c'));
        });
        if (!this.loadingCanvas.has(canvas)) {
            canvas.classList.add(cssClass('loading-c'));
            this.loadingCanvas.set(canvas, [{ col: column.index, render: render }]);
        }
        else {
            this.loadingCanvas.get(canvas).push({ col: column.index, render: render });
        }
    };
    EngineRanking.prototype.renderRow = function (canvas, node, index) {
        var _this = this;
        if (this.loadingCanvas.has(canvas)) {
            for (var _i = 0, _a = this.loadingCanvas.get(canvas); _i < _a.length; _i++) {
                var a = _a[_i];
                a.render.abort();
            }
            this.loadingCanvas.delete(canvas);
        }
        canvas.classList.remove(cssClass('loading-c'));
        canvas.width = this.currentCanvasWidth;
        canvas.height = CANVAS_HEIGHT;
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        var domColumns = [];
        var x = 0;
        var renderCellImpl = function (col) {
            var c = _this.columns[col];
            var r = c.renderCell(ctx, index);
            if (r === true) {
                domColumns.push(c);
            }
            else if (r !== false && isAbortAble(r)) {
                _this.pushLazyRedraw(canvas, x, c, r);
            }
            var shift = c.width + COLUMN_PADDING;
            x += shift;
            ctx.translate(shift, 0);
        };
        for (var _b = 0, _c = this.visibleColumns.frozen; _b < _c.length; _b++) {
            var col = _c[_b];
            renderCellImpl(col);
        }
        for (var col = this.visibleColumns.first; col <= this.visibleColumns.last; ++col) {
            renderCellImpl(col);
        }
        ctx.restore();
        var visibleElements = node.childElementCount - 1; // for canvas
        if (domColumns.length === 0) {
            while (node.lastElementChild !== node.firstElementChild) {
                var n = node.lastElementChild;
                node.removeChild(n);
                this.recycleCell(n);
            }
            return;
        }
        if (domColumns.length === 1) {
            var first = domColumns[0];
            if (visibleElements === 0) {
                var item = this.createCellHandled(first, index);
                item.classList.add(cssClass('low'));
                node.appendChild(item);
                return;
            }
            var firstDOM = node.lastElementChild;
            if (visibleElements === 1 && firstDOM.dataset.colId === first.id) {
                var isLoading = isLoadingCell(firstDOM);
                if (isLoading) {
                    var item = this.createCellHandled(first, index);
                    node.replaceChild(item, firstDOM);
                    this.recycleCell(firstDOM, first.index);
                    return;
                }
                this.updateCellImpl(first, node.lastElementChild, index);
                return;
            }
        }
        var existing = new Map(Array.from(node.children).slice(1).map(function (d) { return [d.dataset.id, d]; }));
        for (var _d = 0, domColumns_1 = domColumns; _d < domColumns_1.length; _d++) {
            var col = domColumns_1[_d];
            var elem = existing.get(col.id);
            if (elem && !isLoadingCell(elem)) {
                existing.delete(col.id);
                this.updateCellImpl(col, elem, index);
            }
            else {
                var c = this.createCellHandled(col, index);
                c.classList.add(cssClass('low'));
                node.appendChild(c);
            }
        }
        existing.forEach(function (v) {
            v.remove();
            _this.recycleCell(v);
        });
    };
    EngineRanking.prototype.updateCanvasCell = function (canvas, node, index, column, x) {
        // delete lazy that would render the same thing
        if (this.loadingCanvas.has(canvas)) {
            var l = this.loadingCanvas.get(canvas);
            var me = l.filter(function (d) { return d.col === column.index; });
            if (me.length > 0) {
                this.loadingCanvas.set(canvas, l.filter(function (d) { return d.col !== column.index; }));
                for (var _i = 0, me_1 = me; _i < me_1.length; _i++) {
                    var a = me_1[_i];
                    a.render.abort();
                }
            }
        }
        var ctx = canvas.getContext('2d');
        ctx.clearRect(x - 1, 0, column.width + 2, canvas.height);
        ctx.save();
        ctx.translate(x, 0);
        var needDOM = column.renderCell(ctx, index);
        ctx.restore();
        if (typeof needDOM !== 'boolean' && isAbortAble(needDOM)) {
            this.pushLazyRedraw(canvas, x, column, needDOM);
        }
        if (needDOM !== true && node.childElementCount === 1) {
            // just canvas
            return;
        }
        var elem = node.querySelector("[data-id=\"".concat(column.id, "\"]"));
        if (elem && !needDOM) {
            elem.remove();
            this.recycleCell(elem, column.index);
            return;
        }
        if (elem) {
            return this.updateCellImpl(column, elem, index);
        }
        var c = this.createCellHandled(column, index);
        c.classList.add(cssClass('low'));
        node.appendChild(c);
    };
    EngineRanking.prototype.reindex = function () {
        this.columns.forEach(function (c, i) {
            c.index = i;
        });
    };
    EngineRanking.prototype.updateAll = function () {
        var _this = this;
        this.columns.forEach(function (c, i) {
            c.index = i;
            c.renderers = _this.ctx.createRenderer(c.c);
        });
        this._context = Object.assign({}, this._context, {
            column: nonUniformContext(this.columns.map(function (w) { return w.width; }), 100, COLUMN_PADDING),
        });
        this.updateColumnSummaryFlag();
        this.events.fire(EngineRanking.EVENT_RECREATE);
        _super.prototype.recreate.call(this);
        this.events.fire(EngineRanking.EVENT_WIDTH_CHANGED);
    };
    EngineRanking.prototype.updateBody = function () {
        var _this = this;
        if (this.hidden) {
            return;
        }
        this.events.fire(EngineRanking.EVENT_WIDTH_CHANGED);
        _super.prototype.forEachRow.call(this, function (row, rowIndex) { return _this.updateRow(row, rowIndex); });
    };
    EngineRanking.prototype.updateHeaderOf = function (col) {
        var i = this._context.columns.findIndex(function (d) { return d.c === col; });
        if (i < 0) {
            return false;
        }
        var node = this.header.children[i];
        var column = this._context.columns[i];
        if (node && column) {
            this.updateHeader(node, column);
        }
        this.updateColumnSummaryFlag();
        return node && column;
    };
    EngineRanking.prototype.createRow = function (node, rowIndex) {
        node.classList.add(this.style.cssClasses.tr);
        this.roptions.customRowUpdate(node, rowIndex);
        if (this.highlightHandler.enabled) {
            node.addEventListener('mouseenter', this.highlightHandler.enter, PASSIVE);
            this.rowFlags(node).highlight = true;
        }
        var isGroup = this.renderCtx.isGroup(rowIndex);
        var meta = this.toRowMeta(rowIndex);
        if (!meta) {
            delete node.dataset.meta;
        }
        else {
            node.dataset.meta = meta;
        }
        if (isGroup) {
            node.dataset.agg = 'group';
            _super.prototype.createRow.call(this, node, rowIndex);
            return;
        }
        var dataIndex = this.renderCtx.getRow(rowIndex).dataIndex;
        node.classList.toggle(engineCssClass('highlighted'), this.highlight === dataIndex);
        node.dataset.i = dataIndex.toString();
        node.dataset.agg = 'detail'; //or 'group'
        this.selection.updateState(node, dataIndex);
        this.selection.add(node);
        var low = this.roptions.levelOfDetail(rowIndex) === 'low';
        node.classList.toggle(cssClass('low'), low);
        if (!low || this.ctx.provider.isSelected(dataIndex)) {
            _super.prototype.createRow.call(this, node, rowIndex);
            return;
        }
        var canvas = this.selectCanvas();
        node.appendChild(canvas);
        node.addEventListener('mouseenter', this.canvasMouseHandler.enter, PASSIVE);
        this.renderRow(canvas, node, rowIndex);
    };
    EngineRanking.prototype.updateRow = function (node, rowIndex, hoverLod) {
        this.roptions.customRowUpdate(node, rowIndex);
        var computedLod = this.roptions.levelOfDetail(rowIndex);
        var low = (hoverLod ? hoverLod : computedLod) === 'low';
        var wasLow = node.classList.contains(cssClass('low'));
        var isGroup = this.renderCtx.isGroup(rowIndex);
        var wasGroup = node.dataset.agg === 'group';
        node.classList.toggle(cssClass('low'), computedLod === 'low');
        if (this.highlightHandler.enabled && !this.rowFlags(node).highlight) {
            node.addEventListener('mouseenter', this.highlightHandler.enter, PASSIVE);
            this.rowFlags(node).highlight = true;
        }
        if (isGroup !== wasGroup) {
            // change of mode clear the children to reinitialize them
            clear(node);
            // adapt body
            node.dataset.agg = isGroup ? 'group' : 'detail';
            if (isGroup) {
                node.dataset.i = '';
                this.selection.remove(node);
            }
            else {
                this.selection.add(node);
            }
        }
        if (wasLow && (!computedLod || isGroup)) {
            node.removeEventListener('mouseenter', this.canvasMouseHandler.enter);
        }
        var meta = this.toRowMeta(rowIndex);
        if (!meta) {
            delete node.dataset.meta;
        }
        else {
            node.dataset.meta = meta;
        }
        if (isGroup) {
            node.classList.remove(engineCssClass('highlighted'));
            _super.prototype.updateRow.call(this, node, rowIndex);
            return;
        }
        var dataIndex = this.renderCtx.getRow(rowIndex).dataIndex;
        node.classList.toggle(engineCssClass('highlighted'), this.highlight === dataIndex);
        node.dataset.i = dataIndex.toString();
        this.selection.updateState(node, dataIndex);
        var canvas = wasLow && node.firstElementChild.nodeName.toLowerCase() === 'canvas'
            ? node.firstElementChild
            : null;
        if (!low || this.ctx.provider.isSelected(dataIndex)) {
            if (canvas) {
                this.recycleCanvas(canvas);
                clear(node);
                node.removeEventListener('mouseenter', this.canvasMouseHandler.enter);
            }
            _super.prototype.updateRow.call(this, node, rowIndex);
            return;
        }
        // use canvas
        if (wasLow && canvas) {
            this.renderRow(canvas, node, rowIndex);
            return;
        }
        // clear old
        clear(node);
        node.dataset.agg = 'detail';
        var canvas2 = this.selectCanvas();
        node.appendChild(canvas2);
        node.addEventListener('mouseenter', this.canvasMouseHandler.enter, PASSIVE);
        this.renderRow(canvas2, node, rowIndex);
    };
    EngineRanking.prototype.updateCanvasBody = function () {
        var _this = this;
        this.updateCanvasRule();
        _super.prototype.forEachRow.call(this, function (row, index) {
            if (EngineRanking.isCanvasRenderedRow(row)) {
                _this.renderRow(row.firstElementChild, row, index);
            }
        });
    };
    EngineRanking.prototype.toRowMeta = function (rowIndex) {
        var _this = this;
        var provider = this.renderCtx.provider;
        var topNGetter = function (group) { return provider.getTopNAggregated(_this.ranking, group); };
        return toRowMeta(this.renderCtx.getRow(rowIndex), provider.getAggregationStrategy(), topNGetter);
    };
    EngineRanking.prototype.updateCanvasRule = function () {
        this.style.updateRule("renderCanvas".concat(this.tableId), ".".concat(cssClass("low-c".concat(this.tableId))), {
            transform: "translateX(".concat(this.currentCanvasShift, "px)"),
            width: "".concat(this.currentCanvasWidth, "px"),
        });
    };
    EngineRanking.prototype.updateShifts = function (top, left) {
        _super.prototype.updateShifts.call(this, top, left);
        var width = this.visibleRenderedWidth();
        if (left === this.currentCanvasShift && width === this.currentCanvasWidth) {
            return;
        }
        this.currentCanvasShift = left;
        this.currentCanvasWidth = width;
        this.updateCanvasBody();
    };
    EngineRanking.prototype.recycleCanvas = function (canvas) {
        if (this.loadingCanvas.has(canvas)) {
            for (var _i = 0, _a = this.loadingCanvas.get(canvas); _i < _a.length; _i++) {
                var a = _a[_i];
                a.render.abort();
            }
            this.loadingCanvas.delete(canvas);
        }
        else if (!canvas.classList.contains(cssClass('loading-c'))) {
            this.canvasPool.push(canvas);
        }
    };
    EngineRanking.prototype.enableHighlightListening = function (enable) {
        var _this = this;
        if (this.highlightHandler.enabled === enable) {
            return;
        }
        this.highlightHandler.enabled = enable;
        if (enable) {
            this.body.addEventListener('mouseleave', this.highlightHandler.leave, PASSIVE);
            _super.prototype.forEachRow.call(this, function (row) {
                row.addEventListener('mouseenter', _this.highlightHandler.enter, PASSIVE);
                _this.rowFlags(row).highlight = true;
            });
            return;
        }
        this.body.removeEventListener('mouseleave', this.highlightHandler.leave);
        _super.prototype.forEachRow.call(this, function (row) {
            row.removeEventListener('mouseenter', _this.highlightHandler.enter);
            _this.rowFlags(row).highlight = false;
        });
    };
    EngineRanking.prototype.updateHoveredRow = function (row, hover) {
        var isCanvas = EngineRanking.isCanvasRenderedRow(row);
        if (isCanvas !== hover) {
            return; // good nothing to do
        }
        var index = Number.parseInt(row.dataset.index, 10);
        this.updateRow(row, index, hover ? 'high' : 'low');
    };
    EngineRanking.prototype.forEachRow = function (callback, inplace) {
        if (inplace === void 0) { inplace = false; }
        var adapter = function (row, rowIndex) {
            if (EngineRanking.isCanvasRenderedRow(row)) {
                // skip canvas
                return;
            }
            callback(row, rowIndex);
        };
        return _super.prototype.forEachRow.call(this, adapter, inplace);
    };
    EngineRanking.prototype.updateSelection = function (selectedDataIndices) {
        var _this = this;
        _super.prototype.forEachRow.call(this, function (node, rowIndex) {
            if (_this.renderCtx.isGroup(rowIndex)) {
                _this.updateRow(node, rowIndex);
            }
            else {
                // fast pass for item
                _this.selection.update(node, selectedDataIndices);
            }
        }, true);
    };
    EngineRanking.prototype.updateColumnWidths = function () {
        var _this = this;
        // update the column context in place
        this._context.column = nonUniformContext(this._context.columns.map(function (w) { return w.width; }), 100, COLUMN_PADDING);
        _super.prototype.updateColumnWidths.call(this);
        var columns = this.context.columns;
        //no data update needed since just width changed
        columns.forEach(function (column) {
            if (column instanceof MultiLevelRenderColumn) {
                column.updateWidthRule(_this.style);
            }
            column.renderers = _this.ctx.createRenderer(column.c);
        });
        this.events.fire(EngineRanking.EVENT_WIDTH_CHANGED);
    };
    EngineRanking.prototype.computeShiftedIndex = function (index) {
        var columns = this.context.columns;
        // may not match if not all left columns are shown
        var leftOffset = 0;
        var indexOffset = 0;
        // shift frozen ones
        for (var _i = 0, _a = this.visibleColumns.frozen; _i < _a.length; _i++) {
            var frozenIndex = _a[_i];
            if (frozenIndex >= this.visibleColumns.first) {
                break;
            }
            leftOffset += columns[frozenIndex].width + COLUMN_PADDING;
            indexOffset--;
        }
        // shift visible before
        indexOffset += this.visibleColumns.first;
        for (var i = this.visibleColumns.first; i < index; ++i) {
            leftOffset += columns[i].width + COLUMN_PADDING;
        }
        return {
            leftOffset: leftOffset,
            indexOffset: indexOffset,
        };
    };
    EngineRanking.prototype.updateColumn = function (index) {
        var _this = this;
        var columns = this.context.columns;
        var column = columns[index];
        if (!column) {
            return false;
        }
        var _a = this.computeShiftedIndex(index), leftOffset = _a.leftOffset, indexOffset = _a.indexOffset;
        _super.prototype.forEachRow.call(this, function (row, rowIndex) {
            if (EngineRanking.isCanvasRenderedRow(row)) {
                _this.updateCanvasCell(row.firstElementChild, row, rowIndex, column, leftOffset);
                return;
            }
            _this.updateCellImpl(column, row.children[index - indexOffset], rowIndex);
        });
        return true;
    };
    EngineRanking.prototype.updateCellImpl = function (column, before, rowIndex) {
        if (!before) {
            return; // race condition
        }
        var r = this.updateCell(before, rowIndex, column);
        var after;
        if (isAsyncUpdate(r)) {
            after = this.handleCellReady(r.item, r.ready, column.index);
        }
        else {
            after = r;
        }
        if (before === after || !after) {
            return;
        }
        this.initCellClasses(after, column.id);
        before.parentElement.replaceChild(after, before);
    };
    EngineRanking.prototype.initCellClasses = function (node, id) {
        node.dataset.id = id;
        node.classList.add(engineCssClass('td'), this.style.cssClasses.td, engineCssClass("td-".concat(this.tableId)));
    };
    EngineRanking.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.style.deleteRule("hoverOnly".concat(this.tableId));
        this.style.deleteRule("renderCanvas".concat(this.tableId));
        this.ranking.flatColumns.forEach(function (c) { return EngineRanking.disableListener(c); });
    };
    EngineRanking.prototype.groupData = function () {
        var _this = this;
        var groups = this.ranking.getGroups();
        var provider = this.ctx.provider;
        var strategy = provider.getAggregationStrategy();
        var alwaysShowGroup = isAlwaysShowingGroupStrategy(strategy);
        var r = [];
        if (groups.length === 0) {
            return r;
        }
        var pushItem = function (group, dataIndex, i) {
            r.push({
                group: group,
                dataIndex: dataIndex,
                relativeIndex: i,
            });
        };
        if (groups.length === 1 && groups[0].name === defaultGroup.name) {
            var group = groups[0];
            var l = group.order.length;
            for (var i = 0; i < l; ++i) {
                pushItem(group, group.order[i], i);
            }
            return r;
        }
        var roots = groupRoots(groups);
        var pushGroup = function (group) {
            var n = provider.getTopNAggregated(_this.ranking, group);
            // all are IOrderedGroup since propagated
            var ordered = group;
            var groupParent = group;
            if (n === 0 || alwaysShowGroup) {
                r.push(ordered);
            }
            if (n !== 0 && Array.isArray(groupParent.subGroups) && groupParent.subGroups.length > 0) {
                for (var _i = 0, _a = groupParent.subGroups; _i < _a.length; _i++) {
                    var g = _a[_i];
                    pushGroup(g);
                }
                return;
            }
            var l = n < 0 ? ordered.order.length : Math.min(n, ordered.order.length);
            for (var i = 0; i < l; ++i) {
                pushItem(ordered, ordered.order[i], i);
            }
        };
        for (var _i = 0, roots_1 = roots; _i < roots_1.length; _i++) {
            var root = roots_1[_i];
            pushGroup(root);
        }
        return r;
    };
    EngineRanking.prototype.render = function (data, rowContext) {
        var _this = this;
        var previous = this._context;
        var previousData = this.data;
        this.data = data;
        this.columns.forEach(function (c, i) {
            c.index = i;
            c.renderers = _this.ctx.createRenderer(c.c);
        });
        this._context = Object.assign({
            columns: this.columns,
            column: nonUniformContext(this.columns.map(function (w) { return w.width; }), 100, COLUMN_PADDING),
        }, rowContext);
        if (!this.bodyScroller) {
            // somehow not part of dom
            return;
        }
        this.events.fire(EngineRanking.EVENT_RECREATE);
        return _super.prototype.recreate.call(this, this.roptions.animation ? lineupAnimation(previous, previousData, this.data) : undefined);
    };
    EngineRanking.prototype.setHighlight = function (dataIndex) {
        this.highlight = dataIndex;
        var old = this.body.querySelector("[data-i].".concat(engineCssClass('highlighted')));
        if (old) {
            old.classList.remove(engineCssClass('highlighted'));
        }
        if (dataIndex < 0) {
            return false;
        }
        var item = this.body.querySelector("[data-i=\"".concat(dataIndex, "\"]"));
        if (item) {
            item.classList.add(engineCssClass('highlighted'));
        }
        return item != null;
    };
    EngineRanking.prototype.findNearest = function (dataIndices) {
        var _this = this;
        // find the nearest visible data index
        // first check if already visible
        var index = dataIndices.find(function (d) { return Boolean(_this.body.querySelectorAll("[data-i=\"".concat(d, "\"]"))); });
        if (index != null) {
            return index; // visible one
        }
        var visible = this.visible;
        var lookFor = new Set(dataIndices);
        var firstBeforePos = -1;
        var firstAfterPos = -1;
        for (var i = visible.first; i >= 0; --i) {
            var d = this.data[i];
            if (!isGroup(d) && lookFor.has(d.dataIndex)) {
                firstBeforePos = i;
                break;
            }
        }
        for (var i = visible.last; i < this.data.length; ++i) {
            var d = this.data[i];
            if (!isGroup(d) && lookFor.has(d.dataIndex)) {
                firstAfterPos = i;
                break;
            }
        }
        if (firstBeforePos < 0 && firstBeforePos < 0) {
            return -1; // not found at all
        }
        var nearestPos = firstBeforePos >= 0 && visible.first - firstBeforePos < firstAfterPos - visible.last
            ? firstBeforePos
            : firstAfterPos;
        return this.data[nearestPos].dataIndex;
    };
    EngineRanking.prototype.scrollIntoView = function (dataIndex) {
        var _this = this;
        var item = this.body.querySelector("[data-i=\"".concat(dataIndex, "\"]"));
        if (item) {
            item.scrollIntoView(true);
            return true;
        }
        var index = this.data.findIndex(function (d) { return !isGroup(d) && d.dataIndex === dataIndex; });
        if (index < 0) {
            return false; // part of a group?
        }
        var posOf = function () {
            var c = _this._context;
            if (c.exceptions.length === 0 || index < c.exceptions[0].index) {
                // fast pass
                return index * c.defaultRowHeight;
            }
            var before = c.exceptions
                .slice()
                .reverse()
                .find(function (d) { return d.index <= index; });
            if (!before) {
                return -1;
            }
            if (before.index === index) {
                return before.y;
            }
            var regular = index - before.index - 1;
            return before.y2 + regular * c.defaultRowHeight;
        };
        var pos = posOf();
        if (pos < 0) {
            return false;
        }
        var scroller = this.bodyScroller;
        if (!scroller) {
            return false;
        }
        var top = scroller.scrollTop;
        scroller.scrollTop = Math.min(pos, scroller.scrollHeight - scroller.clientHeight);
        this.onScrolledVertically(scroller.scrollTop, scroller.clientHeight, top < scroller.scrollTop);
        var found = this.body.querySelector("[data-i=\"".concat(dataIndex, "\"]"));
        if (found) {
            found.scrollIntoView(true);
            return true;
        }
        return false;
    };
    EngineRanking.prototype.getHighlight = function () {
        var item = this.body.querySelector("[data-i]:hover, [data-i].".concat(engineCssClass('highlighted')));
        if (item) {
            return Number.parseInt(item.dataset.i, 10);
        }
        return this.highlight;
    };
    EngineRanking.prototype.createCol = function (c, index) {
        var _this = this;
        var col = isMultiLevelColumn(c) && !c.getCollapsed()
            ? new MultiLevelRenderColumn(c, index, this.renderCtx, this.roptions.flags)
            : new RenderColumn(c, index, this.renderCtx, this.roptions.flags);
        c.on("".concat(Column.EVENT_WIDTH_CHANGED, ".body"), function () {
            // replace myself upon width change since we renderers are allowed to
            col.renderers = _this.ctx.createRenderer(c);
            _this.delayedUpdateColumnWidths();
        });
        var debounceUpdate = debounce(function () {
            var valid = _this.updateColumn(col.index);
            if (!valid) {
                EngineRanking.disableListener(c); // destroy myself
            }
        }, 25);
        c.on(["".concat(Column.EVENT_RENDERER_TYPE_CHANGED, ".body"), "".concat(Column.EVENT_GROUP_RENDERER_TYPE_CHANGED, ".body")], function () {
            // replace myself upon renderer type change
            col.renderers = _this.ctx.createRenderer(c);
            debounceUpdate();
        });
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        c.on("".concat(Column.EVENT_DIRTY_HEADER, ".body"), function () {
            var valid = that.updateHeaderOf(col.c);
            if (!valid) {
                EngineRanking.disableListener(c); // destroy myself
            }
        });
        c.on(suffix('.body', Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_CACHES), function () {
            // replace myself upon renderer type change
            col.renderers = _this.ctx.createRenderer(c);
            var valid = _this.updateHeaderOf(col.c);
            if (!valid) {
                EngineRanking.disableListener(c); // destroy myself
            }
        });
        c.on("".concat(Column.EVENT_DIRTY_VALUES, ".body"), debounceUpdate);
        if (isMultiLevelColumn(c)) {
            c.on("".concat(StackColumn.EVENT_COLLAPSE_CHANGED, ".body"), function () {
                // rebuild myself from scratch
                EngineRanking.disableListener(c); // destroy myself
                var index = col.index;
                var replacement = _this.createCol(c, index);
                replacement.index = index;
                _this.columns.splice(index, 1, replacement);
                _this.delayedUpdateAll();
            });
            if (!c.getCollapsed()) {
                col.updateWidthRule(this.style);
                c.on("".concat(StackColumn.EVENT_MULTI_LEVEL_CHANGED, ".body"), function () {
                    col.updateWidthRule(_this.style);
                });
                c.on("".concat(StackColumn.EVENT_MULTI_LEVEL_CHANGED, ".bodyUpdate"), debounceUpdate);
            }
        }
        return col;
    };
    EngineRanking.isCanvasRenderedRow = function (row) {
        return (row.classList.contains(cssClass('low')) &&
            row.childElementCount >= 1 &&
            row.firstElementChild.nodeName.toLowerCase() === 'canvas');
    };
    EngineRanking.disableListener = function (c) {
        c.on("".concat(Column.EVENT_WIDTH_CHANGED, ".body"), null);
        c.on(suffix('.body', Column.EVENT_RENDERER_TYPE_CHANGED, Column.EVENT_GROUP_RENDERER_TYPE_CHANGED, Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_CACHES, Column.EVENT_LABEL_CHANGED), null);
        c.on("".concat(Ranking.EVENT_DIRTY_HEADER, ".body"), null);
        c.on("".concat(Ranking.EVENT_DIRTY_VALUES, ".body"), null);
        if (!isMultiLevelColumn(c)) {
            return;
        }
        c.on("".concat(StackColumn.EVENT_COLLAPSE_CHANGED, ".body"), null);
        c.on("".concat(StackColumn.EVENT_MULTI_LEVEL_CHANGED, ".body"), null);
        c.on("".concat(StackColumn.EVENT_MULTI_LEVEL_CHANGED, ".bodyUpdate"), null);
    };
    EngineRanking.EVENT_WIDTH_CHANGED = RankingEvents.EVENT_WIDTH_CHANGED;
    EngineRanking.EVENT_UPDATE_DATA = RankingEvents.EVENT_UPDATE_DATA;
    EngineRanking.EVENT_RECREATE = RankingEvents.EVENT_RECREATE;
    EngineRanking.EVENT_HIGHLIGHT_CHANGED = RankingEvents.EVENT_HIGHLIGHT_CHANGED;
    return EngineRanking;
}(ACellTableSection));
export default EngineRanking;
//# sourceMappingURL=EngineRanking.js.map