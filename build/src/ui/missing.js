import { cssClass } from '../styles';
/** @internal */
export var filterMissingText = 'Filter rows containing missing values';
/** @internal */
export function filterMissingMarkup(bakMissing) {
    return "<label class=\"".concat(cssClass('checkbox'), "\">\n    <input type=\"checkbox\" ").concat(bakMissing ? 'checked="checked"' : '', ">\n    <span class=\"").concat(cssClass('filter-missing'), "\">").concat(filterMissingText, "</span>\n  </label>");
}
/** @internal */
export function filterMissingNumberMarkup(bakMissing, count) {
    return "<label class=\"".concat(cssClass('checkbox'), "\">\n    <input type=\"checkbox\" ").concat(bakMissing ? 'checked="checked"' : '', " ").concat(count === 0 ? 'disabled' : '', ">\n    <span class=\"").concat(cssClass('filter-missing'), " ").concat(count === 0 ? cssClass('disabled') : '', "\">Filter ").concat(count, " missing value rows</span>\n  </label>");
}
/** @internal */
export function findFilterMissing(node) {
    return node.getElementsByClassName(cssClass('filter-missing'))[0]
        .previousElementSibling;
}
/** @internal */
export function updateFilterMissingNumberMarkup(element, count) {
    var checked = element.getElementsByTagName('input')[0];
    checked.disabled = count === 0;
    element.lastElementChild.classList.toggle(cssClass('disabled'), count === 0);
    element.lastElementChild.textContent = "Filter ".concat(count, " missing value rows");
}
//# sourceMappingURL=missing.js.map