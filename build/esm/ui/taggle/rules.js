import { isGroup } from '../../model';
import { groupEndLevel } from '../../provider/internal';
export function spaceFillingRule(config) {
    function levelOfDetail(item, height) {
        const group = isGroup(item);
        const maxHeight = group ? config.groupHeight : config.rowHeight;
        if (height >= maxHeight * 0.9) {
            return 'high';
        }
        return 'low';
    }
    function itemHeight(data, availableHeight, selection, topNGetter) {
        const visibleHeight = availableHeight - config.rowHeight - 5; // some padding for hover
        const items = data.filter((d) => !isGroup(d));
        const groups = data.length - items.length;
        const selected = items.reduce((a, d) => a + (selection.has(d.dataIndex) ? 1 : 0), 0);
        const unselected = items.length - selected;
        const groupSeparators = items.reduce((a, d) => a + groupEndLevel(d, topNGetter), 0);
        if (unselected <= 0) {
            // doesn't matter since all are selected anyhow
            return { height: config.rowHeight, violation: '' };
        }
        const available = visibleHeight - groups * config.groupHeight - groupSeparators * config.groupPadding - selected * config.rowHeight;
        const height = Math.floor(available / unselected); // round to avoid sub pixel issues
        if (height < 1) {
            return {
                height: 1,
                violation: `Not possible to fit all rows on the screen.`,
            };
        }
        // clamp to max height
        if (height > config.rowHeight) {
            return {
                height: config.rowHeight,
                violation: '',
            };
        }
        return { height, violation: '' };
    }
    return {
        apply: (data, availableHeight, selection, topNGetter) => {
            const { violation, height } = itemHeight(data, availableHeight, selection, topNGetter);
            const item = (item) => {
                if (selection.has(item.dataIndex)) {
                    return config.rowHeight;
                }
                return height;
            };
            return { item, group: config.groupHeight, violation };
        },
        levelOfDetail,
    };
}
