var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { AnnotateColumn, Column } from '../model';
import StringCellRenderer from './StringCellRenderer';
import { cssClass } from '../styles';
var AnnotationRenderer = /** @class */ (function (_super) {
    __extends(AnnotationRenderer, _super);
    function AnnotationRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.title = 'Default';
        return _this;
    }
    AnnotationRenderer.prototype.canRender = function (col) {
        return _super.prototype.canRender.call(this, col) && col instanceof AnnotateColumn;
    };
    AnnotationRenderer.prototype.create = function (col) {
        return {
            template: "<div>\n        <span></span>\n        <input class=\"".concat(cssClass('hover-only'), " ").concat(cssClass('annotate-input'), "\">\n       </div>"),
            update: function (n, d) {
                var label = n.firstElementChild;
                var input = n.lastElementChild;
                input.onchange = function () {
                    label.textContent = input.value;
                    col.setValue(d, input.value);
                };
                input.onclick = function (event) {
                    event.stopPropagation();
                };
                label.textContent = input.value = col.getLabel(d);
            },
        };
    };
    return AnnotationRenderer;
}(StringCellRenderer));
export default AnnotationRenderer;
//# sourceMappingURL=AnnotationRenderer.js.map