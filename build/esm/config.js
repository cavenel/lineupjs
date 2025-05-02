import { renderers } from './renderer/renderers';
import { toolbarDialogAddons, toolbarActions } from './ui/toolbar';
function resolveToolbarActions(col, keys, lookup) {
    const actions = [];
    keys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(lookup, key)) {
            actions.push(lookup[key]);
        }
        else {
            console.warn(`cannot find toolbar action of type: "${col.desc.type}" with key "${key}"`);
        }
    });
    return actions;
}
function resolveToolbarDialogAddons(col, keys, lookup) {
    const actions = [];
    keys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(lookup, key)) {
            actions.push(lookup[key]);
        }
        else {
            console.warn(`cannot find toolbar dialog addon of type: "${col.desc.type}" with key "${key}"`);
        }
    });
    return actions;
}
export function defaultOptions() {
    return {
        toolbarActions,
        toolbarDialogAddons,
        resolveToolbarActions,
        resolveToolbarDialogAddons,
        renderers: Object.assign({}, renderers),
        canRender: () => true,
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
        levelOfDetail: () => 'high',
        customRowUpdate: () => undefined,
        dynamicHeight: () => null,
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
