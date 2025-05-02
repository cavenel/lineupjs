import { renderers } from './renderer/renderers';
import { toolbarDialogAddons, toolbarActions } from './ui/toolbar';
function resolveToolbarActions(col, keys, lookup) {
    var actions = [];
    keys.forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(lookup, key)) {
            actions.push(lookup[key]);
        }
        else {
            console.warn("cannot find toolbar action of type: \"".concat(col.desc.type, "\" with key \"").concat(key, "\""));
        }
    });
    return actions;
}
function resolveToolbarDialogAddons(col, keys, lookup) {
    var actions = [];
    keys.forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(lookup, key)) {
            actions.push(lookup[key]);
        }
        else {
            console.warn("cannot find toolbar dialog addon of type: \"".concat(col.desc.type, "\" with key \"").concat(key, "\""));
        }
    });
    return actions;
}
export function defaultOptions() {
    return {
        toolbarActions: toolbarActions,
        toolbarDialogAddons: toolbarDialogAddons,
        resolveToolbarActions: resolveToolbarActions,
        resolveToolbarDialogAddons: resolveToolbarDialogAddons,
        renderers: Object.assign({}, renderers),
        canRender: function () { return true; },
        labelRotation: 0,
        summaryHeader: true,
        animated: true,
        expandLineOnHover: false,
        sidePanel: true,
        sidePanelCollapsed: false,
        hierarchyIndicator: true,
        defaultSlopeGraphMode: 'item',
        overviewMode: false,
        livePreviews: {
            search: true,
            filter: true,
            vis: true,
            sort: true,
            group: true,
            groupSort: true,
            colorMapping: true,
        },
        onDialogBackgroundClick: 'confirm',
        selectionActivateFilter: true,
        rowHeight: 18,
        groupHeight: 40,
        groupPadding: 5,
        rowPadding: 2,
        levelOfDetail: function () { return 'high'; },
        customRowUpdate: function () { return undefined; },
        dynamicHeight: function () { return null; },
        flags: {
            disableFrozenColumns: true, //disable by default for speed navigator.userAgent.includes('Firefox/52') // disable by default in Firefox ESR 52
            advancedRankingFeatures: true,
            advancedModelFeatures: true,
            advancedUIFeatures: true,
            combineViaDragNDrop: true,
        },
        ignoreUnsupportedBrowser: false,
        copyableRows: true,
        instanceId: Math.random().toString(36).slice(-8).substring(0, 3), // generate a random string with length 3
    };
}
//# sourceMappingURL=config.js.map