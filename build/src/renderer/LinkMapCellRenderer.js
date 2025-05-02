import { LinkMapColumn, Column } from '../model';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { groupByKey } from './TableCellRenderer';
import { noRenderer, noop } from './utils';
import { cssClass } from '../styles';
import { clear } from '../internal';
import { updateLinkList } from './LinkCellRenderer';
import { renderTable } from './MapBarCellRenderer';
var LinkMapCellRenderer = /** @class */ (function () {
    function LinkMapCellRenderer() {
        this.title = 'Table with Links';
    }
    LinkMapCellRenderer.prototype.canRender = function (col, mode) {
        return col instanceof LinkMapColumn && mode !== ERenderMode.SUMMARY;
    };
    LinkMapCellRenderer.prototype.create = function (col, context) {
        var align = context.sanitize(col.alignment || 'left');
        return {
            template: "<div class=\"".concat(cssClass('rtable'), "\"></div>"),
            update: function (node, d) {
                if (renderMissingDOM(node, col, d)) {
                    return;
                }
                clear(node);
                var doc = node.ownerDocument;
                for (var _i = 0, _a = col.getLinkMap(d); _i < _a.length; _i++) {
                    var _b = _a[_i], key = _b.key, value = _b.value;
                    var keyNode = doc.createElement('div');
                    keyNode.classList.add(cssClass('table-cell'));
                    keyNode.textContent = key;
                    node.appendChild(keyNode);
                    var valueNode = doc.createElement('div');
                    valueNode.classList.add(cssClass('table-cell'));
                    if (align !== 'left') {
                        valueNode.classList.add(cssClass(align));
                    }
                    var valueA = doc.createElement('a');
                    valueA.href = value.href;
                    valueA.textContent = value.alt;
                    valueA.target = '_blank';
                    valueA.rel = 'noopener';
                    valueNode.appendChild(valueA);
                    node.appendChild(valueNode);
                }
            },
            render: noop,
        };
    };
    LinkMapCellRenderer.example = function (arr) {
        var numExampleRows = 5;
        var examples = [];
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var row = arr_1[_i];
            if (!row || !row.value.href) {
                continue;
            }
            examples.push(row.value);
            if (examples.length >= numExampleRows) {
                break;
            }
        }
        if (examples.length === 0) {
            return [[], false];
        }
        return [examples, examples.length < arr.length];
    };
    LinkMapCellRenderer.prototype.createGroup = function (col, context) {
        var align = col.alignment || 'left';
        return {
            template: "<div class=\"".concat(cssClass('rtable'), "\"></div>"),
            update: function (node, group) {
                return context.tasks
                    .groupRows(col, group, 'linkmap', function (rows) { return groupByKey(rows.map(function (d) { return col.getLinkMap(d); })); })
                    .then(function (entries) {
                    if (typeof entries === 'symbol') {
                        return;
                    }
                    renderTable(node, entries, function (n, _a) {
                        var values = _a.values;
                        if (align !== 'left') {
                            n.classList.add(cssClass(align));
                        }
                        var _b = LinkMapCellRenderer.example(values), links = _b[0], more = _b[1];
                        if (links.length === 0) {
                            n.classList.add(cssClass('missing'));
                        }
                        else {
                            updateLinkList(n, links, more);
                        }
                    });
                });
            },
        };
    };
    LinkMapCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return LinkMapCellRenderer;
}());
export default LinkMapCellRenderer;
//# sourceMappingURL=LinkMapCellRenderer.js.map