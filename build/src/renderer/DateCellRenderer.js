import { Column, DateColumn } from '../model';
import { renderMissingDOM } from './missing';
import { noop, noRenderer, setText, exampleText } from './utils';
import { chooseAggregatedDate } from '../model/internalDate';
import { cssClass } from '../styles';
var DateCellRenderer = /** @class */ (function () {
    function DateCellRenderer() {
        this.title = 'Date';
        this.groupTitle = 'Date';
        this.summaryTitle = 'Date';
    }
    DateCellRenderer.prototype.canRender = function (col) {
        return col instanceof DateColumn;
    };
    DateCellRenderer.prototype.create = function (col) {
        return {
            template: "<div> </div>",
            update: function (n, d) {
                renderMissingDOM(n, col, d);
                setText(n, col.getLabel(d));
            },
            render: noop,
        };
    };
    DateCellRenderer.prototype.createGroup = function (col, context) {
        return {
            template: "<div> </div>",
            update: function (n, group) {
                var isGrouped = col.isGroupedBy() >= 0;
                if (isGrouped) {
                    return context.tasks
                        .groupRows(col, group, 'date', function (rows) { return chooseAggregatedDate(rows, col.getDateGrouper(), col); })
                        .then(function (chosen) {
                        if (typeof chosen === 'symbol') {
                            return;
                        }
                        n.classList.toggle(cssClass('missing'), !chosen);
                        setText(n, chosen ? chosen.name : '');
                    });
                }
                return context.tasks
                    .groupExampleRows(col, group, 'date', function (sample) { return exampleText(col, sample); })
                    .then(function (text) {
                    if (typeof text === 'symbol') {
                        return;
                    }
                    n.classList.toggle(cssClass('missing'), !text);
                    setText(n, text);
                });
            },
        };
    };
    DateCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return DateCellRenderer;
}());
export default DateCellRenderer;
//# sourceMappingURL=DateCellRenderer.js.map