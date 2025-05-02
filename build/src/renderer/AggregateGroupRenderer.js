import { Column, AggregateGroupColumn, EAggregationState, defaultGroup, } from '../model';
import { AGGREGATE, CANVAS_HEIGHT, cssClass } from '../styles';
import { groupParents, toItemMeta, isAlwaysShowingGroupStrategy, hasTopNStrategy, isSummaryGroup, } from '../provider/internal';
import { clear } from '../internal';
function preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
}
function matchNodes(node, length, clazz, addTopN) {
    if (clazz === void 0) { clazz = 'agg-level'; }
    if (addTopN === void 0) { addTopN = false; }
    var doc = node.ownerDocument;
    var children = Array.from(node.children);
    if (addTopN) {
        // top N buttons
        length = length + 1;
    }
    // add missing
    for (var i = children.length; i < length; ++i) {
        var child = doc.createElement('div');
        child.classList.add(cssClass(clazz));
        children.push(child);
        node.appendChild(child);
    }
    // remove too many
    for (var _i = 0, _a = children.splice(length, children.length - length); _i < _a.length; _i++) {
        var r = _a[_i];
        r.remove();
    }
    if (addTopN) {
        var last = children[children.length - 1];
        last.classList.remove(cssClass(clazz));
        last.classList.add(cssClass('agg-all'));
    }
    return children;
}
function renderGroups(node, group, relativeIndex, col, provider) {
    var strategy = provider.getAggregationStrategy();
    var ranking = col.findMyRanker();
    var topNGetter = function (group) { return provider.getTopNAggregated(ranking, group); };
    var isRow = relativeIndex >= 0;
    var isLeafGroup = !group.subGroups || group.subGroups.length === 0;
    var alwaysShowGroup = isAlwaysShowingGroupStrategy(strategy);
    var isSummary = !isRow && isSummaryGroup(group, strategy, topNGetter);
    var hasTopN = isSummary && isLeafGroup && hasTopNStrategy(strategy);
    var parents = groupParents(group, relativeIndex >= 0 ? toItemMeta(relativeIndex, group, provider.getTopNAggregated(ranking, group)) : 'first last');
    var children = matchNodes(node, parents.length, 'agg-level', hasTopN);
    var lastParent = parents.length - 1;
    var _loop_1 = function (i) {
        var parent_1 = parents[i];
        var child = children[i];
        var state = provider.getAggregationState(ranking, parent_1.group);
        var isLastGroup = i === lastParent;
        child.dataset.level = String(parents.length - 1 - i); // count backwards
        if (alwaysShowGroup && (isRow || i < lastParent)) {
            // inner or last
            if (!isSummary && (parent_1.meta === 'last' || parent_1.meta === 'first last')) {
                child.dataset.meta = 'last';
            }
            else {
                delete child.dataset.meta;
            }
            child.classList.toggle(cssClass('agg-inner'), isRow && isLastGroup);
            child.classList.remove(cssClass('agg-expand'), cssClass('agg-collapse'));
            child.title = '';
            delete child.onclick;
            return "continue";
        }
        var isCollapsed = state === EAggregationState.COLLAPSE;
        var isFirst = parent_1.meta === 'first' || parent_1.meta === 'first last';
        var isShowAll = state === EAggregationState.EXPAND;
        var childTopN = hasTopN && isLastGroup ? children[parents.length] : null;
        var meta = parent_1.meta;
        if (isSummary && parent_1.meta === 'first last') {
            meta = 'first';
        }
        if (meta) {
            child.dataset.meta = meta;
        }
        else {
            delete child.dataset.meta;
        }
        child.classList.toggle(cssClass('agg-expand'), isFirst);
        child.classList.toggle(cssClass('agg-collapse'), isCollapsed);
        child.title = isFirst ? (isCollapsed ? 'Expand Group' : 'Collapse Group') : '';
        if (!isFirst) {
            delete child.onclick;
        }
        else {
            child.onclick = function (evt) {
                preventDefault(evt);
                var nextState;
                switch (strategy) {
                    case 'group+top+item':
                        nextState =
                            state === EAggregationState.COLLAPSE ? EAggregationState.EXPAND_TOP_N : EAggregationState.COLLAPSE;
                        break;
                    case 'group':
                    case 'item':
                    case 'group+item':
                    case 'group+item+top':
                    default:
                        nextState = state === EAggregationState.COLLAPSE ? EAggregationState.EXPAND : EAggregationState.COLLAPSE;
                        break;
                }
                col.setAggregated(parent_1.group, nextState);
            };
        }
        if (!childTopN) {
            return "continue";
        }
        childTopN.dataset.level = String(i); // count upwards
        childTopN.classList.toggle(cssClass('agg-compress'), isShowAll);
        childTopN.title = isShowAll ? "Show Top ".concat(provider.getShowTopN(), " Only") : 'Show All';
        childTopN.onclick = function (evt) {
            preventDefault(evt);
            col.setAggregated(parent_1.group, state === EAggregationState.EXPAND ? EAggregationState.EXPAND_TOP_N : EAggregationState.EXPAND);
        };
    };
    for (var i = 0; i < parents.length; ++i) {
        _loop_1(i);
    }
}
function isDummyGroup(group) {
    return group.parent == null && group.name === defaultGroup.name;
}
var AggregateGroupRenderer = /** @class */ (function () {
    function AggregateGroupRenderer() {
        this.title = 'Default';
    }
    AggregateGroupRenderer.prototype.canRender = function (col) {
        return col instanceof AggregateGroupColumn;
    };
    AggregateGroupRenderer.prototype.create = function (col, context) {
        return {
            template: "<div></div>",
            update: function (node, _row, i, group) {
                if (isDummyGroup(group)) {
                    clear(node);
                    return;
                }
                renderGroups(node, group, i, col, context.provider);
            },
            render: function (ctx, _row, i, group) {
                if (isDummyGroup(group)) {
                    return undefined;
                }
                var parents = groupParents(group, toItemMeta(i, group, context.provider.getTopNAggregated(col.findMyRanker(), group)));
                ctx.fillStyle = AGGREGATE.color;
                for (var i_1 = 0; i_1 < parents.length; ++i_1) {
                    ctx.fillRect(AGGREGATE.levelWidth * i_1 + AGGREGATE.levelOffset, 0, AGGREGATE.strokeWidth, CANVAS_HEIGHT);
                }
                return parents.some(function (d) { return d.meta != null; });
            },
        };
    };
    AggregateGroupRenderer.prototype.createGroup = function (col, context) {
        return {
            template: "<div><div class=\"".concat(cssClass('agg-level'), "\"></div></div>"),
            update: function (node, group) {
                renderGroups(node, group, -1, col, context.provider);
            },
        };
    };
    AggregateGroupRenderer.prototype.createSummary = function (col, context) {
        return {
            template: "<div></div>",
            update: function (node) {
                var ranking = col.findMyRanker();
                var groups = ranking.getGroups();
                if (groups.length === 1 && groups[0].name === defaultGroup.name) {
                    clear(node);
                    return;
                }
                var gparents = groups.map(function (group) { return groupParents(group, 'first last'); });
                var max = gparents.reduce(function (a, b) { return Math.max(a, b.length); }, Number.NEGATIVE_INFINITY);
                var children = matchNodes(node, max, 'agg-expand');
                var _loop_2 = function (i) {
                    var child = children[i];
                    var subGroups = gparents.map(function (d) { return (d[i] ? d[i].group : null); }).filter(function (d) { return d != null; });
                    var isCollapsed = subGroups.every(function (d) { return context.provider.getAggregationState(ranking, d) === EAggregationState.COLLAPSE; });
                    child.classList.toggle(cssClass('agg-collapse'), isCollapsed);
                    child.title = isCollapsed ? 'Expand All Groups' : 'Collapse All Groups';
                    child.onclick = function (evt) {
                        preventDefault(evt);
                        context.provider.aggregateAllOf(ranking, isCollapsed ? EAggregationState.EXPAND : EAggregationState.COLLAPSE, subGroups);
                    };
                };
                for (var i = 0; i < max; ++i) {
                    _loop_2(i);
                }
            },
        };
    };
    return AggregateGroupRenderer;
}());
export default AggregateGroupRenderer;
//# sourceMappingURL=AggregateGroupRenderer.js.map