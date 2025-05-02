import { computePosition, autoUpdate, flip, shift, limitShift, size } from '@floating-ui/dom';
import { cssClass } from '../../styles';
export function dialogContext(ctx, level, attachment) {
    return {
        attachment: attachment.currentTarget != null
            ? attachment.currentTarget
            : attachment,
        level,
        manager: ctx.dialogManager,
        idPrefix: ctx.idPrefix,
        sanitize: ctx.sanitize,
    };
}
class ADialog {
    constructor(dialog, options = {}) {
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
    get autoClose() {
        return this.options.autoClose;
    }
    get attachment() {
        return this.dialog.attachment;
    }
    get level() {
        return this.dialog.level;
    }
    showLivePreviews() {
        return (this.options.livePreview === true ||
            (typeof this.options.livePreview === 'string' &&
                this.dialog.manager.livePreviews[this.options.livePreview] === true));
    }
    enableLivePreviews(selector) {
        if (!this.showLivePreviews()) {
            return;
        }
        const submitter = () => {
            this.submit();
        };
        if (typeof selector === 'string') {
            this.forEach(selector, (n) => {
                n.addEventListener('change', submitter, { passive: true });
            });
        }
        else {
            selector.forEach((n) => {
                n.addEventListener('change', submitter, { passive: true });
            });
        }
    }
    equals(that) {
        return this.dialog.level === that.dialog.level && this.dialog.attachment === that.dialog.attachment;
    }
    appendDialogButtons() {
        this.node.insertAdjacentHTML('beforeend', `<div class="${cssClass('dialog-buttons')}">
      <button class="${cssClass('dialog-button')}" type="submit" title="Apply"></button>
      <button class="${cssClass('dialog-button')}" type="button" title="Cancel"></button>
      <button class="${cssClass('dialog-button')}" type="reset" title="Reset to default values"></button>
    </div>`);
    }
    open() {
        if (this.options.toggleDialog && this.dialog.manager.removeLike(this)) {
            return;
        }
        if (this.build(this.node) === false) {
            return;
        }
        const parent = this.attachment.closest(`.${cssClass()}`);
        if (this.options.title) {
            const title = this.node.ownerDocument.createElement('strong');
            title.textContent = this.options.title;
            this.node.insertAdjacentElement('afterbegin', title);
        }
        if (!this.options.popup) {
            this.appendDialogButtons();
        }
        parent.appendChild(this.node);
        this.floatingUiCleanup = autoUpdate(this.attachment, this.node, () => {
            computePosition(this.attachment, this.node, {
                placement: this.dialog.level === 0 ? 'bottom-start' : 'right-start',
                middleware: [
                    flip(),
                    shift({ limiter: limitShift() }),
                    size({
                        apply({ availableWidth, availableHeight, elements }) {
                            const offset = 12;
                            Object.assign(elements.floating.style, {
                                maxWidth: `${availableWidth}px`,
                                maxHeight: `${availableHeight - offset}px`,
                                overflowY: 'auto', // add vertical scrollbar if needed
                            });
                        },
                    }),
                ],
            }).then(({ x, y }) => {
                function roundByDPR(value) {
                    const dpr = window.devicePixelRatio || 1;
                    return Math.round(value * dpr) / dpr;
                }
                Object.assign(this.node.style, {
                    top: '0',
                    left: '0',
                    transform: `translate(${roundByDPR(x)}px,${roundByDPR(y)}px)`,
                });
            });
        });
        const auto = this.find('input[autofocus]');
        if (auto) {
            // delay such that it works
            setTimeout(() => auto.focus());
        }
        const reset = this.find('button[type=reset]');
        if (reset) {
            reset.onclick = (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                this.reset();
                if (this.showLivePreviews()) {
                    this.submit();
                }
            };
        }
        this.node.onsubmit = (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            return this.triggerSubmit();
        };
        const cancel = this.find('button[title=Cancel]');
        if (cancel) {
            cancel.onclick = (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                this.cancel();
                this.destroy('cancel');
            };
        }
        if (this.options.cancelSubDialogs) {
            this.node.addEventListener('click', () => {
                this.dialog.manager.removeAboveLevel(this.dialog.level + 1);
            });
        }
        this.dialog.manager.push(this);
    }
    triggerSubmit() {
        if (!this.node.checkValidity()) {
            return false;
        }
        if (this.submit() !== false) {
            this.destroy('confirm');
        }
        return false;
    }
    find(selector) {
        return this.node.querySelector(selector);
    }
    findInput(selector) {
        return this.find(selector);
    }
    forEach(selector, callback) {
        return Array.from(this.node.querySelectorAll(selector)).map(callback);
    }
    cleanUp(action) {
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
    }
    destroy(action = 'cancel') {
        this.dialog.manager.triggerDialogClosed(this, action);
        this.dialog.manager.remove(this, true);
    }
}
export default ADialog;
