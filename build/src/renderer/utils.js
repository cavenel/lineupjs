import { MIN_LABEL_WIDTH } from '../constants';
import { Column, isMapAbleColumn, DEFAULT_COLOR, } from '../model';
import { hsl } from 'd3-color';
import { cssClass } from '../styles';
/** @internal */
export function noop() {
    // no op
}
export var noRenderer = {
    template: "<div></div>",
    update: noop,
};
/** @internal */
export function setText(node, text) {
    if (text === undefined) {
        return node;
    }
    //no performance boost if setting the text node directly
    //const textNode = <Text>node.firstChild;
    //if (textNode == null) {
    //  node.appendChild(node.ownerDocument!.createTextNode(text));
    //} else {
    //  textNode.data = text;
    //}
    if (node.textContent !== text) {
        node.textContent = text;
    }
    return node;
}
/**
 * for each item matching the selector execute the callback
 * @param node
 * @param selector
 * @param callback
 * @internal
 */
export function forEach(node, selector, callback) {
    Array.from(node.querySelectorAll(selector)).forEach(callback);
}
/** @internal */
export function forEachChild(node, callback) {
    Array.from(node.children).forEach(callback);
}
/**
 * matches the columns and the dom nodes representing them
 * @param {HTMLElement} node row
 * @param columns columns to check
 * @internal
 */
export function matchColumns(node, columns, ctx) {
    if (node.childElementCount === 0) {
        // initial call fast method
        node.innerHTML = columns.map(function (c) { return c.template; }).join('');
        var children_1 = Array.from(node.children);
        columns.forEach(function (col, i) {
            var childNode = children_1[i];
            // set attribute for finding again
            childNode.dataset.columnId = col.column.id;
            // store current renderer
            childNode.dataset.renderer = col.rendererId;
            childNode.classList.add(cssClass("renderer-".concat(col.rendererId)));
        });
        return;
    }
    function matches(c, i) {
        //do both match?
        var n = node.children[i];
        return n != null && n.dataset.columnId === c.column.id && n.dataset.renderer === c.rendererId;
    }
    if (columns.every(matches)) {
        return; //nothing to do
    }
    var idsAndRenderer = new Set(columns.map(function (c) { return "".concat(c.column.id, "@").concat(c.rendererId); }));
    //remove all that are not existing anymore
    forEachChild(node, function (n) {
        var id = n.dataset.columnId;
        var renderer = n.dataset.renderer;
        var idAndRenderer = "".concat(id, "@").concat(renderer);
        if (!idsAndRenderer.has(idAndRenderer)) {
            node.removeChild(n);
        }
    });
    columns.forEach(function (col) {
        var childNode = node.querySelector("[data-column-id=\"".concat(col.column.id, "\"]"));
        if (!childNode) {
            childNode = ctx.asElement(col.template);
            childNode.dataset.columnId = col.column.id;
            childNode.dataset.renderer = col.rendererId;
            childNode.classList.add(cssClass("renderer-".concat(col.rendererId)));
        }
        node.appendChild(childNode);
    });
}
export function wideEnough(col, length) {
    if (length === void 0) { length = col.labels.length; }
    var w = col.getWidth();
    return w / length > MIN_LABEL_WIDTH; // at least 30 pixel
}
export function wideEnoughCat(col) {
    var w = col.getWidth();
    return w / col.categories.length > MIN_LABEL_WIDTH; // at least 30 pixel
}
// side effect
var adaptTextColorToBgColorCache = {};
/**
 * Adapts the text color for a given background color
 * @param {string} bgColor as `#ff0000`
 * @returns {string} returns `black` or `white` for best contrast
 */
export function adaptTextColorToBgColor(bgColor) {
    var bak = adaptTextColorToBgColorCache[bgColor];
    if (bak) {
        return bak;
    }
    return (adaptTextColorToBgColorCache[bgColor] = hsl(bgColor).l > 0.5 ? 'black' : 'white');
}
/**
 *
 * Adapts the text color for a given background color
 * @param {HTMLElement} node the node containing the text
 * @param {string} bgColor as `#ff0000`
 * @param {string} title the title to render
 * @param {number} width for which percentages of the cell this background applies (0..1)
 */
export function adaptDynamicColorToBgColor(node, bgColor, title, width) {
    var adapt = adaptTextColorToBgColor(bgColor);
    if (width <= 0.05 || adapt === 'black' || width > 0.9) {
        // almost empty or full
        node.style.color = adapt === 'black' || width <= 0.05 ? null : adapt; // null = black
        // node.classList.remove('lu-gradient-text');
        // node.style.backgroundImage = null;
        return;
    }
    node.style.color = null;
    node.innerText = title;
    var span = node.ownerDocument.createElement('span');
    span.classList.add(cssClass('gradient-text'));
    span.style.color = adapt;
    span.innerText = title;
    node.appendChild(span);
}
/** @internal */
export var uniqueId = (function () {
    // side effect but just within the function itself, so good for the library
    var idCounter = 0;
    return function (prefix) { return "".concat(prefix).concat((idCounter++).toString(36)); };
})();
var NUM_EXAMPLE_VALUES = 5;
/** @internal */
export function exampleText(col, rows) {
    var examples = [];
    rows.every(function (row) {
        if (col.getValue(row) == null) {
            return true;
        }
        var v = col.getLabel(row);
        examples.push(v);
        return examples.length < NUM_EXAMPLE_VALUES;
    });
    if (examples.length === 0) {
        return '';
    }
    return "".concat(examples.join(', ')).concat(examples.length < rows.length ? ', ...' : '');
}
/** @internal */
export function multiLevelGridCSSClass(idPrefix, column) {
    return cssClass("stacked-".concat(idPrefix, "-").concat(column.id));
}
/** @internal */
export function colorOf(col) {
    if (isMapAbleColumn(col)) {
        return col.getColorMapping().apply(0);
    }
    return DEFAULT_COLOR;
}
// side effect
var adaptColorCache = {};
export var BIG_MARK_LIGHTNESS_FACTOR = 1.1;
export var SMALL_MARK_LIGHTNESS_FACTOR = 0.9;
export function adaptColor(color, lightnessFactor, saturationFactor) {
    if (lightnessFactor === void 0) { lightnessFactor = 1; }
    if (saturationFactor === void 0) { saturationFactor = 1; }
    var key = "".concat(color, "-").concat(saturationFactor, "-").concat(lightnessFactor);
    var r = adaptColorCache[key];
    if (r) {
        return r;
    }
    var hslColor = hsl(color);
    hslColor.s = Math.max(Math.min(hslColor.s * saturationFactor, 1), 0);
    hslColor.l = Math.max(Math.min(hslColor.l * lightnessFactor, 1), 0);
    var result = hslColor.formatHex();
    adaptColorCache[key] = result;
    return result;
}
//# sourceMappingURL=utils.js.map