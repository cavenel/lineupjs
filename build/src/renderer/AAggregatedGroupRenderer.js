import { noRenderer } from './utils';
/**
 * helper class that renders a group renderer as a selected (e.g. median) single item
 */
var AAggregatedGroupRenderer = /** @class */ (function () {
    function AAggregatedGroupRenderer() {
    }
    AAggregatedGroupRenderer.prototype.createGroup = function (col, context, imposer) {
        var _this = this;
        var single = this.create(col, context, imposer);
        return {
            template: single.template,
            update: function (node, group) {
                return context.tasks
                    .groupRows(col, group, 'aggregated', function (rows) { return _this.aggregatedIndex(rows, col); })
                    .then(function (data) {
                    if (typeof data !== 'symbol') {
                        single.update(node, data.row, data.index, group);
                    }
                });
            },
        };
    };
    AAggregatedGroupRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return AAggregatedGroupRenderer;
}());
export { AAggregatedGroupRenderer };
export default AAggregatedGroupRenderer;
//# sourceMappingURL=AAggregatedGroupRenderer.js.map