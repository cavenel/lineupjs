import { Column, isCategoricalColumn, isSetColumn } from '../model';
import { CANVAS_HEIGHT, cssClass, UPSET } from '../styles';
import { renderMissingCanvas, renderMissingDOM } from './missing';
var UpSetCellRenderer = /** @class */ (function () {
    function UpSetCellRenderer() {
        this.title = 'UpSet';
    }
    UpSetCellRenderer.prototype.canRender = function (col) {
        // set but not a pure categorical one
        return isSetColumn(col) && !isCategoricalColumn(col);
    };
    UpSetCellRenderer.calculateSetPath = function (setData, cellDimension) {
        var catindexes = [];
        setData.forEach(function (d, i) { return (d ? catindexes.push(i) : -1); });
        var left = catindexes[0] * cellDimension + cellDimension / 2;
        var right = catindexes[catindexes.length - 1] * cellDimension + cellDimension / 2;
        return { left: left, right: right };
    };
    UpSetCellRenderer.createDOMContext = function (col, sanitize) {
        var categories = col.categories;
        var templateRows = '';
        for (var _i = 0, categories_1 = categories; _i < categories_1.length; _i++) {
            var cat = categories_1[_i];
            templateRows += "<div class=\"".concat(cssClass('upset-dot'), "\" title=\"").concat(sanitize(cat.label), "\"></div>");
        }
        return {
            template: "<div><div class=\"".concat(cssClass('upset-line'), "\"></div>").concat(templateRows, "</div>"),
            render: function (n, value) {
                Array.from(n.children)
                    .slice(1)
                    .forEach(function (d, i) {
                    var v = value[i];
                    d.classList.toggle(cssClass('enabled'), v);
                });
                var line = n.firstElementChild;
                var left = value.findIndex(function (d) { return d; });
                var right = value.length - 1 - value.reverse().findIndex(function (d) { return d; });
                if (left < 0 || left === right) {
                    line.style.display = 'none';
                    return;
                }
                line.style.display = null;
                line.style.left = "".concat(Math.round((100 * (left + 0.5)) / value.length), "%");
                line.style.width = "".concat(Math.round((100 * (right - left)) / value.length), "%");
            },
        };
    };
    UpSetCellRenderer.prototype.create = function (col, context) {
        var _a = UpSetCellRenderer.createDOMContext(col, context.sanitize), template = _a.template, render = _a.render;
        var width = context.colWidth(col);
        var cellDimension = width / col.categories.length;
        return {
            template: template,
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
                var hasTrueValues = data.some(function (d) { return d; }); //some values are true?
                ctx.save();
                ctx.fillStyle = UPSET.color;
                ctx.strokeStyle = UPSET.color;
                if (hasTrueValues) {
                    var _a = UpSetCellRenderer.calculateSetPath(data, cellDimension), left = _a.left, right = _a.right;
                    ctx.beginPath();
                    ctx.moveTo(left, CANVAS_HEIGHT / 2);
                    ctx.lineTo(right, CANVAS_HEIGHT / 2);
                    ctx.stroke();
                }
                data.forEach(function (d, j) {
                    var posX = j * cellDimension;
                    ctx.beginPath();
                    ctx.globalAlpha = d ? 1 : UPSET.inactive;
                    ctx.fillRect(posX, 0, cellDimension, CANVAS_HEIGHT);
                    ctx.fill();
                });
                ctx.restore();
            },
        };
    };
    UpSetCellRenderer.prototype.createGroup = function (col, context) {
        var _a = UpSetCellRenderer.createDOMContext(col, context.sanitize), template = _a.template, render = _a.render;
        return {
            template: template,
            update: function (n, group) {
                return context.tasks.groupCategoricalStats(col, group).then(function (r) {
                    if (typeof r === 'symbol') {
                        return;
                    }
                    render(n, r.group.hist.map(function (d) { return d.count > 0; }));
                });
            },
        };
    };
    UpSetCellRenderer.prototype.createSummary = function (col, context) {
        var _a = UpSetCellRenderer.createDOMContext(col, context.sanitize), template = _a.template, render = _a.render;
        return {
            template: template,
            update: function (n) {
                return context.tasks.summaryCategoricalStats(col).then(function (r) {
                    if (typeof r === 'symbol') {
                        return;
                    }
                    render(n, r.summary.hist.map(function (d) { return d.count > 0; }));
                });
            },
        };
    };
    return UpSetCellRenderer;
}());
export default UpSetCellRenderer;
//# sourceMappingURL=UpSetCellRenderer.js.map