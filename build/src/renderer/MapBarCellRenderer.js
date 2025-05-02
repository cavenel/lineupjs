import { clear, round } from '../internal';
import { Column, isMapAbleColumn, isMapColumn, isNumberColumn, } from '../model';
import { colorOf } from './impose';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { noRenderer, adaptColor, BIG_MARK_LIGHTNESS_FACTOR } from './utils';
import { cssClass } from '../styles';
var MapBarCellRenderer = /** @class */ (function () {
    function MapBarCellRenderer() {
        this.title = 'Bar Table';
    }
    MapBarCellRenderer.prototype.canRender = function (col, mode) {
        return (isMapColumn(col) &&
            isNumberColumn(col) &&
            (mode === ERenderMode.CELL || (mode === ERenderMode.SUMMARY && isMapAbleColumn(col))));
    };
    MapBarCellRenderer.prototype.create = function (col, _context, imposer) {
        var formatter = col.getNumberFormat();
        return {
            template: "<div class=\"".concat(cssClass('rtable'), "\"></div>"),
            update: function (node, d) {
                if (renderMissingDOM(node, col, d)) {
                    return;
                }
                renderTable(node, col.getMap(d), function (n, _a) {
                    var value = _a.value;
                    if (Number.isNaN(value)) {
                        n.classList.add(cssClass('missing'));
                    }
                    else {
                        var w = round(value * 100, 2);
                        n.title = formatter(value);
                        var inner = n.ownerDocument.createElement('div');
                        inner.style.width = "".concat(w, "%");
                        inner.style.backgroundColor = adaptColor(colorOf(col, d, imposer), BIG_MARK_LIGHTNESS_FACTOR);
                        n.appendChild(inner);
                        var span = n.ownerDocument.createElement('span');
                        span.classList.add(cssClass('hover-only'));
                        span.textContent = formatter(value);
                        inner.appendChild(span);
                    }
                });
            },
        };
    };
    MapBarCellRenderer.prototype.createGroup = function () {
        return noRenderer;
    };
    MapBarCellRenderer.prototype.createSummary = function (col) {
        return {
            template: "<div class=\"".concat(cssClass('rtable'), "\"><div>Key</div><div><span></span><span></span>Value</div></div>"),
            update: function (node) {
                var range = col.getRange();
                var value = node.lastElementChild;
                value.firstElementChild.textContent = range[0];
                value.children[1].textContent = range[1];
            },
        };
    };
    return MapBarCellRenderer;
}());
export default MapBarCellRenderer;
export function renderTable(node, arr, renderValue) {
    clear(node);
    var doc = node.ownerDocument;
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var entry = arr_1[_i];
        var keyNode = doc.createElement('div');
        keyNode.textContent = entry.key;
        node.appendChild(keyNode);
        var valueNode = doc.createElement('div');
        renderValue(valueNode, entry);
        node.appendChild(valueNode);
    }
}
//# sourceMappingURL=MapBarCellRenderer.js.map