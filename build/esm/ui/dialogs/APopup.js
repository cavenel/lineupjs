import ADialog, {} from './ADialog';
class APopup extends ADialog {
    constructor(dialog, options = {}) {
        super(dialog, Object.assign({
            popup: true,
        }, options));
    }
    submit() {
        return true;
    }
    reset() {
        // dummy
    }
    cancel() {
        // dummy
    }
}
export default APopup;
