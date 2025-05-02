import { DENSE_HISTOGRAM } from '../constants';
import { round, dragHandle } from '../internal';
import { cssClass, FILTERED_OPACITY } from '../styles';
import { color } from 'd3-color';
import { filterMissingNumberMarkup, updateFilterMissingNumberMarkup } from '../ui/missing';
function filteredColor(input) {
    var c = color(input);
    c.opacity = FILTERED_OPACITY;
    return c.toString();
}
export function histogramTemplate(guessedBins) {
    var bins = '';
    for (var i = 0; i < guessedBins; ++i) {
        bins += "<div class=\"".concat(cssClass('histogram-bin'), "\" title=\"Bin ").concat(i, ": 0\" data-x=\"\"><div style=\"height: 0\" ></div></div>");
    }
    // no closing div to be able to append things
    return "<div class=\"".concat(cssClass('histogram'), " ").concat(guessedBins > DENSE_HISTOGRAM ? cssClass('dense') : '', "\">").concat(bins);
}
function matchBins(n, bins) {
    //adapt the number of children
    var nodes = Array.from(n.querySelectorAll('[data-x]'));
    if (nodes.length > bins) {
        nodes.splice(bins, nodes.length - bins).forEach(function (d) { return d.remove(); });
    }
    else if (nodes.length < bins) {
        for (var i = nodes.length; i < bins; ++i) {
            n.insertAdjacentHTML('afterbegin', "<div class=\"".concat(cssClass('histogram-bin'), "\" title=\"Bin ").concat(i, ": 0\" data-x=\"\"><div style=\"height: 0\" ></div></div>"));
        }
        nodes = Array.from(n.querySelectorAll('[data-x]'));
    }
    n.classList.toggle(cssClass('dense'), bins > DENSE_HISTOGRAM);
    return nodes;
}
/** @internal */
export function histogramUpdate(n, stats, unfiltered, formatter, colorOf) {
    var hist = stats.hist;
    var nodes = matchBins(n, hist.length);
    nodes.forEach(function (d, i) {
        var bin = hist[i];
        var inner = d.firstElementChild;
        if (!bin) {
            inner.style.height = '0%';
            return;
        }
        var x0 = bin.x0, x1 = bin.x1, count = bin.count;
        var color = colorOf(bin);
        d.dataset.x = formatter(x0);
        if (unfiltered) {
            var gCount = (unfiltered.hist[i] || { count: count }).count;
            d.title = "".concat(formatter(x0), " - ").concat(formatter(x1), " (").concat(count, " of ").concat(gCount, ")");
            inner.style.height = "".concat(round((gCount * 100) / unfiltered.maxBin, 2), "%");
            var relY = 100 - round((count * 100) / gCount, 2);
            inner.style.background =
                relY === 0
                    ? color
                    : relY === 100
                        ? filteredColor(color)
                        : "linear-gradient(".concat(filteredColor(color), " ").concat(relY, "%, ").concat(color, " ").concat(relY, "%, ").concat(color, " 100%)");
        }
        else {
            d.title = "".concat(formatter(x0), " - ").concat(formatter(x1), " (").concat(count, ")");
            inner.style.height = "".concat(round((count * 100) / stats.maxBin, 2), "%");
            inner.style.backgroundColor = color;
        }
    });
}
/**
 * @internal
 */
export function mappingHintTemplate(range) {
    return "<span class=\"".concat(cssClass('mapping-hint'), "\" title=\"").concat(range[0], "\">").concat(range[0], "</span><span class=\"").concat(cssClass('mapping-hint'), "\" title=\"").concat(range[1], "\">").concat(range[1], "</span>");
}
/**
 * @internal
 */
