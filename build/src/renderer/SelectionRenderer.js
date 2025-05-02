import { Column, SelectionColumn } from '../model';
import { cssClass } from '../styles';
import { everyIndices } from '../model/internal';
import { rangeSelection } from '../provider/utils';
var SelectionRenderer = /** @class */ (function () {
    function SelectionRenderer() {
        this.title = 'Default';
    }
    SelectionRenderer.prototype.canRender = function (col) {
        return col instanceof SelectionColumn;
    };
    SelectionRenderer.prototype.create = function (col, ctx) {
        return {
            template: "<div></div>",
            update: function (n, d, i) {
                n.onclick = function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.shiftKey) {
                        var ranking = col.findMyRanker().id;
                        if (rangeSelection(ctx.provider, ranking, d.i, i, event.ctrlKey)) {
                            return;
                        }
                    }
                    col.toggleValue(d);
                };
            },
        };
    };
    SelectionRenderer.prototype.createGroup = function (col, context) {
        return {
            template: "<div></div>",
            update: function (n, group) {
                var selected = 0;
                var unselected = 0;
                var total = group.order.length;
                everyIndices(group.order, function (i) {
                    var s = context.provider.isSelected(i);
                    if (s) {
                        selected++;
                    }
                    else {
                        unselected++;
                    }
                    if (selected * 2 > total || unselected * 2 > total) {
                        // more than half already, can abort already decided
                        return false;
                    }
                    return true;
                });
                n.classList.toggle(cssClass('group-selected'), selected * 2 > total);
                n.onclick = function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var value = n.classList.toggle(cssClass('group-selected'));
                    col.setValues(group.order, value);
                };
            },
        };
    };
    SelectionRenderer.prototype.createSummary = function (col, context) {
        var unchecked = cssClass('icon-unchecked');
        var checked = cssClass('icon-checked');
        return {
            template: "<div title=\"(Un)Select All\" class=\"".concat(unchecked, "\"></div>"),
            update: function (node) {
                node.onclick = function (evt) {
                    evt.stopPropagation();
                    var isUnchecked = node.classList.contains(unchecked);
                    if (isUnchecked) {
                        context.provider.selectAllOf(col.findMyRanker());
                        node.classList.remove(unchecked);
                        node.classList.add(checked);
                    }
                    else {
                        context.provider.setSelection([]);
                        node.classList.remove(checked);
                        node.classList.add(unchecked);
                    }
                };
            },
        };
    };
    return SelectionRenderer;
}());
export default SelectionRenderer;
//# sourceMappingURL=SelectionRenderer.js.map