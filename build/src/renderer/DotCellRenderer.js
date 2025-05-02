import { GUESSES_GROUP_HEIGHT, GUESSED_ROW_HEIGHT } from '../constants';
import { concatSeq, round } from '../internal';
import { Column, DEFAULT_COLOR, isNumberColumn, isNumbersColumn, } from '../model';
import { CANVAS_HEIGHT, DOT, cssClass } from '../styles';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
import { adaptColor, noRenderer, SMALL_MARK_LIGHTNESS_FACTOR } from './utils';
var PADDED_HEIGHT = 0.8;
var radius = DOT.size / 2;
var radiusPercentage = (100 * radius) / GUESSED_ROW_HEIGHT;
var availableHeight = 100 * PADDED_HEIGHT - radiusPercentage * 2;
var shift = 100 * ((1 - PADDED_HEIGHT) / 2) + radiusPercentage;
var DotCellRenderer = /** @class */ (function () {
    /**
     * flag to always render the value for single dots
     * @type {boolean}
     */
    function DotCellRenderer(renderValue) {
        if (renderValue === void 0) { renderValue = false; }
        this.renderValue = renderValue;
        this.title = 'Dot';
        this.groupTitle = 'Dots';
    }
    DotCellRenderer.prototype.canRender = function (col, mode) {
        return isNumberColumn(col) && mode !== ERenderMode.SUMMARY;
    };
    DotCellRenderer.getCanvasRenderer = function (col, context) {
        var width = context.colWidth(col);
        var pi2 = Math.PI * 2;
        var radius = DOT.size / 2;
        var availableHeight = GUESSES_GROUP_HEIGHT * PADDED_HEIGHT - radius * 2;
        var shift = GUESSES_GROUP_HEIGHT * ((1 - PADDED_HEIGHT) / 2) + radius;
        var render = function (ctx, vs, width) {
            ctx.save();
            ctx.globalAlpha = DOT.opacity;
            for (var _i = 0, vs_1 = vs; _i < vs_1.length; _i++) {
                var v = vs_1[_i];
                ctx.fillStyle = v.color || DOT.color;
                var x = Math.min(width - radius, Math.max(radius, v.value * width));
                var y = round(Math.random() * availableHeight + shift, 2);
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.arc(x, y, radius, 0, pi2, true);
                ctx.fill();
            }
            ctx.restore();
        };
        return {
            template: "<canvas height=\"".concat(GUESSES_GROUP_HEIGHT, "\"></canvas>"),
            render: render,
            width: width,
        };
    };
    DotCellRenderer.getDOMRenderer = function (col, sanitize) {
        var dots = !isNumbersColumn(col) ? 1 : col.dataLength;
        var tmp = '';
        for (var i = 0; i < dots; ++i) {
            tmp += "<div style='background-color: ".concat(DEFAULT_COLOR, "' title=''></div>");
        }
        var update = function (n, data) {
            //adapt the number of children
            var l = data.length;
            if (n.children.length !== l) {
                n.innerHTML = data.reduce(function (tmp, r) {
                    return "".concat(tmp, "<div style='background-color: ").concat(sanitize(r.color), "' title='").concat(sanitize(r.label), "'></div>");
                }, '');
            }
            var children = n.children;
            data.forEach(function (v, i) {
                var d = children[i];
                d.title = v.label;
                d.style.display = Number.isNaN(v.value) ? 'none' : null;
                d.style.left = "".concat(round(v.value * 100, 2), "%");
                // jitter
                d.style.top = l > 1 ? "".concat(round(Math.random() * availableHeight + shift, 2), "%") : null;
                d.style.backgroundColor = v.color;
            });
        };
        var render = function (ctx, vs, colors, width) {
            ctx.save();
            ctx.globalAlpha = DOT.opacity;
            vs.forEach(function (v, i) {
                ctx.fillStyle = colors[i] || DOT.color;
                ctx.fillRect(Math.max(0, v * width - DOT.size / 2), 0, DOT.size, CANVAS_HEIGHT);
            });
            ctx.restore();
        };
        return { template: "<div>".concat(tmp, "</div>"), update: update, render: render };
    };
    DotCellRenderer.getSingleDOMRenderer = function (sanitize, renderValue) {
        var update = function (n, value, label, color) {
            var sanitizedLabel = sanitize(label);
            n.title = sanitizedLabel;
            var dot = n.firstElementChild;
            dot.style.display = Number.isNaN(value) ? 'none' : null;
            dot.style.left = "".concat(round(value * 100, 2), "%");
            dot.style.backgroundColor = sanitize(color);
            var labelNode = n.lastElementChild;
            labelNode.textContent = sanitizedLabel;
        };
        var render = function (ctx, value, color, width) {
            ctx.save();
            ctx.globalAlpha = DOT.opacitySingle;
            ctx.fillStyle = color || DOT.color;
            ctx.fillRect(Math.max(0, value * width - DOT.size / 2), 0, DOT.size, CANVAS_HEIGHT);
            ctx.restore();
        };
        return {
            template: "<div class=\"".concat(cssClass('dot-single'), "\"><div style='background-color: ").concat(DEFAULT_COLOR, "' title=''></div><span ").concat(renderValue ? '' : "class=\"".concat(cssClass('hover-only'), "\""), "></span></div>"),
            update: update,
            render: render,
        };
    };
    DotCellRenderer.prototype.create = function (col, context, imposer) {
        var width = context.colWidth(col);
        var formatter = col.getNumberFormat();
        if (!isNumbersColumn(col)) {
            // single
            var _a = DotCellRenderer.getSingleDOMRenderer(context.sanitize, this.renderValue), template_1 = _a.template, render_1 = _a.render, update_1 = _a.update;
            return {
                template: template_1,
                update: function (n, d) {
                    if (renderMissingDOM(n, col, d)) {
                        return;
                    }
                    var color = adaptColor(colorOf(col, d, imposer), SMALL_MARK_LIGHTNESS_FACTOR);
                    return update_1(n, col.getNumber(d), col.getLabel(d), color);
                },
                render: function (ctx, d) {
                    var color = adaptColor(colorOf(col, d, imposer), SMALL_MARK_LIGHTNESS_FACTOR);
                    return render_1(ctx, col.getNumber(d), color, width);
                },
            };
        }
        var _b = DotCellRenderer.getDOMRenderer(col, context.sanitize), template = _b.template, render = _b.render, update = _b.update;
        return {
            template: template,
            update: function (n, d) {
                if (renderMissingDOM(n, col, d)) {
                    return;
                }
                var color = adaptColor(colorOf(col, d, imposer), SMALL_MARK_LIGHTNESS_FACTOR);
                var data = col
                    .getNumbers(d)
                    .filter(function (vi) { return !Number.isNaN(vi); })
                    .map(function (value) { return ({ value: value, label: formatter(value), color: color }); });
                return update(n, data);
            },
            render: function (ctx, d) {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                var color = adaptColor(colorOf(col, d, imposer), SMALL_MARK_LIGHTNESS_FACTOR);
                var vs = col.getNumbers(d).filter(function (vi) { return !Number.isNaN(vi); });
                return render(ctx, vs, vs.map(function (_) { return color; }), width);
            },
        };
    };
    DotCellRenderer.prototype.createGroup = function (col, context, imposer) {
        var _a = DotCellRenderer.getCanvasRenderer(col, context), template = _a.template, render = _a.render, width = _a.width;
        return {
            template: template,
            update: function (n, group) {
                return context.tasks
                    .groupRows(col, group, 'dot', function (rows) {
                    //value, color, label,
                    if (!isNumbersColumn(col)) {
                        return Array.from(rows.map(function (r) { return ({ value: col.getNumber(r), color: colorOf(col, r, imposer) }); }));
                    }
                    // concatenate all columns
                    var vs = rows.map(function (r) {
                        var color = adaptColor(colorOf(col, r, imposer), SMALL_MARK_LIGHTNESS_FACTOR);
                        return col
                            .getNumbers(r)
                            .filter(function (vi) { return !Number.isNaN(vi); })
                            .map(function (value) { return ({ value: value, color: color }); });
                    });
                    return Array.from(concatSeq(vs));
                })
                    .then(function (data) {
                    if (typeof data === 'symbol') {
                        return;
                    }
                    var isMissing = !data || data.length === 0 || data.every(function (v) { return Number.isNaN(v.value); });
                    n.classList.toggle(cssClass('missing'), isMissing);
                    if (isMissing) {
                        return;
                    }
                    var ctx = n.getContext('2d');
                    ctx.canvas.width = width;
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    render(ctx, data, width);
                });
            },
        };
    };
    DotCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return DotCellRenderer;
}());
export default DotCellRenderer;
//# sourceMappingURL=DotCellRenderer.js.map