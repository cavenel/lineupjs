import { defaultPhases, EAnimationMode, KeyFinder, } from 'lineupengine';
import { isGroup } from '../model';
function toGroupLookup(items) {
    const item2groupIndex = new Map();
    const group2firstItemIndex = new Map();
    items.forEach((item, i) => {
        if (isGroup(item)) {
            for (let o = 0; o < item.order.length; ++o) {
                item2groupIndex.set(o, i);
            }
        }
        else if (item.group && item.relativeIndex === 0) {
            group2firstItemIndex.set(item.group.name, i);
        }
    });
    return { item2groupIndex, group2firstItemIndex };
}
function toKey(item) {
    if (isGroup(item)) {
        return item.name;
    }
    return item.dataIndex.toString();
}
/** @internal */
export function lineupAnimation(previous, previousData, currentData) {
    const previousKey = (index) => toKey(previousData[index]);
    const currentKey = (index) => toKey(currentData[index]);
    const previousGroupCount = previousData.reduce((acc, i) => acc + (isGroup(i) ? 1 : 0), 0);
    const currentGroupCount = currentData.reduce((acc, i) => acc + (isGroup(i) ? 1 : 0), 0);
    if (previousGroupCount === currentGroupCount) {
        // reorder or filter only
        return { currentKey, previous, previousKey };
    }
    // try to appear where the group was uncollapsed and vice versa
    let prevHelper;
    const appearPosition = (currentRowIndex, previousFinder, defaultValue) => {
        if (!prevHelper) {
            prevHelper = toGroupLookup(previousData);
        }
        const item = currentData[currentRowIndex];
        const referenceIndex = isGroup(item)
            ? prevHelper.group2firstItemIndex.get(item.name)
            : prevHelper.item2groupIndex.get(item.dataIndex);
        if (referenceIndex === undefined) {
            return defaultValue;
        }
        const pos = previousFinder.posByKey(previousKey(referenceIndex));
        return pos.pos >= 0 ? pos.pos : defaultValue;
    };
    let currHelper;
    const removePosition = (previousRowIndex, currentFinder, defaultValue) => {
        if (!currHelper) {
            currHelper = toGroupLookup(currentData);
        }
        const item = previousData[previousRowIndex];
        const referenceIndex = isGroup(item)
            ? currHelper.group2firstItemIndex.get(item.name)
            : currHelper.item2groupIndex.get(item.dataIndex);
        if (referenceIndex === undefined) {
            return defaultValue;
        }
        const pos = currentFinder.posByKey(currentKey(referenceIndex));
        return pos.pos >= 0 ? pos.pos : defaultValue;
    };
    const phases = [
        Object.assign({}, defaultPhases[0], {
            apply(item, previousFinder) {
                defaultPhases[0].apply(item);
                if (item.mode === EAnimationMode.SHOW) {
                    item.node.style.transform = `translate(0, ${appearPosition(item.current.index, previousFinder, item.previous.y) - item.nodeY}px)`;
                }
            },
        }),
        Object.assign({}, defaultPhases[1], {
            apply(item, _previousFinder, currentFinder) {
                defaultPhases[1].apply(item);
                if (item.mode === EAnimationMode.HIDE) {
                    item.node.style.transform = `translate(0, ${removePosition(item.previous.index, currentFinder, item.current.y) - item.nodeY}px)`;
                }
            },
        }),
        defaultPhases[defaultPhases.length - 1],
    ];
    return { previous, previousKey, currentKey, phases };
}
