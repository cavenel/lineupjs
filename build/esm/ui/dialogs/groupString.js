import { StringColumn, EStringGroupCriteriaType } from '../../model';
import { cssClass } from '../../styles';
/** @internal */
export default function groupString(col, node, dialog) {
    const current = col.getGroupCriteria();
    const { type, values } = current;
    node.insertAdjacentHTML('beforeend', `
    <label class="${cssClass('checkbox')}">
      <input type="radio" name="${dialog.idPrefix}groupString" value="${EStringGroupCriteriaType.value}" id="${dialog.idPrefix}VAL" ${type === EStringGroupCriteriaType.value ? 'checked' : ''}>
      <span>Use text value</span>
    </label>
    <label class="${cssClass('checkbox')}">
      <input type="radio" name="${dialog.idPrefix}groupString" value="${EStringGroupCriteriaType.startsWith}" id="${dialog.idPrefix}RW" ${type === EStringGroupCriteriaType.startsWith ? 'checked' : ''}>
      <span>Text starts with …</span>
    </label>
    <label class="${cssClass('checkbox')}">
      <input type="radio" name="${dialog.idPrefix}groupString" value="${EStringGroupCriteriaType.regex}" id="${dialog.idPrefix}RE" ${type === EStringGroupCriteriaType.regex ? 'checked' : ''}>
      <span>Use regular expressions</span>
    </label>
    <textarea rows="5" placeholder="one value per row, e.g., \nA\nB" id="${dialog.idPrefix}T">${values
        .map((value) => (value instanceof RegExp ? value.source : value))
        .join('\n')}</textarea>
  `);
    const valueRadioButton = node.querySelector(`#${dialog.idPrefix}VAL`);
    const startsWithRadioButton = node.querySelector(`#${dialog.idPrefix}RW`);
    const regexRadioButton = node.querySelector(`#${dialog.idPrefix}RE`);
    const text = node.querySelector(`#${dialog.idPrefix}T`);
    const showOrHideTextarea = (show) => {
        text.style.display = show ? null : 'none';
    };
    showOrHideTextarea(type !== EStringGroupCriteriaType.value);
    valueRadioButton.onchange = () => showOrHideTextarea(!valueRadioButton.checked);
    startsWithRadioButton.onchange = () => showOrHideTextarea(startsWithRadioButton.checked);
    regexRadioButton.onchange = () => showOrHideTextarea(regexRadioButton.checked);
    return {
        elems: [text, valueRadioButton, startsWithRadioButton, regexRadioButton],
        submit() {
            const checkedNode = node.querySelector(`input[name="${dialog.idPrefix}groupString"]:checked`);
            const newType = checkedNode.value;
            let items = text.value
                .trim()
                .split('\n')
                .map((d) => d.trim())
                .filter((d) => d.length > 0);
            if (newType === EStringGroupCriteriaType.regex) {
                items = items.map((d) => new RegExp(d.toString(), 'm'));
            }
            col.setGroupCriteria({
                type: newType,
                values: items,
            });
            return true;
        },
        cancel() {
            col.setGroupCriteria(current);
        },
        reset() {
            text.value = '';
            startsWithRadioButton.checked = true;
        },
    };
}
