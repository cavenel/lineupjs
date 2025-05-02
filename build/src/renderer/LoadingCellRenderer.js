import { noop } from './utils';
var LoadingCellRenderer = /** @class */ (function () {
    function LoadingCellRenderer() {
        this.title = 'Loading';
    }
    LoadingCellRenderer.prototype.canRender = function () {
        return false; // just direct selection
    };
    LoadingCellRenderer.prototype.create = function () {
        // no typing because ICellRenderer would not be assignable to IGroupCellRenderer and ISummaryRenderer
        return {
            template: "<div>Loading \u2026</div>",
            update: noop,
        };
    };
    LoadingCellRenderer.prototype.createGroup = function () {
        return this.create();
    };
    LoadingCellRenderer.prototype.createSummary = function () {
        return this.create();
    };
    return LoadingCellRenderer;
}());
export default LoadingCellRenderer;
//# sourceMappingURL=LoadingCellRenderer.js.map