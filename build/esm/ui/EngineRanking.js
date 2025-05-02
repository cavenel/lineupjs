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
class RankingEvents extends AEventDispatcher {
    fire(type, ...args) {
        super.fire(type, ...args);
    }
    createEventList() {
        return super
            .createEventList()
            .concat([
            RankingEvents.EVENT_WIDTH_CHANGED,
            RankingEvents.EVENT_UPDATE_DATA,
            RankingEvents.EVENT_RECREATE,
            RankingEvents.EVENT_HIGHLIGHT_CHANGED,
        ]);
    }
}
RankingEvents.EVENT_WIDTH_CHANGED = 'widthChanged';
RankingEvents.EVENT_UPDATE_DATA = 'updateData';
RankingEvents.EVENT_RECREATE = 'recreate';
RankingEvents.EVENT_HIGHLIGHT_CHANGED = 'highlightChanged';
const PASSIVE = {
    passive: false,
};
class EngineRanking extends ACellTableSection {
    constructor(ranking, header, body, tableId, style, ctx, roptions = {}) {
        super(header, body, tableId, style, { mixins: [PrefetchMixin], batchSize: 20 });
        this.ranking = ranking;
        this.ctx = ctx;
        this.loadingCanvas = new WeakMap();
        this.data = [];
        this.highlight = -1;
        this.canvasPool = [];
        this.currentCanvasShift = 0;
        this.currentCanvasWidth = 0;
        this.events = new RankingEvents();
        this.roptions = {
            animation: true,
            levelOfDetail: () => 'high',
            customRowUpdate: () => undefined,
            flags: {
                disableFrozenColumns: false,
                advancedModelFeatures: true,
                advancedRankingFeatures: true,
                advancedUIFeatures: true,
                combineViaDragNDrop: true,
            },
            selectionActivateFilter: true,
        };
        this.canvasMouseHandler = {
            timer: new Set(),
            hoveredRows: new Set(),
            cleanUp: () => {
                const c = this.canvasMouseHandler;
                c.timer.forEach((timer) => {
                    clearTimeout(timer);
                });
                c.timer.clear();
                for (const row of Array.from(c.hoveredRows)) {
                    c.unhover(row);
                }
            },
            enter: (evt) => {
                const c = this.canvasMouseHandler;
                c.cleanUp();
                const row = evt.currentTarget;
                row.addEventListener('mouseleave', c.leave, PASSIVE);
                c.timer.add(setTimeout(() => {
                    c.hoveredRows.add(row);
                    this.updateHoveredRow(row, true);
                }, HOVER_DELAY_SHOW_DETAIL));
            },
            leave: (evt) => {
                // on row to survive canvas removal
                const c = this.canvasMouseHandler;
                const row = (typeof evt.currentTarget !== 'undefined' ? evt.currentTarget : evt);
                c.unhover(row);
                c.cleanUp();
            },
            unhover: (row) => {
                // remove self
                const c = this.canvasMouseHandler;
                c.hoveredRows.delete(row);
                row.removeEventListener('mouseleave', c.leave);
                if (!EngineRanking.isCanvasRenderedRow(row) && row.parentElement) {
                    // and part of dom
                    setTimeout(() => this.updateHoveredRow(row, false));
                }
            },
        };
        this.highlightHandler = {
            enabled: false,
            enter: (evt) => {
                if (this.highlight >= 0) {
                    const old = this.body.getElementsByClassName(engineCssClass('highlighted'))[0];
                    if (old) {
                        old.classList.remove(engineCssClass('highlighted'));
                    }
                    this.highlight = -1;
                }
                const row = evt.currentTarget;
                const dataIndex = Number.parseInt(row.dataset.i || '-1', 10);
                this.events.fire(EngineRanking.EVENT_HIGHLIGHT_CHANGED, dataIndex);
            },
            leave: () => {
                if (this.highlight >= 0) {
                    const old = this.body.getElementsByClassName(engineCssClass('highlighted'))[0];
                    if (old) {
                        old.classList.remove(engineCssClass('highlighted'));
                    }
                    this.highlight = -1;
                }
                this.events.fire(EngineRanking.EVENT_HIGHLIGHT_CHANGED, -1);
            },
        };
        Object.assign(this.roptions, roptions);
        body.dataset.ranking = ranking.id;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        this.delayedUpdate = debounce(function () {
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
        }, 50, (current, next) => {
            const currentEvent = current.self.type;
            // order changed is more important
            return currentEvent === Ranking.EVENT_ORDER_CHANGED ? current : next;
        });
        this.delayedUpdateAll = debounce(() => this.updateAll(), 50);
        this.delayedUpdateColumnWidths = debounce(() => this.updateColumnWidths(), 50);
        ranking.on(`${Ranking.EVENT_ADD_COLUMN}.hist`, (col, index) => {
            // index doesn't consider the hidden columns
            const hiddenOffset = this.ranking.children.slice(0, index).reduce((acc, c) => acc + (!c.isVisible() ? 1 : 0), 0);
            const shiftedIndex = index - hiddenOffset;
            this.columns.splice(shiftedIndex, 0, this.createCol(col, shiftedIndex));
            this.reindex();
            this.delayedUpdateAll();
        });
        ranking.on(`${Ranking.EVENT_REMOVE_COLUMN}.body`, (col, index) => {
            EngineRanking.disableListener(col);
            // index doesn't consider the hidden columns
            const hiddenOffset = this.ranking.children.slice(0, index).reduce((acc, c) => acc + (!c.isVisible() ? 1 : 0), 0);
            const shiftedIndex = index - hiddenOffset;
            this.columns.splice(shiftedIndex, 1);
            this.reindex();
            this.delayedUpdateAll();
        });
        ranking.on(`${Ranking.EVENT_MOVE_COLUMN}.body`, (col, index) => {
            //delete first
            const shiftedOld = this.columns.findIndex((d) => d.c === col);
            const c = this.columns.splice(shiftedOld, 1)[0];
            // adapt target index based on previous index, i.e shift by one
            const hiddenOffset = this.ranking.children.slice(0, index).reduce((acc, c) => acc + (!c.isVisible() ? 1 : 0), 0);
            const shiftedIndex = index - hiddenOffset;
            this.columns.splice(shiftedOld < shiftedIndex ? shiftedIndex - 1 : shiftedIndex, 0, c);
            this.reindex();
            this.delayedUpdateAll();
        });
        ranking.on(`${Ranking.EVENT_COLUMN_VISIBILITY_CHANGED}.body`, (col, _oldValue, newValue) => {
            if (newValue) {
                // become visible
                const index = ranking.children.indexOf(col);
                const hiddenOffset = this.ranking.children
                    .slice(0, index)
                    .reduce((acc, c) => acc + (!c.isVisible() ? 1 : 0), 0);
                const shiftedIndex = index - hiddenOffset;
                this.columns.splice(shiftedIndex, 0, this.createCol(col, shiftedIndex));
            }
            else {
                // hide
                const index = this.columns.findIndex((d) => d.c === col);
                EngineRanking.disableListener(col);
                this.columns.splice(index, 1);
            }
            this.reindex();
            this.delayedUpdateAll();
        });
        ranking.on(`${Ranking.EVENT_ORDER_CHANGED}.body`, this.delayedUpdate);
        this.selection = new SelectionManager(this.ctx, body, this.roptions);
        this.selection.on(SelectionManager.EVENT_SELECT_RANGE, (from, to, additional) => {
            this.selection.selectRange(this.data.slice(from, to + 1), additional);
        });
        this.renderCtx = Object.assign({
            isGroup: (index) => isGroup(this.data[index]),
            getRow: (index) => this.data[index],
            getGroup: (index) => this.data[index],
        }, ctx);
        // default context
        this.columns = ranking.children.filter((c) => c.isVisible()).map((c, i) => this.createCol(c, i));
        this._context = Object.assign({
            columns: this.columns,
            column: nonUniformContext(this.columns.map((w) => w.width), 100, COLUMN_PADDING),
        }, uniformContext(0, 20));
        this.columns.forEach((column) => {
            if (column instanceof MultiLevelRenderColumn) {
                column.updateWidthRule(this.style);
            }
            column.renderers = this.ctx.createRenderer(column.c);
        });
        this.style.updateRule(`hoverOnly${this.tableId}`, `
      #${tableIds(this.tableId).tbody}:hover > .${engineCssClass('tr')}:hover .${cssClass('hover-only')},
      #${tableIds(this.tableId).tbody} > .${engineCssClass('tr')}.${cssClass('selected')} .${cssClass('hover-only')},
      #${tableIds(this.tableId).tbody} > .${engineCssClass('tr')}.${engineCssClass('highlighted')} .${cssClass('hover-only')}`, {
            visibility: 'visible',
        });
        this.updateCanvasRule();
    }
    on(type, listener) {
        this.events.on(type, listener);
        return this;
    }
    get id() {
        return this.ranking.id;
    }
    onVisibilityChanged(visible) {
        super.onVisibilityChanged(visible);
        if (visible) {
            this.delayedUpdate.call({ type: Ranking.EVENT_ORDER_CHANGED });
        }
    }
    updateHeaders() {
        this.updateColumnSummaryFlag();
        return super.updateHeaders();
    }
    get currentData() {
        return this.data;
    }
    get context() {
        return this._context;
    }
    createHeader(_document, column) {
        return column.createHeader();
    }
    updateColumnSummaryFlag() {
        // updates the header flag depending on whether there are any sublabels
        this.header.classList.toggle(cssClass('show-sublabel'), this.columns.some((c) => c.hasSummaryLine()));
    }
    updateHeader(node, column) {
        if (column instanceof MultiLevelRenderColumn) {
            column.updateWidthRule(this.style);
        }
        return column.updateHeader(node);
    }
    createCell(_document, index, column) {
        return column.createCell(index);
    }
    createCellHandled(col, index) {
        const r = col.createCell(index);
        let item;
        if (isAsyncUpdate(r)) {
            item = this.handleCellReady(r.item, r.ready, col.index);
        }
        else {
            item = r;
        }
        this.initCellClasses(item, col.id);
        return item;
    }
    updateCell(node, index, column) {
        return column.updateCell(node, index);
    }
    selectCanvas() {
        if (this.canvasPool.length > 0) {
            return this.canvasPool.pop();
        }
        const c = this.body.ownerDocument.createElement('canvas');
        c.classList.add(cssClass(`low-c${this.tableId}`));
        return c;
    }
    rowFlags(row) {
        const rowany = row;
        const v = rowany.__lu__;
        if (v == null) {
            return (rowany.__lu__ = {});
        }
        return v;
    }
    visibleRenderedWidth() {
        let width = 0;
        for (const col of this.visibleColumns.frozen) {
            width += this.columns[col].width + COLUMN_PADDING;
        }
        for (let col = this.visibleColumns.first; col <= this.visibleColumns.last; ++col) {
            width += this.columns[col].width + COLUMN_PADDING;
        }
        if (width > 0) {
            width -= COLUMN_PADDING; // for the last one
        }
        return width;
    }
    pushLazyRedraw(canvas, x, column, render) {
        render.then((r) => {
            const l = this.loadingCanvas.get(canvas) || [];
            const pos = l.findIndex((d) => d.render === render && d.col === column.index);
            if (pos < 0) {
                // not part anymore ignore
                return;
            }
            l.splice(pos, 1);
            if (typeof r === 'function') {
                // i.e not aborted
                const ctx = canvas.getContext('2d');
                ctx.clearRect(x - 1, 0, column.width + 2, canvas.height);
                ctx.save();
                ctx.translate(x, 0);
                r(ctx);
                ctx.restore();
            }
            if (l.length > 0) {
                return;
            }
            this.loadingCanvas.delete(canvas);
            canvas.classList.remove(cssClass('loading-c'));
        });
        if (!this.loadingCanvas.has(canvas)) {
            canvas.classList.add(cssClass('loading-c'));
            this.loadingCanvas.set(canvas, [{ col: column.index, render }]);
        }
        else {
            this.loadingCanvas.get(canvas).push({ col: column.index, render });
        }
    }
    renderRow(canvas, node, index) {
        if (this.loadingCanvas.has(canvas)) {
            for (const a of this.loadingCanvas.get(canvas)) {
                a.render.abort();
            }
            this.loadingCanvas.delete(canvas);
        }
        canvas.classList.remove(cssClass('loading-c'));
        canvas.width = this.currentCanvasWidth;
        canvas.height = CANVAS_HEIGHT;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        const domColumns = [];
        let x = 0;
        const renderCellImpl = (col) => {
            const c = this.columns[col];
            const r = c.renderCell(ctx, index);
            if (r === true) {
                domColumns.push(c);
            }
            else if (r !== false && isAbortAble(r)) {
                this.pushLazyRedraw(canvas, x, c, r);
            }
            const shift = c.width + COLUMN_PADDING;
            x += shift;
            ctx.translate(shift, 0);
        };
        for (const col of this.visibleColumns.frozen) {
            renderCellImpl(col);
        }
        for (let col = this.visibleColumns.first; col <= this.visibleColumns.last; ++col) {
            renderCellImpl(col);
        }
        ctx.restore();
        const visibleElements = node.childElementCount - 1; // for canvas
        if (domColumns.length === 0) {
            while (node.lastElementChild !== node.firstElementChild) {
                const n = node.lastElementChild;
                node.removeChild(n);
                this.recycleCell(n);
            }
            return;
        }
        if (domColumns.length === 1) {
            const first = domColumns[0];
            if (visibleElements === 0) {
                const item = this.createCellHandled(first, index);
                item.classList.add(cssClass('low'));
                node.appendChild(item);
                return;
            }
            const firstDOM = node.lastElementChild;
            if (visibleElements === 1 && firstDOM.dataset.colId === first.id) {
                const isLoading = isLoadingCell(firstDOM);
                if (isLoading) {
                    const item = this.createCellHandled(first, index);
                    node.replaceChild(item, firstDOM);
                    this.recycleCell(firstDOM, first.index);
                    return;
                }
                this.updateCellImpl(first, node.lastElementChild, index);
                return;
            }
        }
        const existing = new Map(Array.from(node.children).slice(1).map((d) => [d.dataset.id, d]));
        for (const col of domColumns) {
            const elem = existing.get(col.id);
            if (elem && !isLoadingCell(elem)) {
                existing.delete(col.id);
                this.updateCellImpl(col, elem, index);
            }
            else {
                const c = this.createCellHandled(col, index);
                c.classList.add(cssClass('low'));
                node.appendChild(c);
            }
        }
        existing.forEach((v) => {
            v.remove();
            this.recycleCell(v);
        });
    }
    updateCanvasCell(canvas, node, index, column, x) {
        // delete lazy that would render the same thing
        if (this.loadingCanvas.has(canvas)) {
            const l = this.loadingCanvas.get(canvas);
            const me = l.filter((d) => d.col === column.index);
            if (me.length > 0) {
                this.loadingCanvas.set(canvas, l.filter((d) => d.col !== column.index));
                for (const a of me) {
                    a.render.abort();
                }
            }
        }
        const ctx = canvas.getContext('2d');
        ctx.clearRect(x - 1, 0, column.width + 2, canvas.height);
        ctx.save();
        ctx.translate(x, 0);
        const needDOM = column.renderCell(ctx, index);
        ctx.restore();
        if (typeof needDOM !== 'boolean' && isAbortAble(needDOM)) {
            this.pushLazyRedraw(canvas, x, column, needDOM);
        }
        if (needDOM !== true && node.childElementCount === 1) {
            // just canvas
            return;
        }
        const elem = node.querySelector(`[data-id="${column.id}"]`);
        if (elem && !needDOM) {
            elem.remove();
            this.recycleCell(elem, column.index);
            return;
        }
        if (elem) {
            return this.updateCellImpl(column, elem, index);
        }
        const c = this.createCellHandled(column, index);
        c.classList.add(cssClass('low'));
        node.appendChild(c);
    }
    reindex() {
        this.columns.forEach((c, i) => {
            c.index = i;
        });
    }
    updateAll() {
        this.columns.forEach((c, i) => {
            c.index = i;
            c.renderers = this.ctx.createRenderer(c.c);
        });
        this._context = Object.assign({}, this._context, {
            column: nonUniformContext(this.columns.map((w) => w.width), 100, COLUMN_PADDING),
        });
        this.updateColumnSummaryFlag();
        this.events.fire(EngineRanking.EVENT_RECREATE);
        super.recreate();
        this.events.fire(EngineRanking.EVENT_WIDTH_CHANGED);
    }
    updateBody() {
        if (this.hidden) {
            return;
        }
        this.events.fire(EngineRanking.EVENT_WIDTH_CHANGED);
        super.forEachRow((row, rowIndex) => this.updateRow(row, rowIndex));
    }
    updateHeaderOf(col) {
        const i = this._context.columns.findIndex((d) => d.c === col);
        if (i < 0) {
            return false;
        }
        const node = this.header.children[i];
        const column = this._context.columns[i];
        if (node && column) {
            this.updateHeader(node, column);
        }
        this.updateColumnSummaryFlag();
        return node && column;
    }
    createRow(node, rowIndex) {
        node.classList.add(this.style.cssClasses.tr);
        this.roptions.customRowUpdate(node, rowIndex);
        if (this.highlightHandler.enabled) {
            node.addEventListener('mouseenter', this.highlightHandler.enter, PASSIVE);
            this.rowFlags(node).highlight = true;
        }
        const isGroup = this.renderCtx.isGroup(rowIndex);
        const meta = this.toRowMeta(rowIndex);
        if (!meta) {
            delete node.dataset.meta;
        }
        else {
            node.dataset.meta = meta;
        }
        if (isGroup) {
            node.dataset.agg = 'group';
            super.createRow(node, rowIndex);
            return;
        }
        const { dataIndex } = this.renderCtx.getRow(rowIndex);
        node.classList.toggle(engineCssClass('highlighted'), this.highlight === dataIndex);
        node.dataset.i = dataIndex.toString();
        node.dataset.agg = 'detail'; //or 'group'
        this.selection.updateState(node, dataIndex);
        this.selection.add(node);
        const low = this.roptions.levelOfDetail(rowIndex) === 'low';
        node.classList.toggle(cssClass('low'), low);
        if (!low || this.ctx.provider.isSelected(dataIndex)) {
            super.createRow(node, rowIndex);
            return;
        }
        const canvas = this.selectCanvas();
        node.appendChild(canvas);
        node.addEventListener('mouseenter', this.canvasMouseHandler.enter, PASSIVE);
        this.renderRow(canvas, node, rowIndex);
    }
    updateRow(node, rowIndex, hoverLod) {
        this.roptions.customRowUpdate(node, rowIndex);
        const computedLod = this.roptions.levelOfDetail(rowIndex);
        const low = (hoverLod ? hoverLod : computedLod) === 'low';
        const wasLow = node.classList.contains(cssClass('low'));
        const isGroup = this.renderCtx.isGroup(rowIndex);
        const wasGroup = node.dataset.agg === 'group';
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
        const meta = this.toRowMeta(rowIndex);
        if (!meta) {
            delete node.dataset.meta;
        }
        else {
            node.dataset.meta = meta;
        }
        if (isGroup) {
            node.classList.remove(engineCssClass('highlighted'));
            super.updateRow(node, rowIndex);
            return;
        }
        const { dataIndex } = this.renderCtx.getRow(rowIndex);
        node.classList.toggle(engineCssClass('highlighted'), this.highlight === dataIndex);
        node.dataset.i = dataIndex.toString();
        this.selection.updateState(node, dataIndex);
        const canvas = wasLow && node.firstElementChild.nodeName.toLowerCase() === 'canvas'
            ? node.firstElementChild
            : null;
        if (!low || this.ctx.provider.isSelected(dataIndex)) {
            if (canvas) {
                this.recycleCanvas(canvas);
                clear(node);
                node.removeEventListener('mouseenter', this.canvasMouseHandler.enter);
            }
            super.updateRow(node, rowIndex);
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
        const canvas2 = this.selectCanvas();
        node.appendChild(canvas2);
        node.addEventListener('mouseenter', this.canvasMouseHandler.enter, PASSIVE);
        this.renderRow(canvas2, node, rowIndex);
    }
    updateCanvasBody() {
        this.updateCanvasRule();
        super.forEachRow((row, index) => {
            if (EngineRanking.isCanvasRenderedRow(row)) {
                this.renderRow(row.firstElementChild, row, index);
            }
        });
    }
    toRowMeta(rowIndex) {
        const provider = this.renderCtx.provider;
        const topNGetter = (group) => provider.getTopNAggregated(this.ranking, group);
        return toRowMeta(this.renderCtx.getRow(rowIndex), provider.getAggregationStrategy(), topNGetter);
    }
    updateCanvasRule() {
        this.style.updateRule(`renderCanvas${this.tableId}`, `.${cssClass(`low-c${this.tableId}`)}`, {
            transform: `translateX(${this.currentCanvasShift}px)`,
            width: `${this.currentCanvasWidth}px`,
        });
    }
    updateShifts(top, left) {
        super.updateShifts(top, left);
        const width = this.visibleRenderedWidth();
        if (left === this.currentCanvasShift && width === this.currentCanvasWidth) {
            return;
        }
        this.currentCanvasShift = left;
        this.currentCanvasWidth = width;
        this.updateCanvasBody();
    }
    recycleCanvas(canvas) {
        if (this.loadingCanvas.has(canvas)) {
            for (const a of this.loadingCanvas.get(canvas)) {
                a.render.abort();
            }
            this.loadingCanvas.delete(canvas);
        }
        else if (!canvas.classList.contains(cssClass('loading-c'))) {
            this.canvasPool.push(canvas);
        }
    }
    enableHighlightListening(enable) {
        if (this.highlightHandler.enabled === enable) {
            return;
        }
        this.highlightHandler.enabled = enable;
        if (enable) {
            this.body.addEventListener('mouseleave', this.highlightHandler.leave, PASSIVE);
            super.forEachRow((row) => {
                row.addEventListener('mouseenter', this.highlightHandler.enter, PASSIVE);
                this.rowFlags(row).highlight = true;
            });
            return;
        }
        this.body.removeEventListener('mouseleave', this.highlightHandler.leave);
        super.forEachRow((row) => {
            row.removeEventListener('mouseenter', this.highlightHandler.enter);
            this.rowFlags(row).highlight = false;
        });
    }
    updateHoveredRow(row, hover) {
        const isCanvas = EngineRanking.isCanvasRenderedRow(row);
        if (isCanvas !== hover) {
            return; // good nothing to do
        }
        const index = Number.parseInt(row.dataset.index, 10);
        this.updateRow(row, index, hover ? 'high' : 'low');
    }
    forEachRow(callback, inplace = false) {
        const adapter = (row, rowIndex) => {
            if (EngineRanking.isCanvasRenderedRow(row)) {
                // skip canvas
                return;
            }
            callback(row, rowIndex);
        };
        return super.forEachRow(adapter, inplace);
    }
    updateSelection(selectedDataIndices) {
        super.forEachRow((node, rowIndex) => {
            if (this.renderCtx.isGroup(rowIndex)) {
                this.updateRow(node, rowIndex);
            }
            else {
                // fast pass for item
                this.selection.update(node, selectedDataIndices);
            }
        }, true);
    }
    updateColumnWidths() {
        // update the column context in place
        this._context.column = nonUniformContext(this._context.columns.map((w) => w.width), 100, COLUMN_PADDING);
        super.updateColumnWidths();
        const { columns } = this.context;
        //no data update needed since just width changed
        columns.forEach((column) => {
            if (column instanceof MultiLevelRenderColumn) {
                column.updateWidthRule(this.style);
            }
            column.renderers = this.ctx.createRenderer(column.c);
        });
        this.events.fire(EngineRanking.EVENT_WIDTH_CHANGED);
    }
    computeShiftedIndex(index) {
        const columns = this.context.columns;
        // may not match if not all left columns are shown
        let leftOffset = 0;
        let indexOffset = 0;
        // shift frozen ones
        for (const frozenIndex of this.visibleColumns.frozen) {
            if (frozenIndex >= this.visibleColumns.first) {
                break;
            }
            leftOffset += columns[frozenIndex].width + COLUMN_PADDING;
            indexOffset--;
        }
        // shift visible before
        indexOffset += this.visibleColumns.first;
        for (let i = this.visibleColumns.first; i < index; ++i) {
            leftOffset += columns[i].width + COLUMN_PADDING;
        }
        return {
            leftOffset,
            indexOffset,
        };
    }
    updateColumn(index) {
        const columns = this.context.columns;
        const column = columns[index];
        if (!column) {
            return false;
        }
        const { leftOffset, indexOffset } = this.computeShiftedIndex(index);
        super.forEachRow((row, rowIndex) => {
            if (EngineRanking.isCanvasRenderedRow(row)) {
                this.updateCanvasCell(row.firstElementChild, row, rowIndex, column, leftOffset);
                return;
            }
            this.updateCellImpl(column, row.children[index - indexOffset], rowIndex);
        });
        return true;
    }
    updateCellImpl(column, before, rowIndex) {
        if (!before) {
            return; // race condition
        }
        const r = this.updateCell(before, rowIndex, column);
        let after;
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
    }
    initCellClasses(node, id) {
        node.dataset.id = id;
        node.classList.add(engineCssClass('td'), this.style.cssClasses.td, engineCssClass(`td-${this.tableId}`));
    }
    destroy() {
        super.destroy();
        this.style.deleteRule(`hoverOnly${this.tableId}`);
        this.style.deleteRule(`renderCanvas${this.tableId}`);
        this.ranking.flatColumns.forEach((c) => EngineRanking.disableListener(c));
    }
    groupData() {
        const groups = this.ranking.getGroups();
        const provider = this.ctx.provider;
        const strategy = provider.getAggregationStrategy();
        const alwaysShowGroup = isAlwaysShowingGroupStrategy(strategy);
        const r = [];
        if (groups.length === 0) {
            return r;
        }
        const pushItem = (group, dataIndex, i) => {
            r.push({
                group,
                dataIndex,
                relativeIndex: i,
            });
        };
        if (groups.length === 1 && groups[0].name === defaultGroup.name) {
            const group = groups[0];
            const l = group.order.length;
            for (let i = 0; i < l; ++i) {
                pushItem(group, group.order[i], i);
            }
            return r;
        }
        const roots = groupRoots(groups);
        const pushGroup = (group) => {
            const n = provider.getTopNAggregated(this.ranking, group);
            // all are IOrderedGroup since propagated
            const ordered = group;
            const groupParent = group;
            if (n === 0 || alwaysShowGroup) {
                r.push(ordered);
            }
            if (n !== 0 && Array.isArray(groupParent.subGroups) && groupParent.subGroups.length > 0) {
                for (const g of groupParent.subGroups) {
                    pushGroup(g);
                }
                return;
            }
            const l = n < 0 ? ordered.order.length : Math.min(n, ordered.order.length);
            for (let i = 0; i < l; ++i) {
                pushItem(ordered, ordered.order[i], i);
            }
        };
        for (const root of roots) {
            pushGroup(root);
        }
        return r;
    }
    render(data, rowContext) {
        const previous = this._context;
        const previousData = this.data;
        this.data = data;
        this.columns.forEach((c, i) => {
            c.index = i;
            c.renderers = this.ctx.createRenderer(c.c);
        });
        this._context = Object.assign({
            columns: this.columns,
            column: nonUniformContext(this.columns.map((w) => w.width), 100, COLUMN_PADDING),
        }, rowContext);
        if (!this.bodyScroller) {
            // somehow not part of dom
            return;
        }
        this.events.fire(EngineRanking.EVENT_RECREATE);
        return super.recreate(this.roptions.animation ? lineupAnimation(previous, previousData, this.data) : undefined);
    }
    setHighlight(dataIndex) {
        this.highlight = dataIndex;
        const old = this.body.querySelector(`[data-i].${engineCssClass('highlighted')}`);
        if (old) {
            old.classList.remove(engineCssClass('highlighted'));
        }
        if (dataIndex < 0) {
            return false;
        }
        const item = this.body.querySelector(`[data-i="${dataIndex}"]`);
        if (item) {
            item.classList.add(engineCssClass('highlighted'));
        }
        return item != null;
    }
    findNearest(dataIndices) {
        // find the nearest visible data index
        // first check if already visible
        const index = dataIndices.find((d) => Boolean(this.body.querySelectorAll(`[data-i="${d}"]`)));
        if (index != null) {
            return index; // visible one
        }
        const visible = this.visible;
        const lookFor = new Set(dataIndices);
        let firstBeforePos = -1;
        let firstAfterPos = -1;
        for (let i = visible.first; i >= 0; --i) {
            const d = this.data[i];
            if (!isGroup(d) && lookFor.has(d.dataIndex)) {
                firstBeforePos = i;
                break;
            }
        }
        for (let i = visible.last; i < this.data.length; ++i) {
            const d = this.data[i];
            if (!isGroup(d) && lookFor.has(d.dataIndex)) {
                firstAfterPos = i;
                break;
            }
        }
        if (firstBeforePos < 0 && firstBeforePos < 0) {
            return -1; // not found at all
        }
        const nearestPos = firstBeforePos >= 0 && visible.first - firstBeforePos < firstAfterPos - visible.last
            ? firstBeforePos
            : firstAfterPos;
        return this.data[nearestPos].dataIndex;
    }
    scrollIntoView(dataIndex) {
        const item = this.body.querySelector(`[data-i="${dataIndex}"]`);
        if (item) {
            item.scrollIntoView(true);
            return true;
        }
        const index = this.data.findIndex((d) => !isGroup(d) && d.dataIndex === dataIndex);
        if (index < 0) {
            return false; // part of a group?
        }
        const posOf = () => {
            const c = this._context;
            if (c.exceptions.length === 0 || index < c.exceptions[0].index) {
                // fast pass
                return index * c.defaultRowHeight;
            }
            const before = c.exceptions
                .slice()
                .reverse()
                .find((d) => d.index <= index);
            if (!before) {
                return -1;
            }
            if (before.index === index) {
                return before.y;
            }
            const regular = index - before.index - 1;
            return before.y2 + regular * c.defaultRowHeight;
        };
        const pos = posOf();
        if (pos < 0) {
            return false;
        }
        const scroller = this.bodyScroller;
        if (!scroller) {
            return false;
        }
        const top = scroller.scrollTop;
        scroller.scrollTop = Math.min(pos, scroller.scrollHeight - scroller.clientHeight);
        this.onScrolledVertically(scroller.scrollTop, scroller.clientHeight, top < scroller.scrollTop);
        const found = this.body.querySelector(`[data-i="${dataIndex}"]`);
        if (found) {
            found.scrollIntoView(true);
            return true;
        }
        return false;
    }
    getHighlight() {
        const item = this.body.querySelector(`[data-i]:hover, [data-i].${engineCssClass('highlighted')}`);
        if (item) {
            return Number.parseInt(item.dataset.i, 10);
        }
        return this.highlight;
    }
    createCol(c, index) {
        const col = isMultiLevelColumn(c) && !c.getCollapsed()
            ? new MultiLevelRenderColumn(c, index, this.renderCtx, this.roptions.flags)
            : new RenderColumn(c, index, this.renderCtx, this.roptions.flags);
        c.on(`${Column.EVENT_WIDTH_CHANGED}.body`, () => {
            // replace myself upon width change since we renderers are allowed to
            col.renderers = this.ctx.createRenderer(c);
            this.delayedUpdateColumnWidths();
        });
        const debounceUpdate = debounce(() => {
            const valid = this.updateColumn(col.index);
            if (!valid) {
                EngineRanking.disableListener(c); // destroy myself
            }
        }, 25);
        c.on([`${Column.EVENT_RENDERER_TYPE_CHANGED}.body`, `${Column.EVENT_GROUP_RENDERER_TYPE_CHANGED}.body`], () => {
            // replace myself upon renderer type change
            col.renderers = this.ctx.createRenderer(c);
            debounceUpdate();
        });
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        c.on(`${Column.EVENT_DIRTY_HEADER}.body`, function () {
            const valid = that.updateHeaderOf(col.c);
            if (!valid) {
                EngineRanking.disableListener(c); // destroy myself
            }
        });
        c.on(suffix('.body', Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_CACHES), () => {
            // replace myself upon renderer type change
            col.renderers = this.ctx.createRenderer(c);
            const valid = this.updateHeaderOf(col.c);
            if (!valid) {
                EngineRanking.disableListener(c); // destroy myself
            }
        });
        c.on(`${Column.EVENT_DIRTY_VALUES}.body`, debounceUpdate);
        if (isMultiLevelColumn(c)) {
            c.on(`${StackColumn.EVENT_COLLAPSE_CHANGED}.body`, () => {
                // rebuild myself from scratch
                EngineRanking.disableListener(c); // destroy myself
                const index = col.index;
                const replacement = this.createCol(c, index);
                replacement.index = index;
                this.columns.splice(index, 1, replacement);
                this.delayedUpdateAll();
            });
            if (!c.getCollapsed()) {
                col.updateWidthRule(this.style);
                c.on(`${StackColumn.EVENT_MULTI_LEVEL_CHANGED}.body`, () => {
                    col.updateWidthRule(this.style);
                });
                c.on(`${StackColumn.EVENT_MULTI_LEVEL_CHANGED}.bodyUpdate`, debounceUpdate);
            }
        }
        return col;
    }
    static isCanvasRenderedRow(row) {
        return (row.classList.contains(cssClass('low')) &&
            row.childElementCount >= 1 &&
            row.firstElementChild.nodeName.toLowerCase() === 'canvas');
    }
    static disableListener(c) {
        c.on(`${Column.EVENT_WIDTH_CHANGED}.body`, null);
        c.on(suffix('.body', Column.EVENT_RENDERER_TYPE_CHANGED, Column.EVENT_GROUP_RENDERER_TYPE_CHANGED, Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, Column.EVENT_DIRTY_CACHES, Column.EVENT_LABEL_CHANGED), null);
        c.on(`${Ranking.EVENT_DIRTY_HEADER}.body`, null);
        c.on(`${Ranking.EVENT_DIRTY_VALUES}.body`, null);
        if (!isMultiLevelColumn(c)) {
            return;
        }
        c.on(`${StackColumn.EVENT_COLLAPSE_CHANGED}.body`, null);
        c.on(`${StackColumn.EVENT_MULTI_LEVEL_CHANGED}.body`, null);
        c.on(`${StackColumn.EVENT_MULTI_LEVEL_CHANGED}.bodyUpdate`, null);
    }
}
EngineRanking.EVENT_WIDTH_CHANGED = RankingEvents.EVENT_WIDTH_CHANGED;
EngineRanking.EVENT_UPDATE_DATA = RankingEvents.EVENT_UPDATE_DATA;
EngineRanking.EVENT_RECREATE = RankingEvents.EVENT_RECREATE;
EngineRanking.EVENT_HIGHLIGHT_CHANGED = RankingEvents.EVENT_HIGHLIGHT_CHANGED;
export default EngineRanking;
