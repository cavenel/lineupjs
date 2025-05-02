import { isGroup } from '../../model';
import { groupEndLevel } from '../../provider/internal';
export function spaceFillingRule(config) {
    function levelOfDetail(item, height) {
        var group = isGroup(item);
        var maxHeight = group ? config.groupHeight : config.rowHeight;
        if (height >= maxHeight * 0.9) {
            return 'high';
        }
        return 'low';
    }
    function itemHeight(data, availableHeight, selection, topNGetter) {
        var visibleHeight = availableHeight - config.rowHeight - 5; // some padding for hover
        var items = data.filter(function (d) { return !isGroup(d); });
        var groups = data.length - items.length;
        var selected = items.reduce(function (a, d) { return a + (selection.has(d.dataIndex) ? 1 : 0); }, 0);
        var unselected = items.length - selected;
        var groupSeparators = items.reduce(function (a, d) { return a + groupEndLevel(d, topNGetter); }, 0);
        if (unselected <= 0) {
            // doesn't matter since all are selected anyhow
            return { height: config.rowHeight, violation: '' };
        }
        var available = visibleHeight - groups * config.groupHeight - groupSeparators * config.groupPadding - selected * config.rowHeight;
        var height = Math.floor(available / unselected); // round to avoid sub pixel issues
        if (height < 1) {
            return {
                height: 1,
                violation: "Not possible to fit all rows on the screen.",
            };
        }
        // clamp to max height
        if (height > config.rowHeight) {
            return {
                height: config.rowHeight,
                violation: '',
            };
        }
        return { height: height, violation: '' };
    }
    return {
        apply: function (data, availableHeight, selection, topNGetter) {
            var _a = itemHeight(data, availableHeight, selection, topNGetter), violation = _a.violation, height = _a.height;
            var item = function (item) {
                if (selection.has(item.dataIndex)) {
                    return config.rowHeight;
                }
                return height;
            };
            return { item: item, group: config.groupHeight, violation: violation };
        },
        levelOfDetail: levelOfDetail,
    };
}
//# sourceMappingURL=rules.js.map