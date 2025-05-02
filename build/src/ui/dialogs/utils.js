import { forEach } from '../../renderer/utils';
import { cssClass } from '../../styles';
import { getSortLabel } from '../../internal';
/** @internal */
export function sortMethods(node, column, methods) {
    var bak = column.getSortMethod();
    methods.forEach(function (d) {
        return node.insertAdjacentHTML('beforeend', "<label class=\"".concat(cssClass('checkbox'), "\"><input type=\"radio\" name=\"multivaluesort\" value=\"").concat(d, "\"  ").concat(bak === d ? 'checked' : '', " ><span>").concat(getSortLabel(d), "</span></label>"));
    });
    forEach(node, 'input[name=multivaluesort]', function (n) {
        n.addEventListener('change', function () { return column.setSortMethod(n.value); }, {
            passive: true,
        });
    });
    return {
        elems: 'input[name=multivaluesort]',
        submit: function () {
            var selected = node.querySelector('input[name=multivaluesort]:checked').value;
            column.setSortMethod(selected);
            return true;
        },
        cancel: function () {
            column.setSortMethod(bak);
        },
        reset: function () {
            node.querySelector("input[name=multivaluesort][value=\"".concat(bak, "\"]")).checked = true;
        },
    };
}
/** @internal */
export { uniqueId, forEach, forEachChild, colorOf } from '../../renderer/utils';
//# sourceMappingURL=utils.js.map