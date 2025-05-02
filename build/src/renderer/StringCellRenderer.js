import { StringColumn, Column } from '../model';
import { filterMissingMarkup, findFilterMissing } from '../ui/missing';
import { renderMissingDOM } from './missing';
import { setText, exampleText } from './utils';
import { cssClass } from '../styles';
import { debounce } from '../internal';
/**
 * renders a string with additional alignment behavior
 * one instance factory shared among strings
 */
var StringCellRenderer = /** @class */ (function () {
    function StringCellRenderer() {
        this.title = 'Default';
    }
    StringCellRenderer.prototype.canRender = function (col) {
        return col instanceof StringColumn;
    };
    StringCellRenderer.prototype.create = function (col, context) {
        var align = context.sanitize(col.alignment || 'left');
        return {
            template: "<div".concat(align !== 'left' ? " class=\"".concat(cssClass(align), "\"") : '', "> </div>"),
            update: function (n, d) {
                renderMissingDOM(n, col, d);
                if (col.escape) {
                    setText(n, col.getLabel(d));
                }
                else {
                    n.innerHTML = col.getLabel(d);
                }
                n.title = n.textContent;
            },
        };
    };
    StringCellRenderer.prototype.createGroup = function (col, context) {
        return {
            template: "<div> </div>",
            update: function (n, group) {
                return context.tasks
                    .groupExampleRows(col, group, 'string', function (rows) { return exampleText(col, rows); })
                    .then(function (text) {
                    if (typeof text === 'symbol') {
                        return;
                    }
                    n.classList.toggle(cssClass('missing'), !text);
                    if (col.escape) {
                        setText(n, text);
                    }
                    else {
                        n.innerHTML = text;
                        n.title = text;
                    }
                });
            },
        };
    };
    StringCellRenderer.interactiveSummary = function (col, node) {
        var form = node;
        var filterMissing = findFilterMissing(node);
        var input = node.querySelector('input[type="text"]');
        var isRegex = node.querySelector('input[type="checkbox"]');
        var isInputFocused = false;
        var update = function () {
            var valid = input.value.trim();
            if (valid.length <= 0) {
                var filter = filterMissing.checked ? { filter: null, filterMissing: filterMissing.checked } : null;
                col.setFilter(filter);
                return;
            }
            col.setFilter({
                filter: isRegex.checked ? new RegExp(input.value) : input.value,
                filterMissing: filterMissing.checked,
            });
        };
        filterMissing.onchange = update;
        input.onchange = update;
        input.oninput = debounce(update, 100);
        input.onfocus = function () {
            isInputFocused = true;
        };
        input.onblur = function () {
            isInputFocused = false;
        };
        isRegex.onchange = update;
        form.onsubmit = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            update();
            return false;
        };
        return function (actCol) {
            // skip update of form fields if search input is currently in focus
            // otherwise this function sets an old value while typing
            if (isInputFocused) {
                return;
            }
            col = actCol;
            var f = col.getFilter() || { filter: null, filterMissing: false };
            var bak = f.filter;
            filterMissing.checked = f.filterMissing;
            input.value = bak instanceof RegExp ? bak.source : bak || '';
            isRegex.checked = bak instanceof RegExp;
        };
    };
    StringCellRenderer.prototype.createSummary = function (col, context, interactive) {
        if (!interactive) {
            return {
                template: "<div></div>",
                update: function (node) {
                    var filter = col.getFilter();
                    node.textContent = filterToString(filter);
                },
            };
        }
        var f = col.getFilter() || { filter: null, filterMissing: false };
        var bak = f.filter || '';
        var update;
        return {
            template: "<form><input type=\"text\" placeholder=\"Filter ".concat(context.sanitize(col.desc.label), "...\" autofocus\n      list=\"").concat(context.idPrefix).concat(col.id, "_dl\" value=\"").concat(context.sanitize(filterToString(f)), "\">\n          <label class=\"").concat(cssClass('checkbox'), "\">\n            <input type=\"checkbox\" ").concat(bak instanceof RegExp ? 'checked="checked"' : '', ">\n            <span>Use regular expressions</span>\n          </label>\n          ").concat(filterMissingMarkup(f.filterMissing), "\n          <datalist id=\"").concat(context.idPrefix).concat(col.id, "_dl\"></datalist></form>"),
            update: function (node) {
                if (!update) {
                    update = StringCellRenderer.interactiveSummary(col, node);
                }
                update(col);
                var dl = node.querySelector('datalist');
                // no return here = loading indicator since it won't affect the rendering
                void context.tasks.summaryStringStats(col).then(function (r) {
                    if (typeof r === 'symbol') {
                        return;
                    }
                    var summary = r.summary;
                    matchDataList(dl, summary.topN);
                });
            },
        };
    };
    return StringCellRenderer;
}());
export default StringCellRenderer;
/**
 * @internal
 */
export function filterToString(filter) {
    if (filter == null || !filter.filter) {
        return '';
    }
    if (filter.filter instanceof RegExp) {
        return filter.filter.source;
    }
    return filter.filter;
}
/**
 * matches the given stats to a datalist
 * @internal
 */
export function matchDataList(node, matches) {
    var children = Array.from(node.options);
    // update existing
    for (var i = 0; i < matches.length; i++) {
        var m = matches[i];
        var child = children[i];
        if (!child) {
            child = node.ownerDocument.createElement('option');
            node.appendChild(child);
        }
        child.value = m.value;
        setText(child, m.count > 1 ? "".concat(m.value, " (").concat(m.count.toLocaleString(), ")") : m.value);
    }
    // remove extra
    for (var i = children.length - 1; i >= matches.length; i--) {
        children[i].remove();
    }
}
//# sourceMappingURL=StringCellRenderer.js.map