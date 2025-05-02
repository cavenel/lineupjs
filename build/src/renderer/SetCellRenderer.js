import { Column, isSetColumn, } from '../model';
import { CANVAS_HEIGHT, cssClass } from '../styles';
import { renderMissingCanvas, renderMissingDOM } from './missing';
import { forEachChild, noop, wideEnoughCat } from './utils';
import { round } from '../internal';
var SetCellRenderer = /** @class */ (function () {
    function SetCellRenderer() {
        this.title = 'Matrix';
    }
    SetCellRenderer.prototype.canRender = function (col) {
        return isSetColumn(col);
    };
    SetCellRenderer.createDOMContext = function (col, sanitize) {
        var categories = col.categories;
        var mapping = col.getColorMapping();
        var templateRows = '';
        for (var _i = 0, categories_1 = categories; _i < categories_1.length; _i++) {
            var cat = categories_1[_i];
            templateRows += "<div class=\"".concat(cssClass('heatmap-cell'), "\" title=\"").concat(sanitize(cat.label), "\" style=\"background-color: ").concat(mapping.apply(cat), "\"></div>");
        }
        return {
            templateRow: templateRows,
            render: function (n, value) {
                forEachChild(n, function (d, i) {
                    var v = value[i];
                    d.style.backgroundColor = mapping.apply(categories[i]);
                    d.style.opacity = typeof v === 'boolean' ? (v ? '1' : '0') : round(v, 2).toString();
                });
            },
        };
    };
    SetCellRenderer.prototype.create = function (col, context) {
        var _a = SetCellRenderer.createDOMContext(col, context.sanitize), templateRow = _a.templateRow, render = _a.render;
        var width = context.colWidth(col);
        var cellDimension = width / col.dataLength;
        var cats = col.categories;
        var mapping = col.getColorMapping();
        return {
            template: "<div class=\"".concat(cssClass('heatmap'), "\">").concat(templateRow, "</div>"),
            update: function (n, d) {
                if (renderMissingDOM(n, col, d)) {
                    return;
                }
                render(n, col.getValues(d));
            },
            render: function (ctx, d) {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                // Circle
                var data = col.getValues(d);
                ctx.save();
                cats.forEach(function (d, j) {
                    if (!data[j]) {
                        return;
                    }
                    var posX = j * cellDimension;
                    ctx.fillStyle = mapping.apply(d);
                    ctx.fillRect(posX, 0, cellDimension, CANVAS_HEIGHT);
                });
                ctx.restore();
            },
        };
    };
    SetCellRenderer.prototype.createGroup = function (col, context) {
        var _a = SetCellRenderer.createDOMContext(col, context.sanitize), templateRow = _a.templateRow, render = _a.render;
        return {
            template: "<div class=\"".concat(cssClass('heatmap'), "\">").concat(templateRow, "</div>"),
            update: function (n, group) {
                return context.tasks.groupCategoricalStats(col, group).then(function (r) {
                    if (typeof r === 'symbol') {
                        return;
                    }
                    var isMissing = !r || !r.group || r.group.count === 0 || r.group.count === r.group.missing;
                    n.classList.toggle(cssClass('missing'), isMissing);
                    if (isMissing) {
                        return;
                    }
                    render(n, r.group.hist.map(function (d) { return d.count / r.group.maxBin; }));
                });
            },
        };
    };
    SetCellRenderer.prototype.createSummary = function (col, context) {
        var categories = col.categories;
        var mapping = col.getColorMapping();
        var templateRows = "<div class=\"".concat(cssClass('heatmap'), "\">");
        var labels = wideEnoughCat(col);
        for (var _i = 0, categories_2 = categories; _i < categories_2.length; _i++) {
            var cat = categories_2[_i];
            templateRows += "<div class=\"".concat(cssClass('heatmap-cell'), "\" title=\"").concat(context.sanitize(cat.label), "\"").concat(labels ? " data-title=\"".concat(context.sanitize(cat.label), "\"") : '', " style=\"background-color: ").concat(mapping.apply(cat), "\"></div>");
        }
        templateRows += '</div>';
        return {
            template: templateRows,
            update: noop,
        };
    };
    return SetCellRenderer;
}());
export default SetCellRenderer;
//# sourceMappingURL=SetCellRenderer.js.map