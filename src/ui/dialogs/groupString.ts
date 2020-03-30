import {IDialogContext} from './ADialog';
import {StringColumn, EStringGroupCriteriaType} from '../../model';
import {cssClass} from '../../styles';
import {IToolbarDialogAddonHandler} from '../interfaces';

/** @internal */
export default function groupString(col: StringColumn, node: HTMLElement, dialog: IDialogContext): IToolbarDialogAddonHandler {
  const current = col.getGroupCriteria();
  const {type, values} = current;

  node.insertAdjacentHTML('beforeend', `
    <label class="${cssClass('checkbox')}">
      <input type="radio" name="${dialog.idPrefix}groupString" value="${EStringGroupCriteriaType.value}" id="${dialog.idPrefix}VAL" ${type === EStringGroupCriteriaType.value ? 'checked' : ''}>
      <span>Use text value</span>
    </label>
    <label class="${cssClass('checkbox')}">
      <input type="radio" name="${dialog.idPrefix}groupString" value="${EStringGroupCriteriaType.startsWith}" id="${dialog.idPrefix}RW" ${type === EStringGroupCriteriaType.startsWith ? 'checked' : ''}>
      <span>Text starts with &hellip;</span>
    </label>
    <label class="${cssClass('checkbox')}">
      <input type="radio" name="${dialog.idPrefix}groupString" value="${EStringGroupCriteriaType.regex}" id="${dialog.idPrefix}RE" ${type === EStringGroupCriteriaType.regex ? 'checked' : ''}>
      <span>Use regular expressions</span>
    </label>
    <textarea required rows="5" placeholder="e.g. Test,a.*" id="${dialog.idPrefix}T">${values.map((value) => value instanceof RegExp ? value.source : value).join('\n')}</textarea>
  `);

  const valueRadioButton = node.querySelector<HTMLInputElement>(`#${dialog.idPrefix}VAL`)!;
  const startsWithRadioButton = node.querySelector<HTMLInputElement>(`#${dialog.idPrefix}RW`)!;
  const regexRadioButton = node.querySelector<HTMLInputElement>(`#${dialog.idPrefix}RE`)!;
  const text = node.querySelector<HTMLTextAreaElement>(`#${dialog.idPrefix}T`)!;

  const showOrHideTextarea = (show: boolean) => {
    text.style.display = show ? null : 'none';
  };

  showOrHideTextarea(type !== EStringGroupCriteriaType.value);
  valueRadioButton.onchange = () => showOrHideTextarea(!valueRadioButton.checked);
  startsWithRadioButton.onchange = () => showOrHideTextarea(startsWithRadioButton.checked);
  regexRadioButton.onchange = () => showOrHideTextarea(regexRadioButton.checked);

  text.addEventListener('change', () => {
    const items: (string | RegExp)[] = text.value.trim().split('\n').map((d) => d.trim()).filter((d) => d.length > 0);
    text.setCustomValidity(!valueRadioButton.checked && items.length === 0 ? 'At least one entry is required' : '');
  });

  return {
    elems: [text, valueRadioButton, startsWithRadioButton, regexRadioButton],
    submit() {
      const checkedNode = node.querySelector<HTMLInputElement>(`input[name="${dialog.idPrefix}groupString"]:checked`)!;
      const newType = <EStringGroupCriteriaType>checkedNode.value;
      let items: (string | RegExp)[] = text.value.trim().split('\n').map((d) => d.trim()).filter((d) => d.length > 0);

      if (newType !== EStringGroupCriteriaType.value) {
        const invalid = items.length === 0;
        text.setCustomValidity(invalid ? 'At least one entry is required' : '');
        if (invalid) {
          (<any>text).reportValidity(); // typedoc not uptodate
          return false;
        }
      }
      if (newType === EStringGroupCriteriaType.regex) {
        items = items.map((d) => new RegExp(d.toString(), 'gm'));
      }
      col.setGroupCriteria({
        type: newType,
        values: items
      });
      return true;
    },
    cancel() {
      col.setGroupCriteria(current);
    },
    reset() {
      text.value = '';
      startsWithRadioButton.checked = true;
    }
  };
}
