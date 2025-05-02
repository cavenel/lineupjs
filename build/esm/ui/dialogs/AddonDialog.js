import ADialog, {} from './ADialog';
/** @internal */
export default class AddonDialog extends ADialog {
    constructor(column, addons, dialog, ctx, onClick) {
        super(dialog);
        this.column = column;
        this.addons = addons;
        this.ctx = ctx;
        this.onClick = onClick;
        this.handlers = [];
    }
    build(node) {
        for (const addon of this.addons) {
            this.node.insertAdjacentHTML('beforeend', `<strong>${this.ctx.sanitize(addon.title)}</strong>`);
            this.handlers.push(addon.append(this.column, node, this.dialog, this.ctx));
        }
    }
    submit() {
        for (const handler of this.handlers) {
            if (handler.submit() === false) {
                return false;
            }
        }
        if (this.onClick) {
            this.onClick();
        }
        return true;
    }
    cancel() {
        for (const handler of this.handlers) {
            handler.cancel();
        }
    }
    reset() {
        for (const handler of this.handlers) {
            handler.reset();
        }
    }
}
