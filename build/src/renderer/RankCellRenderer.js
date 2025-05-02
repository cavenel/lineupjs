import { Column, RankColumn } from '../model';
import { renderMissingDOM } from './missing';
import { noRenderer, setText } from './utils';
import { cssClass } from '../styles';
var RankCellRenderer = /** @class */ (function () {
    function RankCellRenderer() {
        this.title = 'Default';
    }
    RankCellRenderer.prototype.canRender = function (col) {
        return col instanceof RankColumn;
    };
    RankCellRenderer.prototype.create = function (col) {
        return {
            template: "<div class=\"".concat(cssClass('right'), "\"> </div>"),
            update: function (n, d) {
                renderMissingDOM(n, col, d);
                setText(n, col.getLabel(d));
            },
        };
    };
    RankCellRenderer.prototype.createGroup = function (col) {
        var ranking = col.findMyRanker();
        return {
            template: "<div><div></div><div></div></div>",
            update: function (n, group) {
                var fromTSpan = n.firstElementChild;
                var toTSpan = n.lastElementChild;
                if (group.order.length === 0) {
                    fromTSpan.textContent = '';
                    toTSpan.textContent = '';
                    return;
                }
                fromTSpan.textContent = ranking.getRank(group.order[0]).toString();
                toTSpan.textContent = ranking.getRank(group.order[group.order.length - 1]).toString();
            },
        };
    };
    RankCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return RankCellRenderer;
}());
export default RankCellRenderer;
//# sourceMappingURL=RankCellRenderer.js.map