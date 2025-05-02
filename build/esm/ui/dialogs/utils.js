import { forEach } from '../../renderer/utils';
import { cssClass } from '../../styles';
import { getSortLabel } from '../../internal';
/** @internal */
export function sortMethods(node, column, methods) {
    const bak = column.getSortMethod();
    methods.forEach((d) => node.insertAdjacentHTML('beforeend', `<label class="${cssClass('checkbox')}"><input type="radio" name="multivaluesort" value="${d}"  ${bak === d ? 'checked' : ''} ><span>${getSortLabel(d)}</span></label>`));
    forEach(node, 'input[name=multivaluesort]', (n) => {
        n.addEventListener('change', () => column.setSortMethod(n.value), {
            passive: true,
        });
    });
    return {
        elems: 'input[name=multivaluesort]',
        submit() {
            const selected = node.querySelector('input[name=multivaluesort]:checked').value;
            column.setSortMethod(selected);
            return true;
        },
        cancel() {
            column.setSortMethod(bak);
        },
        reset() {
            node.querySelector(`input[name=multivaluesort][value="${bak}"]`).checked = true;
        },
    };
}
/** @internal */
export { uniqueId, forEach, forEachChild, colorOf } from '../../renderer/utils';
