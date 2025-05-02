import { getUnsupportedBrowserError, SUPPORTED_CHROME_VERSION, SUPPORTED_EDGE_VERSION, SUPPORTED_FIREFOX_VERSION, } from '../browser';
import { AEventDispatcher, clear } from '../internal';
import { DataProvider } from '../provider';
import { cssClass } from '../styles';
import DialogManager from './dialogs/DialogManager';
import { isPromiseLike } from '../provider/utils';
export class ALineUp extends AEventDispatcher {
    constructor(node, _data, ignoreIncompatibleBrowser) {
        super();
        this.node = node;
        this._data = _data;
        this.highlightListeners = 0;
        const error = getUnsupportedBrowserError();
        this.isBrowserSupported = ignoreIncompatibleBrowser || !error;
        if (!this.isBrowserSupported) {
            this.node.classList.add(cssClass('unsupported-browser'));
            this.node.innerHTML = `<span>${error}</span>
      <div class="${cssClass('unsupported-browser')}">
        <a href="https://www.mozilla.org/en-US/firefox/" rel="noopener" target="_blank" data-browser="firefox" data-version="${SUPPORTED_FIREFOX_VERSION}"></a>
        <a href="https://www.google.com/chrome/index.html" rel="noopener" target="_blank" data-browser="chrome" data-version="${SUPPORTED_CHROME_VERSION}" title="best support"></a>
        <a href="https://www.microsoft.com/en-us/windows/microsoft-edge" rel="noopener" target="_blank" data-browser="edge" data-version="${SUPPORTED_EDGE_VERSION}"></a>
      </div><span>use the <code>ignoreUnsupportedBrowser=true</code> option to ignore this error at your own risk</span>`;
        }
        this.forward(_data, `${DataProvider.EVENT_SELECTION_CHANGED}.main`);
        _data.on(`${DataProvider.EVENT_BUSY}.busy`, (busy) => this.node.classList.toggle(cssClass('busy'), busy));
    }
    createEventList() {
        return super
            .createEventList()
            .concat([
            ALineUp.EVENT_HIGHLIGHT_CHANGED,
            ALineUp.EVENT_SELECTION_CHANGED,
            ALineUp.EVENT_DIALOG_OPENED,
            ALineUp.EVENT_DIALOG_CLOSED,
        ]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    get data() {
        return this._data;
    }
    destroy() {
        // just clear since we hand in the node itself
        clear(this.node);
        this._data.destroy();
    }
    dump() {
        return this.data.dump();
    }
    restore(dump) {
        this._data.restore(dump);
    }
    setDataProvider(data, dump) {
        if (this._data) {
            this.unforward(this._data, `${DataProvider.EVENT_SELECTION_CHANGED}.taggle`);
            this._data.on(`${DataProvider.EVENT_BUSY}.busy`, null);
        }
        this._data = data;
        if (dump) {
            data.restore(dump);
        }
        this.forward(data, `${DataProvider.EVENT_SELECTION_CHANGED}.taggle`);
        data.on(`${DataProvider.EVENT_BUSY}.busy`, (busy) => this.node.classList.toggle(cssClass('busy'), busy));
    }
    getSelection() {
        return this._data.getSelection();
    }
    setSelection(dataIndices) {
        this._data.setSelection(dataIndices);
    }
    /**
     * sorts LineUp by he given column
     * @param column callback function finding the column to sort
     * @param ascending
     * @returns {boolean}
     */
    sortBy(column, ascending = false) {
        const col = this.data.find(column);
        if (col) {
            col.sortByMe(ascending);
        }
        return col != null;
    }
    listenersChanged(type, enabled) {
        super.listenersChanged(type, enabled);
        if (!type.startsWith(ALineUp.EVENT_HIGHLIGHT_CHANGED)) {
            return;
        }
        if (enabled) {
            this.highlightListeners++;
            if (this.highlightListeners === 1) {
                // first
                this.enableHighlightListening(true);
            }
        }
        else {
            this.highlightListeners -= 1;
            if (this.highlightListeners === 0) {
                // last
                this.enableHighlightListening(false);
            }
        }
    }
    enableHighlightListening(_enable) {
        // hook
    }
    addCopyListener() {
        this.node.addEventListener('copy', (e) => {
            if (!this.data || !this.data.getFirstRanking()) {
                return;
            }
            const selections = this.data.getSelection();
            let data;
            if (selections.length === 0) {
                // copy all
                data = this.data.exportTable(this.data.getFirstRanking());
            }
            else {
                // copy subset
                data = this.data.exportSelection();
            }
            e.preventDefault();
            if (isPromiseLike(data)) {
                data.then((csv) => {
                    e.clipboardData.setData('text/plain', csv);
                    e.clipboardData.setData('text/tsv', csv);
                });
            }
            else {
                e.clipboardData.setData('text/plain', data);
                e.clipboardData.setData('text/tsv', data);
            }
        });
    }
}
ALineUp.EVENT_SELECTION_CHANGED = DataProvider.EVENT_SELECTION_CHANGED;
ALineUp.EVENT_DIALOG_OPENED = DialogManager.EVENT_DIALOG_OPENED;
ALineUp.EVENT_DIALOG_CLOSED = DialogManager.EVENT_DIALOG_CLOSED;
ALineUp.EVENT_HIGHLIGHT_CHANGED = 'highlightChanged';
export default ALineUp;
