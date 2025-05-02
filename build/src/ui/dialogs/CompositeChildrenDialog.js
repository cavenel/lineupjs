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
import { debounce, clear, suffix } from '../../internal';
import { CompositeColumn } from '../../model';
import { createHeader, updateHeader } from '../header';
import { cssClass, engineCssClass } from '../../styles';
import APopup from './APopup';
/** @internal */
var CompositeChildrenDialog = /** @class */ (function (_super) {
    __extends(CompositeChildrenDialog, _super);
    function CompositeChildrenDialog(column, dialog, ctx) {
        var _this = _super.call(this, dialog) || this;
        _this.column = column;
        _this.ctx = ctx;
        _this.id = ".dialog".concat(Math.random().toString(36).slice(-8).substring(0, 3));
        return _this;
    }
    CompositeChildrenDialog.prototype.cleanUp = function (action) {
        _super.prototype.cleanUp.call(this, action);
        this.column.on(suffix(this.id, CompositeColumn.EVENT_ADD_COLUMN, CompositeColumn.EVENT_REMOVE_COLUMN), null);
    };
    CompositeChildrenDialog.prototype.build = function (node) {
        var _this = this;
        node.classList.add(cssClass('dialog-sub-nested'));
        var createChildren = function () {
            _this.column.children.forEach(function (c) {
                var n = createHeader(c, _this.ctx, {
                    mergeDropAble: false,
                    resizeable: false,
                    level: _this.dialog.level + 1,
                    extraPrefix: 'sub',
                });
                n.className = cssClass('header');
                updateHeader(n, c);
                var summary = _this.ctx.summaryRenderer(c, false);
                var summaryNode = _this.ctx.asElement(summary.template);
                summaryNode.dataset.renderer = c.getSummaryRenderer();
                summaryNode.classList.add(cssClass('summary'), cssClass('renderer'), cssClass('th-summary'));
                var r = summary.update(summaryNode);
                if (r) {
                    summaryNode.classList.add(engineCssClass('loading'));
                    r.then(function () {
                        summaryNode.classList.remove(engineCssClass('loading'));
                    });
                }
                n.appendChild(summaryNode);
                node.appendChild(n);
            });
        };
        createChildren();
        this.column.on(suffix(this.id, CompositeColumn.EVENT_ADD_COLUMN, CompositeColumn.EVENT_REMOVE_COLUMN), debounce(function () {
            if (!node.parentElement) {
                // already closed
                _this.destroy();
                return;
            }
            clear(node);
            createChildren();
        }));
    };
    return CompositeChildrenDialog;
}(APopup));
export default CompositeChildrenDialog;
//# sourceMappingURL=CompositeChildrenDialog.js.map