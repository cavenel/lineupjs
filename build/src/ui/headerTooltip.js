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
    var clean = title.toLowerCase().replace(/[ +-]/gm, '-');
    return "".concat(cssClass('action'), " ").concat(cssClass("action-".concat(clean)));
}
export function addIconDOM(node, col, ctx, level, showLabel, mode) {
    return function (action) {
        var m = isActionMode(col, action, mode, 'shortcut')
            ? 'o'
            : isActionMode(col, action, mode, 'menu+shortcut')
                ? 's'
                : 'r';
        var title = ctx.sanitize(action.title);
        node.insertAdjacentHTML('beforeend', "<i data-a=\"".concat(m, "\" title=\"").concat(title, "\" class=\"").concat(actionCSSClass(title), " ").concat(cssClass("feature-".concat(ctx.sanitize(action.options.featureLevel || 'basic'))), " ").concat(cssClass("feature-".concat(ctx.sanitize(action.options.featureCategory || 'others'))), "\"><span").concat(!showLabel ? " class=\"".concat(cssClass('aria'), "\" aria-hidden=\"true\"") : '', ">").concat(title, "</span> </i>"));
        var i = node.lastElementChild;
        i.onclick = function (evt) {
            evt.stopPropagation();
            ctx.dialogManager.setHighlightColumn(col);
            // highlight node as active when the next dialog is opened
            ctx.dialogManager.on("dialogOpened.".concat(col.fqid), function () {
                ctx.dialogManager.on("dialogOpened.".concat(col.fqid), null);
                i.classList.add(cssClass('active'));
                // remove active state when dialog is closed
                ctx.dialogManager.on("dialogClosed.".concat(col.fqid), function () {
                    ctx.dialogManager.on("dialogClosed.".concat(col.fqid), null);
                    i.classList.remove(cssClass('active'));
                });
            });
            action.onClick(col, evt, ctx, level, !showLabel);
        };
        return i;
    };
}
export function isActionMode(col, d, mode, value) {
    var s = d.options.mode === undefined ? 'menu' : d.options.mode;
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
    var addIcon = addIconDOM(node, col, ctx, level, true, mode);
    getToolbar(col, ctx)
        .filter(function (d) { return !isActionMode(col, d, mode, 'shortcut'); })
        .forEach(addIcon);
}
/** @internal */
export function updateIconState(node, col) {
    var sort = node.getElementsByClassName(cssClass('action-sort'))[0];
    if (sort) {
        var _a = col.isSortedByMe(), asc = _a.asc, priority = _a.priority;
        sort.dataset.sort = asc !== undefined ? asc : '';
        sort.dataset.type = getSortType(col);
        if (priority !== undefined) {
            sort.dataset.priority = (priority + 1).toString();
        }
        else {
            delete sort.dataset.priority;
        }
    }
    var sortGroups = node.getElementsByClassName(cssClass('action-sort-groups'))[0];
    if (sortGroups) {
        var _b = col.isGroupSortedByMe(), asc = _b.asc, priority = _b.priority;
        sortGroups.dataset.sort = asc !== undefined ? asc : '';
        sortGroups.dataset.type = getSortType(col);
        if (priority !== undefined) {
            sortGroups.dataset.priority = (priority + 1).toString();
        }
        else {
            delete sortGroups.dataset.priority;
        }
    }
    var group = node.getElementsByClassName(cssClass('action-group'))[0];
    if (group) {
        var groupedBy = col.isGroupedBy();
        group.dataset.group = groupedBy >= 0 ? 'true' : 'false';
        if (groupedBy >= 0) {
            group.dataset.priority = (groupedBy + 1).toString();
        }
        else {
            delete group.dataset.priority;
        }
    }
    var filter = node.getElementsByClassName(cssClass('action-filter'))[0];
    if (filter) {
        if (col.isFiltered()) {
            filter.dataset.active = '';
        }
        else {
            delete filter.dataset.active;
        }
    }
    var mapping = node.getElementsByClassName(cssClass('action-data-mapping'))[0];
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
//# sourceMappingURL=headerTooltip.js.map