export function mappingHintUpdate(n, range) {
    Array.from(n.getElementsByTagName('span')).forEach(function (d, i) { return (d.textContent = range[i]); });
}
export function filteredHistTemplate(c, f) {
    return "\n    <div class=\"".concat(cssClass('histogram-min-hint'), "\" style=\"width: ").concat(c.percent(f.filterMin), "%\"></div>\n    <div class=\"").concat(cssClass('histogram-max-hint'), "\" style=\"width: ").concat(100 - c.percent(f.filterMax), "%\"></div>\n    <div class=\"").concat(cssClass('histogram-min'), "\" data-value=\"").concat(c.format(f.filterMin), "\" data-raw=\"").concat(c.formatRaw(f.filterMin), "\" style=\"left: ").concat(c.percent(f.filterMin), "%\" title=\"min filter, drag or double click to change\"></div>\n    <div class=\"").concat(cssClass('histogram-max'), "\" data-value=\"").concat(c.format(f.filterMax), "\" data-raw=\"").concat(c.formatRaw(f.filterMax), "\" style=\"right: ").concat(100 - c.percent(f.filterMax), "%\" title=\"max filter, drag or double click to change\"></div>\n    ").concat(filterMissingNumberMarkup(f.filterMissing, 0), "\n  ");
}
export function initFilter(node, context) {
    var min = node.getElementsByClassName(cssClass('histogram-min'))[0];
    var max = node.getElementsByClassName(cssClass('histogram-max'))[0];
    var minHint = node.getElementsByClassName(cssClass('histogram-min-hint'))[0];
    var maxHint = node.getElementsByClassName(cssClass('histogram-max-hint'))[0];
    var filterMissing = node.getElementsByTagName('input')[0];
    var setFilter = function () {
        var minValue = context.parseRaw(min.dataset.raw);
        var maxValue = context.parseRaw(max.dataset.raw);
        context.setFilter(filterMissing.checked, minValue, maxValue);
    };
    var minImpl = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var value = context.parseRaw(min.dataset.raw);
        var maxValue = context.parseRaw(max.dataset.raw);
        context.edit(value, min, 'min', maxValue).then(function (newValue) {
            minHint.style.width = "".concat(context.percent(newValue), "%");
            min.dataset.value = context.format(newValue);
            min.dataset.raw = context.formatRaw(newValue);
            min.style.left = "".concat(context.percent(newValue), "%");
            min.classList.toggle(cssClass('swap-hint'), context.percent(newValue) > 15);
            setFilter();
        });
    };
    min.onclick = function (evt) {
        if (!evt.shiftKey && !evt.ctrlKey) {
            return;
        }
        minImpl(evt);
    };
    min.ondblclick = minImpl;
    var maxImpl = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var value = context.parseRaw(max.dataset.raw);
        var minValue = context.parseRaw(min.dataset.raw);
        context.edit(value, max, 'max', minValue).then(function (newValue) {
            maxHint.style.width = "".concat(100 - context.percent(newValue), "%");
            max.dataset.value = context.format(newValue);
            max.dataset.raw = context.formatRaw(newValue);
            max.style.right = "".concat(100 - context.percent(newValue), "%");
            max.classList.toggle(cssClass('swap-hint'), context.percent(newValue) < 85);
            setFilter();
        });
    };
    max.onclick = function (evt) {
        if (!evt.shiftKey && !evt.ctrlKey) {
            return;
        }
        maxImpl(evt);
    };
    max.ondblclick = maxImpl;
    filterMissing.onchange = function () { return setFilter(); };
    var options = {
        minDelta: 0,
        filter: function (evt) { return evt.button === 0 && !evt.shiftKey && !evt.ctrlKey; },
        onStart: function (handle) { return handle.classList.add(cssClass('hist-dragging')); },
        onDrag: function (handle, x) {
            var isMin = handle.classList.contains(cssClass('histogram-min'));
            var total = node.clientWidth;
            var px = Math.max(0, Math.min(x, total));
            var percent = Math.round((100 * px) / total);
            var rawValue = context.unpercent(percent);
            var otherValue = context.parseRaw((isMin ? max : min).dataset.raw);
            if ((isMin && rawValue > otherValue) || (!isMin && rawValue < otherValue)) {
                rawValue = otherValue;
                percent = context.percent(rawValue);
            }
            handle.dataset.value = context.format(rawValue);
            handle.dataset.raw = context.formatRaw(rawValue);
            if (isMin) {
                handle.style.left = "".concat(percent, "%");
                handle.classList.toggle(cssClass('swap-hint'), percent > 15);
                minHint.style.width = "".concat(percent, "%");
            }
            else {
                handle.style.right = "".concat(100 - percent, "%");
                handle.classList.toggle(cssClass('swap-hint'), percent < 85);
                maxHint.style.width = "".concat(100 - percent, "%");
            }
        },
        onEnd: function (handle) {
            handle.classList.remove(cssClass('hist-dragging'));
            setFilter();
        },
    };
    dragHandle(min, options);
    dragHandle(max, options);
    return function (missing, f) {
        minHint.style.width = "".concat(context.percent(f.filterMin), "%");
        maxHint.style.width = "".concat(100 - context.percent(f.filterMax), "%");
        min.dataset.value = context.format(f.filterMin);
        max.dataset.value = context.format(f.filterMax);
        min.dataset.raw = context.formatRaw(f.filterMin);
        max.dataset.raw = context.formatRaw(f.filterMax);
        min.style.left = "".concat(context.percent(f.filterMin), "%");
        max.style.right = "".concat(100 - context.percent(f.filterMax), "%");
        min.classList.toggle(cssClass('swap-hint'), context.percent(f.filterMin) > 15);
        max.classList.toggle(cssClass('swap-hint'), context.percent(f.filterMax) < 85);
        filterMissing.checked = f.filterMissing;
        updateFilterMissingNumberMarkup(filterMissing.parentElement, missing);
    };
}
//# sourceMappingURL=histogram.js.map