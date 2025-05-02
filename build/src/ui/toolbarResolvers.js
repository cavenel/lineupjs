import { getAllToolbarActions, getAllToolbarDialogAddons } from '../model/internal';
function sortActions(a, b) {
    if (a.options.order === b.options.order) {
        return a.title.toString().localeCompare(b.title.toString());
    }
    return (a.options.order || 50) - (b.options.order || 50);
}
function getFullToolbar(col, ctx) {
    var cache = ctx.caches.toolbar;
    if (cache.has(col.desc.type)) {
        return cache.get(col.desc.type);
    }
    var keys = getAllToolbarActions(col);
    if (!col.fixed) {
        keys.push('remove');
    }
    {
        var possible = ctx.getPossibleRenderer(col);
        if (possible.item.length > 2 || possible.group.length > 2 || possible.summary.length > 2) {
            // default always possible
            keys.push('vis');
        }
    }
    var actions = ctx.resolveToolbarActions(col, keys);
    var r = Array.from(new Set(actions)).sort(sortActions);
    cache.set(col.desc.type, r);
    return r;
}
/** @internal */
export function getToolbar(col, ctx) {
    var toolbar = getFullToolbar(col, ctx);
    var flags = ctx.flags;
    return toolbar.filter(function (a) {
        if (a.enabled && !a.enabled(col)) {
            return false;
        }
        // level is basic or not one of disabled features
        return (a.options.featureLevel === 'basic' ||
            !((flags.advancedModelFeatures === false && a.options.featureCategory === 'model') ||
                (flags.advancedRankingFeatures === false && a.options.featureCategory === 'ranking') ||
                (flags.advancedUIFeatures === false && a.options.featureCategory === 'ui')));
    });
}
/** @internal */
export function isSortAble(col, ctx) {
    var toolbar = getFullToolbar(col, ctx);
    return toolbar.find(function (d) { return d.title === 'Sort' || d.title.startsWith('Sort By'); }) != null;
}
/** @internal */
export function isGroupAble(col, ctx) {
    var toolbar = getFullToolbar(col, ctx);
    return toolbar.find(function (d) { return d.title === 'Group' || d.title.startsWith('Group By'); }) != null;
}
/** @internal */
export function isGroupSortAble(col, ctx) {
    var toolbar = getFullToolbar(col, ctx);
    return toolbar.find(function (d) { return d.title.startsWith('Sort Groups By'); }) != null;
}
/** @internal */
export function getToolbarDialogAddons(col, key, ctx) {
    var cacheKey = "".concat(col.desc.type, "@").concat(key);
    var cacheAddon = ctx.caches.toolbarAddons;
    if (cacheAddon.has(cacheKey)) {
        return cacheAddon.get(cacheKey);
    }
    var keys = getAllToolbarDialogAddons(col, key);
    var actions = ctx.resolveToolbarDialogAddons(col, keys);
    var r = Array.from(new Set(actions)).sort(function (a, b) {
        if (a.order === b.order) {
            return a.title.localeCompare(b.title);
        }
        return (a.order || 50) - (b.order || 50);
    });
    cacheAddon.set(cacheKey, r);
    return r;
}
//# sourceMappingURL=toolbarResolvers.js.map