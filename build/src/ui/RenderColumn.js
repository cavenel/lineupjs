import { isAbortAble } from 'lineupengine';
import { createHeader, updateHeader } from './header';
import { cssClass, engineCssClass } from '../styles';
import { isPromiseLike } from '../internal';
var RenderColumn = /** @class */ (function () {
    function RenderColumn(c, index, ctx, flags) {
        this.c = c;
        this.index = index;
        this.ctx = ctx;
        this.flags = flags;
        this.renderers = null;
    }
    Object.defineProperty(RenderColumn.prototype, "width", {
        get: function () {
            return this.c.getWidth();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderColumn.prototype, "id", {
        get: function () {
            return this.c.id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderColumn.prototype, "frozen", {
        get: function () {
            return this.flags.disableFrozenColumns ? false : this.c.frozen;
        },
        enumerable: false,
        configurable: true
    });
    RenderColumn.prototype.singleRenderer = function () {
        if (!this.renderers || !this.renderers.single) {
            return null;
        }
        if (this.renderers.singleTemplate) {
            return this.renderers.singleTemplate.cloneNode(true);
        }
        var elem = this.ctx.asElement(this.renderers.single.template);
        elem.classList.add(cssClass("renderer-".concat(this.renderers.singleId)), cssClass('detail'));
        elem.dataset.renderer = this.renderers.singleId;
        elem.dataset.group = 'd';
        this.renderers.singleTemplate = elem.cloneNode(true);
        return elem;
    };
    RenderColumn.prototype.groupRenderer = function () {
        if (!this.renderers || !this.renderers.group) {
            return null;
        }
        if (this.renderers.groupTemplate) {
            return this.renderers.groupTemplate.cloneNode(true);
        }
        var elem = this.ctx.asElement(this.renderers.group.template);
        elem.classList.add(cssClass("renderer-".concat(this.renderers.groupId)), cssClass('group'));
        elem.dataset.renderer = this.renderers.groupId;
        elem.dataset.group = 'g';
        this.renderers.groupTemplate = elem.cloneNode(true);
        return elem;
    };
    RenderColumn.prototype.summaryRenderer = function () {
        if (!this.renderers || !this.renderers.summary) {
            return null;
        }
        if (this.renderers.summaryTemplate) {
            return this.renderers.summaryTemplate.cloneNode(true);
        }
        var elem = this.ctx.asElement(this.renderers.summary.template);
        elem.classList.add(cssClass('summary'), cssClass('th-summary'), cssClass("renderer-".concat(this.renderers.summaryId)));
        elem.dataset.renderer = this.renderers.summaryId;
        this.renderers.summaryTemplate = elem.cloneNode(true);
        return elem;
    };
    RenderColumn.prototype.createHeader = function () {
        var node = createHeader(this.c, this.ctx, {
            extraPrefix: 'th',
            dragAble: this.flags.advancedUIFeatures,
            mergeDropAble: this.flags.advancedModelFeatures && this.flags.combineViaDragNDrop,
            rearrangeAble: this.flags.advancedUIFeatures,
            resizeable: this.flags.advancedUIFeatures,
        });
        node.classList.add(cssClass('header'));
        if (!this.flags.disableFrozenColumns) {
            node.classList.toggle(engineCssClass('frozen'), this.frozen);
        }
        if (this.renderers && this.renderers.summary) {
            var summary = this.summaryRenderer();
            node.appendChild(summary);
        }
        return this.updateHeader(node);
    };
    RenderColumn.prototype.hasSummaryLine = function () {
        return Boolean(this.c.getMetaData().summary);
    };
    RenderColumn.prototype.updateHeader = function (node) {
        updateHeader(node, this.c);
        if (!this.renderers || !this.renderers.summary) {
            return node;
        }
        var summary = node.getElementsByClassName(cssClass('summary'))[0];
        summary.remove();
        summary = this.summaryRenderer();
        node.appendChild(summary);
        var ready = this.renderers.summary.update(summary);
        if (ready) {
            return { item: node, ready: ready };
        }
        return node;
    };
    RenderColumn.prototype.createCell = function (index) {
        var isGroup = this.ctx.isGroup(index);
        var node = isGroup ? this.groupRenderer() : this.singleRenderer();
        return this.updateCell(node, index);
    };
    RenderColumn.prototype.updateCell = function (node, index) {
        var _this = this;
        if (!this.flags.disableFrozenColumns) {
            node.classList.toggle(engineCssClass('frozen'), this.frozen);
        }
        var isGroup = this.ctx.isGroup(index);
        // assert that we have the template of the right mode
        var oldRenderer = node.dataset.renderer;
        var currentRenderer = isGroup ? this.renderers.groupId : this.renderers.singleId;
        var oldGroup = node.dataset.group;
        var currentGroup = isGroup ? 'g' : 'd';
        if (oldRenderer !== currentRenderer || oldGroup !== currentGroup) {
            node = isGroup ? this.groupRenderer() : this.singleRenderer();
        }
        var ready;
        if (isGroup) {
            var g = this.ctx.getGroup(index);
            ready = this.renderers.group.update(node, g);
        }
        else {
            var r_1 = this.ctx.getRow(index);
            var row = this.ctx.provider.getRow(r_1.dataIndex);
            if (!isPromiseLike(row)) {
                ready = this.renderers.single.update(node, row, r_1.relativeIndex, r_1.group);
            }
            else {
                ready = chainAbortAble(row, function (row) { return _this.renderers.single.update(node, row, r_1.relativeIndex, r_1.group); });
            }
        }
        if (ready) {
            return { item: node, ready: ready };
        }
        return node;
    };
    RenderColumn.prototype.renderCell = function (ctx, index) {
        var r = this.ctx.getRow(index);
        var s = this.renderers.single;
        if (!s.render) {
            return false;
        }
        var row = this.ctx.provider.getRow(r.dataIndex);
        if (!isPromiseLike(row)) {
            return s.render(ctx, row, r.relativeIndex, r.group) || false;
        }
        return chainAbortAble(row, function (row) { return s.render(ctx, row, r.relativeIndex, r.group) || false; });
    };
    return RenderColumn;
}());
export default RenderColumn;
function chainAbortAble(toWait, mapper) {
    var aborted = false;
    var p = new Promise(function (resolve) {
        if (aborted) {
            return;
        }
        toWait.then(function (r) {
            if (aborted) {
                return;
            }
            var mapped = mapper(r);
            if (isAbortAble(mapped)) {
                p.abort = mapped.abort.bind(mapped);
                return p.then(resolve);
            }
            return resolve(mapped);
        });
    });
    p.abort = function () {
        aborted = true;
    };
    return p;
}
//# sourceMappingURL=RenderColumn.js.map