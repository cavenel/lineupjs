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
import ADialog, {} from './ADialog';
import { uniqueId, forEach } from './utils';
import { getToolbarDialogAddons } from '../toolbarResolvers';
import { cssClass } from '../../styles';
/** @internal */
var GroupDialog = /** @class */ (function (_super) {
    __extends(GroupDialog, _super);
    function GroupDialog(column, dialog, ctx) {
        var _this = _super.call(this, dialog, {
            livePreview: 'group',
        }) || this;
        _this.column = column;
        _this.ctx = ctx;
        _this.handlers = [];
        return _this;
    }
    GroupDialog.prototype.build = function (node) {
        var addons = getToolbarDialogAddons(this.column, 'group', this.ctx);
        for (var _i = 0, addons_1 = addons; _i < addons_1.length; _i++) {
            var addon = addons_1[_i];
            var strong = node.ownerDocument.createElement('strong');
            strong.textContent = addon.title;
            this.node.insertAdjacentElement('beforeend', strong);
            this.handlers.push(addon.append(this.column, this.node, this.dialog, this.ctx));
        }
        this.handlers.push(sortOrder(node, this.column, this.dialog.idPrefix));
        for (var _a = 0, _b = this.handlers; _a < _b.length; _a++) {
            var handler = _b[_a];
            this.enableLivePreviews(handler.elems);
        }
    };
    GroupDialog.prototype.submit = function () {
        for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            if (handler.submit() === false) {
                return false;
            }
        }
        return true;
    };
    GroupDialog.prototype.cancel = function () {
        for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.cancel();
        }
    };
    GroupDialog.prototype.reset = function () {
        for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.reset();
        }
    };
    return GroupDialog;
}(ADialog));
export default GroupDialog;
function sortOrder(node, column, idPrefix) {
    var ranking = column.findMyRanker();
    var current = ranking.getGroupCriteria();
    var order = current.indexOf(column);
    var enabled = order >= 0;
    if (order < 0) {
        order = current.length;
    }
    var id = uniqueId(idPrefix);
    node.insertAdjacentHTML('afterbegin', "\n        <strong>Group By</strong>\n        <label class=\"".concat(cssClass('checkbox'), "\"><input type=\"radio\" name=\"grouped\" value=\"true\" ").concat(enabled ? 'checked' : '', " ><span>Enabled</span></label>\n        <label class=\"").concat(cssClass('checkbox'), "\"><input type=\"radio\" name=\"grouped\" value=\"false\" ").concat(!enabled ? 'checked' : '', " ><span>Disabled</span></label>\n        <strong>Group Priority</strong>\n        <input type=\"number\" id=\"").concat(id, "P\" step=\"1\" min=\"1\" max=\"").concat(current.length + 1, "\" value=\"").concat(order + 1, "\">\n    "));
    var updateDisabled = function (disable) {
        forEach(node, 'input:not([name=grouped]), select, textarea', function (d) {
            d.disabled = disable;
        });
    };
    updateDisabled(!enabled);
    forEach(node, 'input[name=grouped]', function (n) {
        n.addEventListener('change', function () {
            var enabled = n.value === 'true';
            updateDisabled(!enabled);
        }, {
            passive: true,
        });
    });
    return {
        elems: "input[name=grouped], #".concat(id, "P"),
        submit: function () {
            var enabled = node.querySelector('input[name=grouped]:checked').value === 'true';
            var order = Number.parseInt(node.querySelector("#".concat(id, "P")).value, 10) - 1;
            ranking.groupBy(column, !enabled ? -1 : order);
            return true;
        },
        reset: function () {
            node.querySelector('input[name=grouped][value=false]').checked = true;
            node.querySelector("#".concat(id, "P")).value = (current.length + (!enabled ? 1 : 0)).toString();
            updateDisabled(true);
        },
        cancel: function () {
            ranking.groupBy(column, current.indexOf(column));
        },
    };
}
//# sourceMappingURL=GroupDialog.js.map