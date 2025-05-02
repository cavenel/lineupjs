import { Column, NumbersColumn, isNumbersColumn, isMissingValue, } from '../model';
import { matchRows } from './ANumbersCellRenderer';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { forEachChild, noRenderer } from './utils';
import { cssClass } from '../styles';
/** @internal */
export function line(data) {
    if (data.length === 0) {
        return '';
    }
    var p = '';
    var moveNext = true;
    data.forEach(function (d, i) {
        if (Number.isNaN(d)) {
            moveNext = true;
        }
        else if (moveNext) {
            p += "M".concat(i, ",").concat(1 - d, " ");
            moveNext = false;
        }
        else {
            p += "L".concat(i, ",").concat(1 - d, " ");
        }
    });
    return p;
}
var SparklineCellRenderer = /** @class */ (function () {
    function SparklineCellRenderer() {
        this.title = 'Sparkline';
    }
    SparklineCellRenderer.prototype.canRender = function (col, mode) {
        return isNumbersColumn(col) && mode !== ERenderMode.SUMMARY;
    };
    SparklineCellRenderer.prototype.create = function (col) {
        var dataLength = col.dataLength;
        var yPos = 1 - col.getMapping().apply(NumbersColumn.CENTER);
        return {
            template: "<svg viewBox=\"0 0 ".concat(dataLength - 1, " 1\" preserveAspectRatio=\"none meet\"><line x1=\"0\" x2=\"").concat(dataLength - 1, "\" y1=\"").concat(yPos, "\" y2=\"").concat(yPos, "\"></line><path></path></svg>"),
            update: function (n, d) {
                if (renderMissingDOM(n, col, d)) {
                    return;
                }
                var data = col.getNumbers(d);
                n.lastElementChild.setAttribute('d', line(data));
            },
        };
    };
    SparklineCellRenderer.prototype.createGroup = function (col, context) {
        var dataLength = col.dataLength;
        var yPos = 1 - col.getMapping().apply(NumbersColumn.CENTER);
        return {
            template: "<svg viewBox=\"0 0 ".concat(dataLength - 1, " 1\" preserveAspectRatio=\"none meet\"><line x1=\"0\" x2=\"").concat(dataLength - 1, "\" y1=\"").concat(yPos, "\" y2=\"").concat(yPos, "\"></line><path></path></svg>"),
            update: function (n, group) {
                //overlapping ones
                matchRows(n, group.order.length, "<path></path>");
                return context.tasks
                    .groupRows(col, group, 'numbers', function (r) { return Array.from(r.map(function (d) { return col.getNumbers(d); })); })
                    .then(function (vs) {
                    if (typeof vs === 'symbol') {
                        return;
                    }
                    var isMissing = vs.length === 0 || vs.every(function (v) { return v.every(isMissingValue); });
                    n.classList.toggle(cssClass('missing'), isMissing);
                    if (isMissing) {
                        return;
                    }
                    forEachChild(n, function (row, i) {
                        row.setAttribute('d', line(vs[i]));
                    });
                });
            },
        };
    };
    SparklineCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return SparklineCellRenderer;
}());
export default SparklineCellRenderer;
//# sourceMappingURL=SparklineCellRenderer.js.map