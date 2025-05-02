var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { color } from 'd3-color';
import { round } from '../internal';
import { DEFAULT_COLOR, StringColumn } from '../model';
import { cssClass, FILTERED_OPACITY } from '../styles';
import StringCellRenderer from './StringCellRenderer';
var DEFAULT_FILTERED_COLOR = (function () {
    var c = color(DEFAULT_COLOR);
    c.opacity = FILTERED_OPACITY;
    return c.toString();
})();
/**
 * renders a string with additional alignment behavior
 * one instance factory shared among strings
 */
var StringHistogramCellRenderer = /** @class */ (function (_super) {
    __extends(StringHistogramCellRenderer, _super);
    function StringHistogramCellRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.title = 'TopN Histogram';
        return _this;
    }
    StringHistogramCellRenderer.prototype.createGroup = function (col, context) {
        var _a = hist(false), template = _a.template, update = _a.update;
        return {
            template: template,
            update: function (node, group) {
                return context.tasks.groupStringStats(col, group).then(function (r) {
                    if (typeof r === 'symbol' || !r) {
                        return;
                    }
                    update(node, r.group, r.summary);
                });
            },
        };
    };
    StringHistogramCellRenderer.prototype.createSummary = function (col, context, interactive) {
        if (interactive) {
            return _super.prototype.createSummary.call(this, col, context, interactive);
        }
        var _a = hist(interactive), template = _a.template, update = _a.update;
        return {
            template: template,
            update: function (node) {
                return context.tasks.summaryStringStats(col).then(function (r) {
                    if (typeof r === 'symbol' || !r) {
                        return;
                    }
                    update(node, r.summary);
                });
            },
        };
    };
    return StringHistogramCellRenderer;
}(StringCellRenderer));
export default StringHistogramCellRenderer;
function hist(showLabels) {
    var bins = Array(5)
        .fill(0)
        .map(function () {
        return "<div class=\"".concat(cssClass('histogram-bin'), "\" title=\": 0\" data-cat=\"\" ").concat(showLabels ? "data-title=\"\"" : '', "><div style=\"height: 0; background: ").concat(DEFAULT_COLOR, "\"></div></div>");
    })
        .join('');
    var template = "<div class=\"".concat(cssClass('histogram'), "\">").concat(bins, "</div>");
    return {
        template: template,
        update: function (n, hist, gHist) {
            var maxBin = (gHist !== null && gHist !== void 0 ? gHist : hist).topN.reduce(function (acc, v) { return Math.max(acc, v.count); }, 0);
            var updateBin = function (d, i) {
                var _a;
                var bin = hist.topN[i];
                var inner = d.firstElementChild;
                d.dataset.cat = bin.value;
                if (showLabels) {
                    d.dataset.title = bin.value;
                }
                if (gHist) {
                    var gCount = ((_a = gHist.topN[i]) !== null && _a !== void 0 ? _a : { count: 0 }).count;
                    d.title = "".concat(bin.value, ": ").concat(bin.count, " of ").concat(gCount);
                    inner.style.height = "".concat(round((gCount * 100) / maxBin, 2), "%");
                    var relY = 100 - round((bin.count * 100) / gCount, 2);
                    inner.style.background =
                        relY === 0
                            ? DEFAULT_COLOR
                            : relY === 100
                                ? DEFAULT_FILTERED_COLOR
                                : "linear-gradient(".concat(DEFAULT_FILTERED_COLOR, " ").concat(relY, "%, ").concat(DEFAULT_COLOR, " ").concat(relY, "%, ").concat(DEFAULT_COLOR, " 100%)");
                }
                else {
                    d.title = "".concat(bin.value, ": ").concat(bin.count);
                    var inner_1 = d.firstElementChild;
                    inner_1.style.height = "".concat(Math.round((bin.count * 100) / maxBin), "%");
                }
            };
            var dataBins = hist.topN.length;
            var bins = Array.from(n.querySelectorAll(".".concat(cssClass('histogram-bin'))));
            for (var i = 0; i < Math.min(bins.length, dataBins); i++) {
                updateBin(bins[i], i);
            }
            for (var i = bins.length; i < dataBins; i++) {
                var d = n.ownerDocument.createElement('div');
                d.classList.add(cssClass('histogram-bin'));
                n.appendChild(d);
                var dd = n.ownerDocument.createElement('div');
                dd.style.height = '0';
                dd.style.background = DEFAULT_COLOR;
                d.appendChild(dd);
                updateBin(d, i);
            }
            for (var i = dataBins; i < bins.length; i++) {
                bins[i].remove();
            }
        },
    };
}
//# sourceMappingURL=StringHistogramCellRenderer.js.map