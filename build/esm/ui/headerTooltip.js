import Column, { getSortType, isMapAbleColumn } from '../model';
import { cssClass } from '../styles';
import { getToolbar } from './toolbarResolvers';
/** @internal */
export function actionCSSClass(title) {
    if (title.endsWith('…')) {
        title = title.slice(0, -2);
    }
    if (title.endsWith('&hellip;')) {
        title = title.slice(0, -'&hellip;'.length - 1);
    }
    if (title.endsWith('By')) {
        title = title.slice(0, -3);
    }
    const clean = title.toLowerCase().replace(/[ +-]/gm, '-');
    return `${cssClass('action')} ${cssClass(`action-${clean}`)}`;
}
export function addIconDOM(node, col, ctx, level, showLabel, mode) {
    return (action) => {
        const m = isActionMode(col, action, mode, 'shortcut')
            ? 'o'
            : isActionMode(col, action, mode, 'menu+shortcut')
                ? 's'
                : 'r';
        const title = ctx.sanitize(action.title);
        node.insertAdjacentHTML('beforeend', `<i data-a="${m}" title="${title}" class="${actionCSSClass(title)} ${cssClass(`feature-${ctx.sanitize(action.options.featureLevel || 'basic')}`)} ${cssClass(`feature-${ctx.sanitize(action.options.featureCategory || 'others')}`)}"><span${!showLabel ? ` class="${cssClass('aria')}" aria-hidden="true"` : ''}>${title}</span> </i>`);
        const i = node.lastElementChild;
        i.onclick = (evt) => {
            evt.stopPropagation();
            ctx.dialogManager.setHighlightColumn(col);
            // highlight node as active when the next dialog is opened
            ctx.dialogManager.on(`dialogOpened.${col.fqid}`, () => {
                ctx.dialogManager.on(`dialogOpened.${col.fqid}`, null);
                i.classList.add(cssClass('active'));
                // remove active state when dialog is closed
                ctx.dialogManager.on(`dialogClosed.${col.fqid}`, () => {
                    ctx.dialogManager.on(`dialogClosed.${col.fqid}`, null);
                    i.classList.remove(cssClass('active'));
                });
            });
            action.onClick(col, evt, ctx, level, !showLabel);
        };
        return i;
    };
}
export function isActionMode(col, d, mode, value) {
    const s = d.options.mode === undefined ? 'menu' : d.options.mode;
    if (s === value) {
        return true;
    }
    if (typeof s === 'function') {
        return s(col, mode) === value;
    }
    return false;
}
/** @internal */
export function createToolbarMenuItems(node, level, col, ctx, mode) {
    const addIcon = addIconDOM(node, col, ctx, level, true, mode);
    getToolbar(col, ctx)
        .filter((d) => !isActionMode(col, d, mode, 'shortcut'))
        .forEach(addIcon);
}
/** @internal */
export function updateIconState(node, col) {
    const sort = node.getElementsByClassName(cssClass('action-sort'))[0];
    if (sort) {
        const { asc, priority } = col.isSortedByMe();
        sort.dataset.sort = asc !== undefined ? asc : '';
        sort.dataset.type = getSortType(col);
        if (priority !== undefined) {
            sort.dataset.priority = (priority + 1).toString();
        }
        else {
            delete sort.dataset.priority;
        }
    }
    const sortGroups = node.getElementsByClassName(cssClass('action-sort-groups'))[0];
    if (sortGroups) {
        const { asc, priority } = col.isGroupSortedByMe();
        sortGroups.dataset.sort = asc !== undefined ? asc : '';
        sortGroups.dataset.type = getSortType(col);
        if (priority !== undefined) {
            sortGroups.dataset.priority = (priority + 1).toString();
        }
        else {
            delete sortGroups.dataset.priority;
        }
    }
    const group = node.getElementsByClassName(cssClass('action-group'))[0];
    if (group) {
        const groupedBy = col.isGroupedBy();
        group.dataset.group = groupedBy >= 0 ? 'true' : 'false';
        if (groupedBy >= 0) {
            group.dataset.priority = (groupedBy + 1).toString();
        }
        else {
            delete group.dataset.priority;
        }
    }
    const filter = node.getElementsByClassName(cssClass('action-filter'))[0];
    if (filter) {
        if (col.isFiltered()) {
            filter.dataset.active = '';
        }
        else {
            delete filter.dataset.active;
        }
    }
    const mapping = node.getElementsByClassName(cssClass('action-data-mapping'))[0];
    if (!mapping || !isMapAbleColumn(col)) {
        return;
    }
    if (!col.getMapping().eq(col.getOriginalMapping())) {
        mapping.dataset.active = '';
    }
    else {
        delete mapping.dataset.active;
    }
}
