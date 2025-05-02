import { renderMissingCanvas, renderMissingDOM } from './missing';
import { boxplotBuilder, getSortLabel } from '../internal';
var ANumbersCellRenderer = /** @class */ (function () {
    function ANumbersCellRenderer() {
    }
    ANumbersCellRenderer.choose = function (col, rows) {
        var row = null;
        var data = rows.map(function (r, i) {
            if (i === 0) {
                row = r;
            }
            return { n: col.getNumbers(r), raw: col.getRawNumbers(r) };
        });
        var cols = col.dataLength;
        var normalized = [];
        var raw = [];
        var _loop_1 = function (i) {
            var vs = data.map(function (d) { return ({ n: d.n[i], raw: d.raw[i] }); }).filter(function (d) { return !Number.isNaN(d.n); });
            if (vs.length === 0) {
                normalized.push(NaN);
                raw.push(NaN);
            }
            else {
                var bbn_1 = boxplotBuilder();
                var bbr_1 = boxplotBuilder();
                var s = col.getSortMethod();
                vs.forEach(function (d) {
                    bbn_1.push(d.n);
                    bbr_1.push(d.raw);
                });
                normalized.push(bbn_1.build()[s]);
                raw.push(bbr_1.build()[s]);
            }
        };
        // mean column)
        for (var i = 0; i < cols; ++i) {
            _loop_1(i);
        }
        return { normalized: normalized, raw: raw, row: row };
    };
    ANumbersCellRenderer.prototype.create = function (col, context, imposer) {
        var width = context.colWidth(col);
        var _a = this.createContext(col, context, imposer), templateRow = _a.templateRow, render = _a.render, update = _a.update, clazz = _a.clazz;
        return {
            template: "<div class=\"".concat(clazz, "\">").concat(templateRow, "</div>"),
            update: function (n, d) {
                if (renderMissingDOM(n, col, d)) {
                    return;
                }
                update(n, col.getNumbers(d), col.getRawNumbers(d), d);
            },
            render: function (ctx, d) {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return;
                }
                render(ctx, col.getNumbers(d), d);
            },
        };
    };
    ANumbersCellRenderer.prototype.createGroup = function (col, context, imposer) {
        var _this = this;
        var _a = this.createContext(col, context, imposer), templateRow = _a.templateRow, update = _a.update, clazz = _a.clazz;
        return {
            template: "<div class=\"".concat(clazz, "\">").concat(templateRow, "</div>"),
            update: function (n, group) {
                // render a heatmap
                return context.tasks
                    .groupRows(col, group, _this.title, function (rows) { return ANumbersCellRenderer.choose(col, rows); })
                    .then(function (data) {
                    if (typeof data !== 'symbol') {
                        update(n, data.normalized, data.raw, data.row, "".concat(getSortLabel(col.getSortMethod()), " "));
                    }
                });
            },
        };
    };
    return ANumbersCellRenderer;
}());
export { ANumbersCellRenderer };
/** @internal */
export function matchRows(n, length, template) {
    // first match the number of rows
    var children = Array.from(n.children);
    if (children.length > length) {
        children.slice(length).forEach(function (c) { return c.remove(); });
    }
    else if (length > children.length) {
        n.insertAdjacentHTML('beforeend', template.repeat(length - children.length));
    }
}
//# sourceMappingURL=ANumbersCellRenderer.js.map