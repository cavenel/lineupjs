var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Column, CompositeColumn, EAdvancedSortMethod, EDateSort, ESortMethod, isSortingAscByDefault, isSupportType, } from '../model';
import { cssClass } from '../styles';
import ADialog, { dialogContext } from './dialogs/ADialog';
import CategoricalColorMappingDialog from './dialogs/CategoricalColorMappingDialog';
import CategoricalFilterDialog from './dialogs/CategoricalFilterDialog';
import CategoricalMappingFilterDialog from './dialogs/CategoricalMappingFilterDialog';
import ChangeRendererDialog from './dialogs/ChangeRendererDialog';
import ColorMappingDialog from './dialogs/ColorMappingDialog';
import CompositeChildrenDialog from './dialogs/CompositeChildrenDialog';
import CutOffHierarchyDialog from './dialogs/CutOffHierarchyDialog';
import DateFilterDialog from './dialogs/DateFilterDialog';
import EditPatternDialog from './dialogs/EditPatternDialog';
import GroupDialog from './dialogs/GroupDialog';
import MappingDialog from './dialogs/MappingDialog';
import NumberFilterDialog from './dialogs/NumberFilterDialog';
import ReduceDialog from './dialogs/ReduceDialog';
import RenameDialog from './dialogs/RenameDialog';
import ScriptEditDialog from './dialogs/ScriptEditDialog';
import SearchDialog from './dialogs/SearchDialog';
import ShowTopNDialog from './dialogs/ShowTopNDialog';
import SortDialog from './dialogs/SortDialog';
import StringFilterDialog from './dialogs/StringFilterDialog';
import WeightsEditDialog from './dialogs/WeightsEditDialog';
import SelectionFilterDialog from './dialogs/SelectionFilterDialog';
import appendDate from './dialogs/groupDate';
import appendNumber from './dialogs/groupNumber';
import appendString from './dialogs/groupString';
import { sortMethods } from './dialogs/utils';
function ui(title, onClick, options) {
    if (options === void 0) { options = {}; }
    return { title: title, onClick: onClick, options: options };
}
function uiDialog(title, dialogClass, extraArgs, options) {
    if (extraArgs === void 0) { extraArgs = function () { return []; }; }
    if (options === void 0) { options = {}; }
    return {
        title: title,
        onClick: function (col, evt, ctx, level) {
            var dialog = new (dialogClass.bind.apply(dialogClass, __spreadArray([void 0, col, dialogContext(ctx, level, evt)], extraArgs(ctx), false)))();
            dialog.open();
        },
        options: options,
    };
}
var sort = {
    title: 'Sort', // basic ranking
    onClick: function (col, evt, ctx, level) {
        ctx.dialogManager.removeAboveLevel(level);
        if (!evt.ctrlKey) {
            col.toggleMySorting();
            return;
        }
        var ranking = col.findMyRanker();
        var current = ranking.getSortCriteria();
        var order = col.isSortedByMe();
        var isAscByDefault = isSortingAscByDefault(col);
        if (order.priority === undefined) {
            ranking.sortBy(col, isAscByDefault, current.length);
            return;
        }
        var next = undefined;
        if (isAscByDefault) {
            next = order.asc ? 'desc' : undefined;
        }
        else {
            next = !order.asc ? 'asc' : undefined;
        }
        ranking.sortBy(col, next === 'asc', next ? order.priority : -1);
    },
    options: {
        mode: 'shortcut',
        order: 1,
        featureCategory: 'ranking',
        featureLevel: 'basic',
    },
};
var sortBy = {
    title: 'Sort By …', // advanced ranking
    onClick: function (col, evt, ctx, level) {
        var dialog = new SortDialog(col, false, dialogContext(ctx, level, evt), ctx);
        dialog.open();
    },
    options: {
        mode: 'menu',
        order: 1,
        featureCategory: 'ranking',
        featureLevel: 'advanced',
    },
};
var sortGroupBy = {
    title: 'Sort Groups By …', // advanced ranking
    onClick: function (col, evt, ctx, level) {
        var dialog = new SortDialog(col, true, dialogContext(ctx, level, evt), ctx);
        dialog.open();
    },
    options: {
        mode: 'menu',
        order: 3,
        featureCategory: 'ranking',
        featureLevel: 'advanced',
    },
};
var rename = {
    title: 'Rename …', // advanced
    onClick: function (col, evt, ctx, level) {
        var dialog = new RenameDialog(col, dialogContext(ctx, level, evt));
        dialog.open();
    },
    options: {
        order: 5,
        featureCategory: 'ui',
        featureLevel: 'advanced',
    },
};
var vis = {
    title: 'Visualization …', // advanced view
    onClick: function (col, evt, ctx, level) {
        var dialog = new ChangeRendererDialog(col, dialogContext(ctx, level, evt), ctx);
        dialog.open();
    },
    options: {
        featureCategory: 'ui',
        featureLevel: 'advanced',
    },
};
var clone = {
    title: 'Clone', // advanced model
    onClick: function (col, _evt, ctx) {
        ctx.dialogManager.removeAll(); // since the column will be removed
        ctx.provider.takeSnapshot(col);
    },
    options: {
        order: 80,
        featureCategory: 'model',
        featureLevel: 'advanced',
    },
};
var remove = {
    title: 'Remove', // advanced model
    onClick: function (col, _evt, ctx) {
        ctx.dialogManager.removeAll(); // since the column will be removed
        var ranking = col.findMyRanker();
        var last = ranking.children.every(function (d) { return isSupportType(d) || d.fixed || d === col; });
        if (!last) {
            col.removeMe();
            return;
        }
        ctx.provider.removeRanking(ranking);
        ctx.provider.ensureOneRanking();
    },
    options: {
        order: 90,
        featureCategory: 'model',
        featureLevel: 'advanced',
    },
};
// basic ranking
var group = ui('Group', function (col, evt, ctx, level) {
    ctx.dialogManager.removeAboveLevel(level);
    if (!evt.ctrlKey) {
        col.groupByMe();
        return;
    }
    var ranking = col.findMyRanker();
    var current = ranking.getGroupCriteria();
    var order = current.indexOf(col);
    ranking.groupBy(col, order >= 0 ? -1 : current.length);
}, { mode: 'shortcut', order: 2, featureCategory: 'ranking', featureLevel: 'basic' });
// advanced ranking
var groupBy = ui('Group By …', function (col, evt, ctx, level) {
    var dialog = new GroupDialog(col, dialogContext(ctx, level, evt), ctx);
    dialog.open();
}, { mode: 'menu', order: 2, featureCategory: 'ranking', featureLevel: 'advanced' });
function toggleCompressExpand(col, evt, ctx, level) {
    ctx.dialogManager.removeAboveLevel(level);
    var mcol = col;
    mcol.setCollapsed(!mcol.getCollapsed());
    var collapsed = mcol.getCollapsed();
    var i = evt.currentTarget;
    i.title = collapsed ? 'Expand' : 'Compress';
    i.classList.toggle(cssClass('action-compress'), !collapsed);
    i.classList.toggle(cssClass('action-expand'), collapsed);
    var inner = i.getElementsByTagName('span')[0];
    if (inner) {
        inner.textContent = i.title;
    }
}
var compress = {
    title: 'Compress',
    enabled: function (col) { return !col.getCollapsed(); },
    onClick: toggleCompressExpand,
    options: { featureCategory: 'model', featureLevel: 'advanced' },
};
var expand = {
    title: 'Expand',
    enabled: function (col) { return col.getCollapsed(); },
    onClick: toggleCompressExpand,
    options: { featureCategory: 'model', featureLevel: 'advanced' },
};
var setShowTopN = {
    title: 'Change Show Top N',
    onClick: function (_col, evt, ctx, level) {
        var dialog = new ShowTopNDialog(ctx.provider, dialogContext(ctx, level, evt));
        dialog.open();
    },
    options: {
        featureCategory: 'ui',
        featureLevel: 'advanced',
    },
};
export var toolbarActions = {
    vis: vis,
    group: group,
    groupBy: groupBy,
    compress: compress,
    expand: expand,
    sort: sort,
    sortBy: sortBy,
    sortGroupBy: sortGroupBy,
    clone: clone,
    remove: remove,
    rename: rename,
    setShowTopN: setShowTopN,
    search: uiDialog('Search …', SearchDialog, function (ctx) { return [ctx.provider]; }, {
        mode: 'menu+shortcut',
        order: 4,
        featureCategory: 'ranking',
        featureLevel: 'basic',
    }),
    filterNumber: uiDialog('Filter …', NumberFilterDialog, function (ctx) { return [ctx]; }, {
        order: 8,
        mode: 'menu+shortcut',
        featureCategory: 'ranking',
        featureLevel: 'basic',
    }),
    filterDate: uiDialog('Filter …', DateFilterDialog, function (ctx) { return [ctx]; }, {
        order: 8,
        mode: 'menu+shortcut',
        featureCategory: 'ranking',
        featureLevel: 'basic',
    }),
    filterString: uiDialog('Filter …', StringFilterDialog, function (ctx) { return [ctx]; }, {
        order: 8,
        mode: 'menu+shortcut',
        featureCategory: 'ranking',
        featureLevel: 'basic',
    }),
    filterSelection: uiDialog('Filter …', SelectionFilterDialog, function (ctx) { return [ctx]; }, {
        order: 8,
        mode: 'menu+shortcut',
        featureCategory: 'ranking',
        featureLevel: 'basic',
    }),
    filterCategorical: uiDialog('Filter …', CategoricalFilterDialog, function (ctx) { return [ctx]; }, {
        order: 8,
        mode: 'menu+shortcut',
        featureCategory: 'ranking',
        featureLevel: 'basic',
    }),
    filterOrdinal: uiDialog('Filter …', CategoricalMappingFilterDialog, function () { return []; }, {
        order: 8,
        mode: 'menu+shortcut',
        featureCategory: 'ranking',
        featureLevel: 'basic',
    }),
    colorMapped: uiDialog('Color Mapping …', ColorMappingDialog, function (ctx) { return [ctx]; }, {
        mode: 'menu',
        featureCategory: 'ui',
        featureLevel: 'advanced',
    }),
    colorMappedCategorical: uiDialog('Color Mapping …', CategoricalColorMappingDialog, function () { return []; }, {
        mode: 'menu',
        featureCategory: 'ui',
        featureLevel: 'advanced',
    }),
    script: uiDialog('Edit Combine Script …', ScriptEditDialog, function () { return []; }, {
        mode: 'menu+shortcut',
        featureCategory: 'model',
        featureLevel: 'advanced',
    }),
    reduce: uiDialog('Reduce by …', ReduceDialog, function () { return []; }, {
        featureCategory: 'model',
        featureLevel: 'advanced',
    }),
    cutoff: uiDialog('Set Cut Off …', CutOffHierarchyDialog, function (ctx) { return [ctx]; }, {
        featureCategory: 'model',
        featureLevel: 'advanced',
    }),
    editMapping: uiDialog('Data Mapping …', MappingDialog, function (ctx) { return [ctx]; }, {
        mode: 'menu+shortcut',
        featureCategory: 'model',
        featureLevel: 'advanced',
    }),
    editPattern: uiDialog('Edit Pattern …', EditPatternDialog, function (ctx) { return [ctx]; }, {
        featureCategory: 'model',
        featureLevel: 'advanced',
    }),
    editWeights: uiDialog('Edit Weights …', WeightsEditDialog, function () { return []; }, {
        mode: 'menu+shortcut',
        featureCategory: 'model',
        featureLevel: 'advanced',
    }),
    compositeContained: uiDialog('Contained Columns …', CompositeChildrenDialog, function (ctx) { return [ctx]; }, {
        featureCategory: 'model',
        featureLevel: 'advanced',
    }),
    splitCombined: ui('Split Combined Column', function (col, _evt, ctx, level) {
        ctx.dialogManager.removeAboveLevel(level - 1); // close itself
        // split the combined column into its children
        col.children.reverse().forEach(function (c) { return col.insertAfterMe(c); });
        col.removeMe();
    }, { featureCategory: 'model', featureLevel: 'advanced' }),
    clearSelection: ui('Clear Selection', function (_col, _evt, ctx, level) {
        ctx.dialogManager.removeAboveLevel(level - 1); // close itself
        var s = ctx.provider.getSelection();
        if (s.length > 0) {
            ctx.provider.setSelection([]);
        }
    }, { featureCategory: 'model', featureLevel: 'advanced', order: 11 }),
    invertSelection: ui('Invert Selection', function (col, _evt, ctx, level) {
        ctx.dialogManager.removeAboveLevel(level - 1); // close itself
        var s = ctx.provider.getSelection();
        var order = Array.from(col.findMyRanker().getOrder());
        if (s.length === 0) {
            ctx.provider.setSelection(order);
            return;
        }
        var ss = new Set(s);
        var others = order.filter(function (d) { return !ss.has(d); });
        ctx.provider.setSelection(others);
    }, { featureCategory: 'model', featureLevel: 'advanced', order: 10 }),
};
function uiSortMethod(methods) {
    methods = methods.sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
    return {
        title: 'Sort By',
        order: 2,
        append: function (col, node) {
            return sortMethods(node, col, methods);
        },
    };
}
export var toolbarDialogAddons = {
    sortNumber: uiSortMethod(Object.keys(EAdvancedSortMethod)),
    sortNumbers: uiSortMethod(Object.keys(EAdvancedSortMethod)),
    sortBoxPlot: uiSortMethod(Object.keys(ESortMethod)),
    sortDates: uiSortMethod(Object.keys(EDateSort)),
    sortGroups: uiSortMethod(['count', 'name']),
    groupNumber: {
        title: 'Split',
        order: 2,
        append: appendNumber,
    },
    groupString: {
        title: 'Groups',
        order: 2,
        append: appendString,
    },
    groupDate: {
        title: 'Granularity',
        order: 2,
        append: appendDate,
    },
};
//# sourceMappingURL=toolbar.js.map