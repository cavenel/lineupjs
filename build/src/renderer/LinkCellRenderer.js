import { LinkColumn, Column } from '../model';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { noRenderer, setText } from './utils';
import { cssClass } from '../styles';
import { clear } from '../internal';
var LinkCellRenderer = /** @class */ (function () {
    function LinkCellRenderer() {
        this.title = 'Link';
    }
    LinkCellRenderer.prototype.canRender = function (col, mode) {
        return col instanceof LinkColumn && mode !== ERenderMode.SUMMARY;
    };
    LinkCellRenderer.prototype.create = function (col, context) {
        var align = context.sanitize(col.alignment || 'left');
        return {
            template: "<a".concat(align !== 'left' ? " class=\"".concat(cssClass(align), "\"") : '', " target=\"_blank\" rel=\"noopener\" href=\"\"></a>"),
            update: function (n, d) {
                renderMissingDOM(n, col, d);
                var v = col.getLink(d);
                n.href = v ? v.href : '';
                if (col.escape) {
                    setText(n, v ? v.alt : '');
                }
                else {
                    n.innerHTML = v ? v.alt : '';
                }
            },
        };
    };
    LinkCellRenderer.exampleText = function (col, rows) {
        var numExampleRows = 5;
        var examples = [];
        rows.every(function (row) {
            var v = col.getLink(row);
            if (!v) {
                return true;
            }
            examples.push(v);
            return examples.length < numExampleRows;
        });
        if (examples.length === 0) {
            return [[], false];
        }
        return [examples, examples.length < rows.length];
    };
    LinkCellRenderer.prototype.createGroup = function (col, context) {
        return {
            template: "<div> </div>",
            update: function (n, group) {
                return context.tasks
                    .groupExampleRows(col, group, 'link', function (rows) { return LinkCellRenderer.exampleText(col, rows); })
                    .then(function (out) {
                    if (typeof out === 'symbol') {
                        return;
                    }
                    var links = out[0], more = out[1];
                    updateLinkList(n, links, more);
                });
            },
        };
    };
    LinkCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return LinkCellRenderer;
}());
export default LinkCellRenderer;
export function updateLinkList(n, links, more) {
    n.classList.toggle(cssClass('missing'), links.length === 0);
    clear(n);
    links.forEach(function (l, i) {
        if (i > 0) {
            n.appendChild(n.ownerDocument.createTextNode(', '));
        }
        var a = n.ownerDocument.createElement('a');
        a.href = l.href;
        a.textContent = l.alt;
        a.target = '_blank';
        a.rel = 'noopener';
        n.appendChild(a);
    });
    if (more) {
        n.insertAdjacentText('beforeend', ', …');
    }
}
//# sourceMappingURL=LinkCellRenderer.js.map