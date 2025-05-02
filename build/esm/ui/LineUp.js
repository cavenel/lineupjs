import { defaultOptions } from '../config';
import { merge, suffix } from '../internal';
import { cssClass } from '../styles';
import { ALineUp } from './ALineUp';
import EngineRenderer from './EngineRenderer';
import SidePanel from './panel/SidePanel';
class LineUp extends ALineUp {
    constructor(node, data, options = {}) {
        super(node, data, options && options.ignoreUnsupportedBrowser === true);
        this.options = defaultOptions();
        merge(this.options, options);
        if (this.options.copyableRows) {
            this.addCopyListener();
        }
        if (!this.isBrowserSupported) {
            this.renderer = null;
            this.panel = null;
            return;
        }
        this.node.classList.add(cssClass());
        this.renderer = new EngineRenderer(data, this.node, this.options);
        if (this.options.sidePanel) {
            this.panel = new SidePanel(this.renderer.ctx, this.node.ownerDocument, {
                collapseable: this.options.sidePanelCollapsed ? 'collapsed' : true,
                hierarchy: this.options.hierarchyIndicator && this.options.flags.advancedRankingFeatures,
            });
            this.renderer.pushUpdateAble((ctx) => this.panel.update(ctx));
            this.node.insertBefore(this.panel.node, this.node.firstChild);
        }
        else {
            this.panel = null;
        }
        this.forward(this.renderer, ...suffix('.main', EngineRenderer.EVENT_HIGHLIGHT_CHANGED, EngineRenderer.EVENT_DIALOG_OPENED, EngineRenderer.EVENT_DIALOG_CLOSED));
    }
    destroy() {
        this.node.classList.remove(cssClass());
        if (this.renderer) {
            this.renderer.destroy();
        }
        if (this.panel) {
            this.panel.destroy();
        }
        super.destroy();
    }
    update() {
        if (this.renderer) {
            this.renderer.update();
        }
    }
    setDataProvider(data, dump) {
        super.setDataProvider(data, dump);
        if (!this.renderer) {
            return;
        }
        this.renderer.setDataProvider(data);
        this.update();
        if (this.panel) {
            this.panel.update(this.renderer.ctx);
        }
    }
    setHighlight(dataIndex, scrollIntoView = true) {
        return this.renderer != null && this.renderer.setHighlight(dataIndex, scrollIntoView);
    }
    getHighlight() {
        return this.renderer ? this.renderer.getHighlight() : -1;
    }
    enableHighlightListening(enable) {
        if (this.renderer) {
            this.renderer.enableHighlightListening(enable);
        }
    }
}
LineUp.EVENT_SELECTION_CHANGED = ALineUp.EVENT_SELECTION_CHANGED;
LineUp.EVENT_DIALOG_OPENED = ALineUp.EVENT_DIALOG_OPENED;
LineUp.EVENT_DIALOG_CLOSED = ALineUp.EVENT_DIALOG_CLOSED;
LineUp.EVENT_HIGHLIGHT_CHANGED = ALineUp.EVENT_HIGHLIGHT_CHANGED;
export default LineUp;
