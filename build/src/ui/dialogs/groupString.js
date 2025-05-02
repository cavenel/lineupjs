import { StringColumn, EStringGroupCriteriaType } from '../../model';
import { cssClass } from '../../styles';
/** @internal */
export default function groupString(col, node, dialog) {
    var current = col.getGroupCriteria();
    var type = current.type, values = current.values;
    node.insertAdjacentHTML('beforeend', "\n    <label class=\"".concat(cssClass('checkbox'), "\">\n      <input type=\"radio\" name=\"").concat(dialog.idPrefix, "groupString\" value=\"").concat(EStringGroupCriteriaType.value, "\" id=\"").concat(dialog.idPrefix, "VAL\" ").concat(type === EStringGroupCriteriaType.value ? 'checked' : '', ">\n      <span>Use text value</span>\n    </label>\n    <label class=\"").concat(cssClass('checkbox'), "\">\n      <input type=\"radio\" name=\"").concat(dialog.idPrefix, "groupString\" value=\"").concat(EStringGroupCriteriaType.startsWith, "\" id=\"").concat(dialog.idPrefix, "RW\" ").concat(type === EStringGroupCriteriaType.startsWith ? 'checked' : '', ">\n      <span>Text starts with \u2026</span>\n    </label>\n    <label class=\"").concat(cssClass('checkbox'), "\">\n      <input type=\"radio\" name=\"").concat(dialog.idPrefix, "groupString\" value=\"").concat(EStringGroupCriteriaType.regex, "\" id=\"").concat(dialog.idPrefix, "RE\" ").concat(type === EStringGroupCriteriaType.regex ? 'checked' : '', ">\n      <span>Use regular expressions</span>\n    </label>\n    <textarea rows=\"5\" placeholder=\"one value per row, e.g., \nA\nB\" id=\"").concat(dialog.idPrefix, "T\">").concat(values
        .map(function (value) { return (value instanceof RegExp ? value.source : value); })
        .join('\n'), "</textarea>\n  "));
    var valueRadioButton = node.querySelector("#".concat(dialog.idPrefix, "VAL"));
    var startsWithRadioButton = node.querySelector("#".concat(dialog.idPrefix, "RW"));
    var regexRadioButton = node.querySelector("#".concat(dialog.idPrefix, "RE"));
    var text = node.querySelector("#".concat(dialog.idPrefix, "T"));
    var showOrHideTextarea = function (show) {
        text.style.display = show ? null : 'none';
    };
    showOrHideTextarea(type !== EStringGroupCriteriaType.value);
    valueRadioButton.onchange = function () { return showOrHideTextarea(!valueRadioButton.checked); };
    startsWithRadioButton.onchange = function () { return showOrHideTextarea(startsWithRadioButton.checked); };
    regexRadioButton.onchange = function () { return showOrHideTextarea(regexRadioButton.checked); };
    return {
        elems: [text, valueRadioButton, startsWithRadioButton, regexRadioButton],
        submit: function () {
            var checkedNode = node.querySelector("input[name=\"".concat(dialog.idPrefix, "groupString\"]:checked"));
            var newType = checkedNode.value;
            var items = text.value
                .trim()
                .split('\n')
                .map(function (d) { return d.trim(); })
                .filter(function (d) { return d.length > 0; });
            if (newType === EStringGroupCriteriaType.regex) {
                items = items.map(function (d) { return new RegExp(d.toString(), 'm'); });
            }
            col.setGroupCriteria({
                type: newType,
                values: items,
            });
            return true;
        },
        cancel: function () {
            col.setGroupCriteria(current);
        },
        reset: function () {
            text.value = '';
            startsWithRadioButton.checked = true;
        },
    };
}
//# sourceMappingURL=groupString.js.map