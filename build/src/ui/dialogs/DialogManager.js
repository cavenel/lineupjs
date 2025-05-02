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
import { cssClass } from '../../styles';
import { AEventDispatcher } from '../../internal';
var DialogManager = /** @class */ (function (_super) {
    __extends(DialogManager, _super);
    function DialogManager(options) {
        var _this = _super.call(this) || this;
        _this.escKeyListener = function (evt) {
            if (evt.which === 27) {
                _this.removeLast();
            }
        };
        _this.openDialogs = [];
        var doc = options.doc;
        _this.livePreviews = options.livePreviews;
        _this.onDialogBackgroundClick = options.onDialogBackgroundClick;
        _this.node = doc.createElement('div');
        _this.node.classList.add(cssClass('backdrop'));
        var backdrop = doc.createElement('div');
        backdrop.classList.add(cssClass('backdrop-bg'));
        _this.node.appendChild(backdrop);
        _this.node.onclick = function () {
            _this.removeAll();
        };
        return _this;
    }
    DialogManager.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([DialogManager.EVENT_DIALOG_CLOSED, DialogManager.EVENT_DIALOG_OPENED]);
    };
    DialogManager.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    Object.defineProperty(DialogManager.prototype, "maxLevel", {
        get: function () {
            return this.openDialogs.reduce(function (acc, a) { return Math.max(acc, a.level); }, 0);
        },
        enumerable: false,
        configurable: true
    });
    DialogManager.prototype.setHighlight = function (mask) {
        var area = this.node.firstElementChild;
        // @see https://bennettfeely.com/clippy/ -> select `Frame` example
        // use webkit prefix for safari
        area.style.clipPath = area.style.webkitClipPath = "polygon(\n      0% 0%,\n      0% 100%,\n      ".concat(mask.left, "px 100%,\n      ").concat(mask.left, "px ").concat(mask.top, "px,\n      ").concat(mask.left + mask.width, "px ").concat(mask.top, "px,\n      ").concat(mask.left + mask.width, "px ").concat(mask.top + mask.height, "px,\n      ").concat(mask.left, "px ").concat(mask.top + mask.height, "px,\n      ").concat(mask.left, "px 100%,\n      100% 100%,\n      100% 0%\n    )");
    };
    DialogManager.prototype.setHighlightColumn = function (column) {
        var root = this.node.parentElement;
        if (!root) {
            this.clearHighlight();
            return;
        }
        var header = root.querySelector(".".concat(cssClass('header'), "[data-col-id=\"").concat(column.id, "\"]"));
        if (!header) {
            this.clearHighlight();
            return;
        }
        var base = header.getBoundingClientRect();
        var offset = root.getBoundingClientRect();
        this.setHighlight({
            left: base.left - offset.left,
            top: base.top - offset.top,
            width: base.width,
            height: offset.height,
        });
    };
    DialogManager.prototype.clearHighlight = function () {
        var area = this.node.firstElementChild;
        area.style.clipPath = null;
    };
    DialogManager.prototype.removeLast = function () {
        if (this.openDialogs.length === 0) {
            return;
        }
        this.remove(this.openDialogs[this.openDialogs.length - 1]);
    };
    DialogManager.prototype.removeAll = function () {
        var _this = this;
        if (this.openDialogs.length === 0) {
            return;
        }
        var all = this.openDialogs.splice(0, this.openDialogs.length);
        all.reverse().forEach(function (d) { return d.cleanUp(_this.onDialogBackgroundClick); });
        this.takeDown();
    };
    DialogManager.prototype.triggerDialogClosed = function (dialog, action) {
        this.fire(DialogManager.EVENT_DIALOG_CLOSED, dialog, action);
    };
    DialogManager.prototype.remove = function (dialog, handled) {
        var _this = this;
        if (handled === void 0) { handled = false; }
        var index = this.openDialogs.indexOf(dialog);
        if (index < 0) {
            return false;
        }
        // destroy self and all levels below that = after that
        var destroyed = this.openDialogs.splice(index, this.openDialogs.length - index);
        destroyed.reverse().forEach(function (d) { return d.cleanUp(handled ? 'handled' : _this.onDialogBackgroundClick); });
        while (handled && this.openDialogs.length > 0 && this.openDialogs[this.openDialogs.length - 1].autoClose) {
            var dialog_1 = this.openDialogs.pop();
            dialog_1.cleanUp(this.onDialogBackgroundClick);
        }
        if (this.openDialogs.length === 0) {
            this.takeDown();
        }
        return true;
    };
    DialogManager.prototype.removeAboveLevel = function (level) {
        var _this = this;
        // hide all dialogs which have a higher or equal level to the newly opened one
        this.openDialogs
            .filter(function (d) { return d.level >= level; })
            .reverse()
            .forEach(function (d) { return _this.remove(d); });
    };
    DialogManager.prototype.removeLike = function (dialog) {
        var similar = this.openDialogs.find(function (d) { return dialog.equals(d); });
        if (!similar) {
            return false;
        }
        this.remove(similar);
        return true;
    };
    DialogManager.prototype.setUp = function () {
        this.node.ownerDocument.addEventListener('keyup', this.escKeyListener, {
            passive: true,
        });
        this.node.style.display = 'block';
    };
    DialogManager.prototype.takeDown = function () {
        this.clearHighlight();
        this.node.ownerDocument.removeEventListener('keyup', this.escKeyListener);
        this.node.style.display = null;
    };
    DialogManager.prototype.push = function (dialog) {
        this.removeAboveLevel(dialog.level);
        if (this.openDialogs.length === 0) {
            this.setUp();
        }
        this.openDialogs.push(dialog);
        this.fire(DialogManager.EVENT_DIALOG_OPENED, dialog);
    };
    DialogManager.EVENT_DIALOG_OPENED = 'dialogOpened';
    DialogManager.EVENT_DIALOG_CLOSED = 'dialogClosed';
    return DialogManager;
}(AEventDispatcher));
export default DialogManager;
//# sourceMappingURL=DialogManager.js.map