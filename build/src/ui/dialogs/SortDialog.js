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
var SortDialog = /** @class */ (function (_super) {
    __extends(SortDialog, _super);
    function SortDialog(column, groupSortBy, dialog, ctx) {
        var _this = _super.call(this, dialog, {
            livePreview: groupSortBy ? 'groupSort' : 'sort',
        }) || this;
        _this.column = column;
        _this.groupSortBy = groupSortBy;
        _this.ctx = ctx;
        _this.handlers = [];
        return _this;
    }
    SortDialog.prototype.build = function (node) {
        var addons = getToolbarDialogAddons(this.column, this.groupSortBy ? 'sortGroup' : 'sort', this.ctx);
        for (var _i = 0, addons_1 = addons; _i < addons_1.length; _i++) {
            var addon = addons_1[_i];
            var title = this.node.ownerDocument.createElement('strong');
            title.textContent = addon.title;
            this.node.insertAdjacentElement('beforeend', title);
            this.handlers.push(addon.append(this.column, this.node, this.dialog, this.ctx));
        }
        this.handlers.push(sortOrder(node, this.column, this.dialog.idPrefix, this.groupSortBy));
        for (var _a = 0, _b = this.handlers; _a < _b.length; _a++) {
            var handler = _b[_a];
            this.enableLivePreviews(handler.elems);
        }
    };
    SortDialog.prototype.submit = function () {
        for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            if (handler.submit() === false) {
                return false;
            }
        }
        return true;
    };
    SortDialog.prototype.cancel = function () {
        for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.cancel();
        }
    };
    SortDialog.prototype.reset = function () {
        for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.reset();
        }
    };
    return SortDialog;
}(ADialog));
export default SortDialog;
function sortOrder(node, column, idPrefix, groupSortBy) {
    if (groupSortBy === void 0) { groupSortBy = false; }
    var ranking = column.findMyRanker();
    var current = groupSortBy ? ranking.getGroupSortCriteria() : ranking.getSortCriteria();
    var order = Object.assign({}, groupSortBy ? column.isGroupSortedByMe() : column.isSortedByMe());
    var priority = order.priority === undefined ? current.length : order.priority;
    var id = uniqueId(idPrefix);
    node.insertAdjacentHTML('afterbegin', "\n        <strong>Sort Order</strong>\n        <label class=\"".concat(cssClass('checkbox'), "\"><input type=\"radio\" name=\"sortorder\" value=\"asc\"  ").concat(order.asc === 'asc' ? 'checked' : '', " ><span>Ascending</span></label>\n        <label class=\"").concat(cssClass('checkbox'), "\"><input type=\"radio\" name=\"sortorder\" value=\"desc\"  ").concat(order.asc === 'desc' ? 'checked' : '', " ><span>Descending</span></label>\n        <label class=\"").concat(cssClass('checkbox'), "\"><input type=\"radio\" name=\"sortorder\" value=\"none\"  ").concat(order.asc === undefined ? 'checked' : '', " ><span>Unsorted</span></label>\n        <strong>Sort Priority</strong>\n        <input type=\"number\" id=\"").concat(id, "P\" step=\"1\" min=\"1\" max=\"").concat(current.length + 1, "\" value=\"").concat(priority + 1, "\">\n    "));
    var updateDisabled = function (disable) {
        forEach(node, 'input:not([name=sortorder]), select, textarea', function (d) {
            d.disabled = disable;
        });
    };
    updateDisabled(order.asc === undefined);
    forEach(node, 'input[name=sortorder]', function (n) {
        n.addEventListener('change', function () {
            updateDisabled(n.value === 'none');
        }, {
            passive: true,
        });
    });
    return {
        elems: "input[name=sortorder], #".concat(id, "P"),
        submit: function () {
            var asc = node.querySelector('input[name=sortorder]:checked').value;
            var priority = Number.parseInt(node.querySelector("#".concat(id, "P")).value, 10) - 1;
            if (groupSortBy) {
                ranking.groupSortBy(column, asc === 'asc', asc === 'none' ? -1 : priority);
            }
            else {
                ranking.sortBy(column, asc === 'asc', asc === 'none' ? -1 : priority);
            }
            return true;
        },
        reset: function () {
            node.querySelector('input[name=sortorder][value=none]').checked = true;
            node.querySelector("#".concat(id, "P")).value = (current.length + (order.priority === undefined ? 1 : 0)).toString();
            updateDisabled(true);
        },
        cancel: function () {
            if (groupSortBy) {
                ranking.groupSortBy(column, order.asc === 'asc', order.asc === undefined ? -1 : order.priority);
            }
            else {
                ranking.sortBy(column, order.asc === 'asc', order.asc === undefined ? -1 : order.priority);
            }
        },
    };
}
//# sourceMappingURL=SortDialog.js.map