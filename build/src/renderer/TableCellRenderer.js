import { isArrayColumn, isMapColumn, Column, isMissingValue, } from '../model';
import { renderMissingDOM } from './missing';
import { forEach, noop } from './utils';
import { cssClass } from '../styles';
import { renderTable } from './MapBarCellRenderer';
var TableCellRenderer = /** @class */ (function () {
    function TableCellRenderer() {
        this.title = 'Table';
    }
    TableCellRenderer.prototype.canRender = function (col) {
        return isMapColumn(col);
    };
    TableCellRenderer.prototype.create = function (col) {
        if (isArrayColumn(col) && col.dataLength) {
            // fixed length optimized rendering
            return this.createFixed(col);
        }
        return {
            template: "<div class=\"".concat(cssClass('rtable'), "\"></div>"),
            update: function (node, d) {
                if (renderMissingDOM(node, col, d)) {
                    return;
                }
                renderTable(node, col.getMapLabel(d), function (n, _a) {
                    var value = _a.value;
                    n.textContent = value;
                });
            },
        };
    };
    TableCellRenderer.template = function (col) {
        var labels = col.labels;
        return "<div>".concat(labels
            .map(function (l) { return "<div class=\"".concat(cssClass('table-cell'), "\">").concat(l, "</div><div  class=\"").concat(cssClass('table-cell'), "\" data-v></div>"); })
            .join('\n'), "</div>");
    };
    TableCellRenderer.prototype.createFixed = function (col) {
        return {
            template: TableCellRenderer.template(col),
            update: function (node, d) {
                if (renderMissingDOM(node, col, d)) {
                    return;
                }
                var value = col.getLabels(d);
                forEach(node, '[data-v]', function (n, i) {
                    n.textContent = value[i];
                });
            },
        };
    };
    TableCellRenderer.prototype.createGroup = function (col, context) {
        if (isArrayColumn(col) && col.dataLength) {
            // fixed length optimized rendering
            return this.createFixedGroup(col, context);
        }
        return {
            template: "<div class=\"".concat(cssClass('rtable'), "\"></div>"),
            update: function (node, group) {
                return context.tasks
                    .groupRows(col, group, 'table', function (rows) { return groupByKey(rows.map(function (d) { return col.getMapLabel(d); })); })
                    .then(function (entries) {
                    if (typeof entries === 'symbol') {
                        return;
                    }
                    renderTable(node, entries, function (n, _a) {
                        var values = _a.values;
                        var numExampleRows = 5;
                        var v = "".concat(values
                            .slice(0, numExampleRows)
                            .map(function (d) { return d.value; })
                            .join(', '));
                        if (numExampleRows < values.length) {
                            n.textContent = "".concat(v, ", \u2026");
                        }
                        else {
                            n.textContent = v;
                        }
                    });
                });
            },
        };
    };
    TableCellRenderer.prototype.createFixedGroup = function (col, context) {
        return {
            template: TableCellRenderer.template(col),
            update: function (node, group) {
                return context.tasks
                    .groupExampleRows(col, group, 'table', function (rows) {
                    var values = col.labels.map(function () { return []; });
                    rows.forEach(function (row) {
                        var labels = col.getLabels(row);
                        for (var i = 0; i < Math.min(values.length, labels.length); ++i) {
                            if (!isMissingValue(labels[i])) {
                                values[i].push(labels[i]);
                            }
                        }
                    });
                    return values;
                })
                    .then(function (values) {
                    if (typeof values === 'symbol') {
                        return;
                    }
                    forEach(node, '[data-v]', function (n, i) {
                        n.textContent = "".concat(values[i].join(', '), ", \u2026");
                    });
                });
            },
        };
    };
    TableCellRenderer.prototype.createSummary = function () {
        return {
            template: "<div class=\"".concat(cssClass('rtable'), "\"><div>Key</div><div>Value</div></div>"),
            update: noop,
        };
    };
    return TableCellRenderer;
}());
export default TableCellRenderer;
/** @internal */
export function groupByKey(arr) {
    var m = new Map();
    arr.forEach(function (a) {
        return a.forEach(function (d) {
            if (!m.has(d.key)) {
                m.set(d.key, [d]);
            }
            else {
                m.get(d.key).push(d);
            }
        });
    });
    return Array.from(m)
        .sort(function (a, b) { return a[0].localeCompare(b[0]); })
        .map(function (_a) {
        var key = _a[0], values = _a[1];
        return ({ key: key, values: values });
    });
}
//# sourceMappingURL=TableCellRenderer.js.map