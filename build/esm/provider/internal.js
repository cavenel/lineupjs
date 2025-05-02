import { isGroup, EAggregationState, } from '../model';
export function isAlwaysShowingGroupStrategy(strategy) {
    return strategy === 'group+item' || strategy === 'group+item+top' || strategy === 'group+top+item';
}
export function hasTopNStrategy(strategy) {
    return strategy === 'group+item+top' || strategy === 'group+top+item';
}
export function convertAggregationState(state, topN) {
    if (typeof state === 'boolean') {
        return state ? 0 : -1;
    }
    if (state === EAggregationState.COLLAPSE) {
        return 0;
    }
    if (state === EAggregationState.EXPAND) {
        return -1;
    }
    if (state === EAggregationState.EXPAND_TOP_N) {
        return topN;
    }
    return state;
}
export function toItemMeta(relativeIndex, group, topN) {
    if (relativeIndex === 0) {
        return group.order.length === 1 ? 'first last' : 'first';
    }
    if (relativeIndex === group.order.length - 1 || (topN > 0 && relativeIndex === topN - 1)) {
        return 'last';
    }
    return null;
}
export function groupParents(group, meta) {
    const parents = [{ group, meta }];
    let prev = group;
    let prevMeta = meta;
    let parent = group.parent;
    while (parent) {
        if (parent.subGroups.length === 1 && prevMeta === 'first last') {
            meta = 'first last';
        }
        else if (parent.subGroups[0] === prev && (prevMeta === 'first last' || prevMeta === 'first')) {
            meta = 'first';
        }
        else if (parent.subGroups[parent.subGroups.length - 1] === prev &&
            (prevMeta === 'last' || prevMeta === 'first last')) {
            meta = 'last';
        }
        else {
            meta = null;
        }
        parents.unshift({ group: parent, meta });
        prev = parent;
        prevMeta = meta;
        parent = parent.parent;
    }
    return parents;
}
/**
 * number of group levels this items ends
 */
export function groupEndLevel(item, topNGetter) {
    const group = isGroup(item) ? item : item.group;
    const last = isGroup(item) ? 'first last' : toItemMeta(item.relativeIndex, item.group, topNGetter(group));
    if (last !== 'last' && last !== 'first last') {
        return 0;
    }
    let prev = group;
    let parent = group.parent;
    let i = 1;
    while (parent) {
        if (!(parent.subGroups.length === 1 || parent.subGroups[parent.subGroups.length - 1] === prev)) {
            // not last of group - end
            return i;
        }
        ++i;
        prev = parent;
        parent = parent.parent;
    }
    return i;
}
export function isSummaryGroup(group, strategy, topNGetter) {
    const topN = topNGetter(group);
    return isAlwaysShowingGroupStrategy(strategy) && topN !== 0;
}
export function toRowMeta(item, strategy, topNGetter) {
    if (isGroup(item)) {
        if (isSummaryGroup(item, strategy, topNGetter)) {
            return 'first';
        }
        const level = groupEndLevel(item, topNGetter);
        if (level === 0) {
            return 'first';
        }
        return `first last${level === 1 ? '' : level - 1}`;
    }
    const last = toItemMeta(item.relativeIndex, item.group, topNGetter(item.group));
    if (last == null) {
        return null;
    }
    const level = groupEndLevel(item, topNGetter);
    if (level === 0) {
        return null;
    }
    return `last${level === 1 ? '' : level - 1}`;
}
