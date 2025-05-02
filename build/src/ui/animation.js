import { defaultPhases, EAnimationMode, KeyFinder, } from 'lineupengine';
import { isGroup } from '../model';
function toGroupLookup(items) {
    var item2groupIndex = new Map();
    var group2firstItemIndex = new Map();
    items.forEach(function (item, i) {
        if (isGroup(item)) {
            for (var o = 0; o < item.order.length; ++o) {
                item2groupIndex.set(o, i);
            }
        }
        else if (item.group && item.relativeIndex === 0) {
            group2firstItemIndex.set(item.group.name, i);
        }
    });
    return { item2groupIndex: item2groupIndex, group2firstItemIndex: group2firstItemIndex };
}
function toKey(item) {
    if (isGroup(item)) {
        return item.name;
    }
    return item.dataIndex.toString();
}
/** @internal */
export function lineupAnimation(previous, previousData, currentData) {
    var previousKey = function (index) { return toKey(previousData[index]); };
    var currentKey = function (index) { return toKey(currentData[index]); };
    var previousGroupCount = previousData.reduce(function (acc, i) { return acc + (isGroup(i) ? 1 : 0); }, 0);
    var currentGroupCount = currentData.reduce(function (acc, i) { return acc + (isGroup(i) ? 1 : 0); }, 0);
    if (previousGroupCount === currentGroupCount) {
        // reorder or filter only
        return { currentKey: currentKey, previous: previous, previousKey: previousKey };
    }
    // try to appear where the group was uncollapsed and vice versa
    var prevHelper;
    var appearPosition = function (currentRowIndex, previousFinder, defaultValue) {
        if (!prevHelper) {
            prevHelper = toGroupLookup(previousData);
        }
        var item = currentData[currentRowIndex];
        var referenceIndex = isGroup(item)
            ? prevHelper.group2firstItemIndex.get(item.name)
            : prevHelper.item2groupIndex.get(item.dataIndex);
        if (referenceIndex === undefined) {
            return defaultValue;
        }
        var pos = previousFinder.posByKey(previousKey(referenceIndex));
        return pos.pos >= 0 ? pos.pos : defaultValue;
    };
    var currHelper;
    var removePosition = function (previousRowIndex, currentFinder, defaultValue) {
        if (!currHelper) {
            currHelper = toGroupLookup(currentData);
        }
        var item = previousData[previousRowIndex];
        var referenceIndex = isGroup(item)
            ? currHelper.group2firstItemIndex.get(item.name)
            : currHelper.item2groupIndex.get(item.dataIndex);
        if (referenceIndex === undefined) {
            return defaultValue;
        }
        var pos = currentFinder.posByKey(currentKey(referenceIndex));
        return pos.pos >= 0 ? pos.pos : defaultValue;
    };
    var phases = [
        Object.assign({}, defaultPhases[0], {
            apply: function (item, previousFinder) {
                defaultPhases[0].apply(item);
                if (item.mode === EAnimationMode.SHOW) {
                    item.node.style.transform = "translate(0, ".concat(appearPosition(item.current.index, previousFinder, item.previous.y) - item.nodeY, "px)");
                }
            },
        }),
        Object.assign({}, defaultPhases[1], {
            apply: function (item, _previousFinder, currentFinder) {
                defaultPhases[1].apply(item);
                if (item.mode === EAnimationMode.HIDE) {
                    item.node.style.transform = "translate(0, ".concat(removePosition(item.previous.index, currentFinder, item.current.y) - item.nodeY, "px)");
                }
            },
        }),
        defaultPhases[defaultPhases.length - 1],
    ];
    return { previous: previous, previousKey: previousKey, currentKey: currentKey, phases: phases };
}
//# sourceMappingURL=animation.js.map