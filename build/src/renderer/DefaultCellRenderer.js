import { renderMissingDOM } from './missing';
import { noRenderer, setText } from './utils';
/**
 * default renderer instance rendering the value as a text
 */
var DefaultCellRenderer = /** @class */ (function () {
    function DefaultCellRenderer() {
        this.title = 'String';
        this.groupTitle = 'None';
        this.summaryTitle = 'None';
    }
    DefaultCellRenderer.prototype.canRender = function (_col, _mode) {
        return true;
    };
    DefaultCellRenderer.prototype.create = function (col) {
        return {
            template: "<div> </div>",
            update: function (n, d) {
                renderMissingDOM(n, col, d);
                var l = col.getLabel(d);
                setText(n, l);
                n.title = l;
            },
        };
    };
    DefaultCellRenderer.prototype.createGroup = function (_col) {
        return noRenderer;
    };
    DefaultCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return DefaultCellRenderer;
}());
export { DefaultCellRenderer };
//# sourceMappingURL=DefaultCellRenderer.js.map