import { computePosition, autoUpdate, flip, shift, limitShift, size } from '@floating-ui/dom';
import { cssClass } from '../../styles';
export function dialogContext(ctx, level, attachment) {
    return {
        attachment: attachment.currentTarget != null
            ? attachment.currentTarget
            : attachment,
        level: level,
        manager: ctx.dialogManager,
        idPrefix: ctx.idPrefix,
        sanitize: ctx.sanitize,
    };
}
var ADialog = /** @class */ (function () {
    function ADialog(dialog, options) {
        if (options === void 0) { options = {}; }
        this.dialog = dialog;
        this.options = {
            title: '',
            livePreview: false,
            popup: false,
            toggleDialog: true,
            cancelSubDialogs: false,
            autoClose: false,
        };
        this.floatingUiCleanup = null;
        Object.assign(this.options, options);
        this.node = dialog.attachment.ownerDocument.createElement('form');
        this.node.classList.add(cssClass('dialog'));
    }
    Object.defineProperty(ADialog.prototype, "autoClose", {
        get: function () {
            return this.options.autoClose;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ADialog.prototype, "attachment", {
        get: function () {
            return this.dialog.attachment;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ADialog.prototype, "level", {
        get: function () {
            return this.dialog.level;
        },
        enumerable: false,
        configurable: true
    });
    ADialog.prototype.showLivePreviews = function () {
        return (this.options.livePreview === true ||
            (typeof this.options.livePreview === 'string' &&
                this.dialog.manager.livePreviews[this.options.livePreview] === true));
    };
    ADialog.prototype.enableLivePreviews = function (selector) {
        var _this = this;
        if (!this.showLivePreviews()) {
            return;
        }
        var submitter = function () {
            _this.submit();
        };
        if (typeof selector === 'string') {
            this.forEach(selector, function (n) {
                n.addEventListener('change', submitter, { passive: true });
            });
        }
        else {
            selector.forEach(function (n) {
                n.addEventListener('change', submitter, { passive: true });
            });
        }
    };
    ADialog.prototype.equals = function (that) {
        return this.dialog.level === that.dialog.level && this.dialog.attachment === that.dialog.attachment;
    };
    ADialog.prototype.appendDialogButtons = function () {
        this.node.insertAdjacentHTML('beforeend', "<div class=\"".concat(cssClass('dialog-buttons'), "\">\n      <button class=\"").concat(cssClass('dialog-button'), "\" type=\"submit\" title=\"Apply\"></button>\n      <button class=\"").concat(cssClass('dialog-button'), "\" type=\"button\" title=\"Cancel\"></button>\n      <button class=\"").concat(cssClass('dialog-button'), "\" type=\"reset\" title=\"Reset to default values\"></button>\n    </div>"));
    };
    ADialog.prototype.open = function () {
        var _this = this;
        if (this.options.toggleDialog && this.dialog.manager.removeLike(this)) {
            return;
        }
        if (this.build(this.node) === false) {
            return;
        }
        var parent = this.attachment.closest(".".concat(cssClass()));
        if (this.options.title) {
            var title = this.node.ownerDocument.createElement('strong');
            title.textContent = this.options.title;
            this.node.insertAdjacentElement('afterbegin', title);
        }
        if (!this.options.popup) {
            this.appendDialogButtons();
        }
        parent.appendChild(this.node);
        this.floatingUiCleanup = autoUpdate(this.attachment, this.node, function () {
            computePosition(_this.attachment, _this.node, {
                placement: _this.dialog.level === 0 ? 'bottom-start' : 'right-start',
                middleware: [
                    flip(),
                    shift({ limiter: limitShift() }),
                    size({
                        apply: function (_a) {
                            var availableWidth = _a.availableWidth, availableHeight = _a.availableHeight, elements = _a.elements;
                            var offset = 12;
                            Object.assign(elements.floating.style, {
                                maxWidth: "".concat(availableWidth, "px"),
                                maxHeight: "".concat(availableHeight - offset, "px"),
                                overflowY: 'auto', // add vertical scrollbar if needed
                            });
                        },
                    }),
                ],
            }).then(function (_a) {
                var x = _a.x, y = _a.y;
                function roundByDPR(value) {
                    var dpr = window.devicePixelRatio || 1;
                    return Math.round(value * dpr) / dpr;
                }
                Object.assign(_this.node.style, {
                    top: '0',
                    left: '0',
                    transform: "translate(".concat(roundByDPR(x), "px,").concat(roundByDPR(y), "px)"),
                });
            });
        });
        var auto = this.find('input[autofocus]');
        if (auto) {
            // delay such that it works
            setTimeout(function () { return auto.focus(); });
        }
        var reset = this.find('button[type=reset]');
        if (reset) {
            reset.onclick = function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                _this.reset();
                if (_this.showLivePreviews()) {
                    _this.submit();
                }
            };
        }
        this.node.onsubmit = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            return _this.triggerSubmit();
        };
        var cancel = this.find('button[title=Cancel]');
        if (cancel) {
            cancel.onclick = function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                _this.cancel();
                _this.destroy('cancel');
            };
        }
        if (this.options.cancelSubDialogs) {
            this.node.addEventListener('click', function () {
                _this.dialog.manager.removeAboveLevel(_this.dialog.level + 1);
            });
        }
        this.dialog.manager.push(this);
    };
    ADialog.prototype.triggerSubmit = function () {
        if (!this.node.checkValidity()) {
            return false;
        }
        if (this.submit() !== false) {
            this.destroy('confirm');
        }
        return false;
    };
    ADialog.prototype.find = function (selector) {
        return this.node.querySelector(selector);
    };
    ADialog.prototype.findInput = function (selector) {
        return this.find(selector);
    };
    ADialog.prototype.forEach = function (selector, callback) {
        return Array.from(this.node.querySelectorAll(selector)).map(callback);
    };
    ADialog.prototype.cleanUp = function (action) {
        if (action === 'confirm') {
            this.submit(); // TODO what if submit wasn't successful?
        }
        else if (action === 'cancel') {
            this.cancel();
        }
        if (action !== 'handled') {
            this.dialog.manager.triggerDialogClosed(this, action);
        }
        if (this.floatingUiCleanup) {
            this.floatingUiCleanup();
        }
        this.node.remove();
    };
    ADialog.prototype.destroy = function (action) {
        if (action === void 0) { action = 'cancel'; }
        this.dialog.manager.triggerDialogClosed(this, action);
        this.dialog.manager.remove(this, true);
    };
    return ADialog;
}());
export default ADialog;
//# sourceMappingURL=ADialog.js.map