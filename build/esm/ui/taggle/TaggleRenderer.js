import { AEventDispatcher, suffix } from '../../internal';
import { isGroup, Ranking } from '../../model';
import { DataProvider } from '../../provider';
import EngineRenderer from '../EngineRenderer';
class TaggleRenderer extends AEventDispatcher {
    constructor(data, parent, options) {
        super();
        this.data = data;
        this.isDynamicLeafHeight = false;
        this.rule = null;
        this.levelOfDetail = null;
        this.options = {
            violationChanged: () => undefined,
            rowPadding: 2,
        };
        Object.assign(this.options, options);
        this.renderer = new EngineRenderer(data, parent, Object.assign({}, options, {
            dynamicHeight: (data, ranking) => {
                const r = this.dynamicHeight(data, ranking);
                if (r) {
                    return r;
                }
                return options.dynamicHeight ? options.dynamicHeight(data, ranking) : null;
            },
            levelOfDetail: (rowIndex) => (this.levelOfDetail ? this.levelOfDetail(rowIndex) : 'high'),
        }));
        this.data.on(`${DataProvider.EVENT_SELECTION_CHANGED}.rule`, () => {
            if (this.isDynamicLeafHeight) {
                this.update();
            }
        });
        this.forward(this.renderer, ...suffix('.main', EngineRenderer.EVENT_HIGHLIGHT_CHANGED, EngineRenderer.EVENT_DIALOG_OPENED, EngineRenderer.EVENT_DIALOG_CLOSED));
    }
    get style() {
        return this.renderer.style;
    }
    get ctx() {
        return this.renderer.ctx;
    }
    pushUpdateAble(updateAble) {
        this.renderer.pushUpdateAble(updateAble);
    }
    dynamicHeight(data, ranking) {
        if (!this.rule) {
            this.levelOfDetail = null;
            this.options.violationChanged(null, '');
            return null;
        }
        const availableHeight = this.renderer ? this.renderer.node.querySelector('main').clientHeight : 100;
        const topNGetter = (group) => this.data.getTopNAggregated(ranking, group);
        const instance = this.rule.apply(data, availableHeight, new Set(this.data.getSelection()), topNGetter);
        this.isDynamicLeafHeight = typeof instance.item === 'function';
        this.options.violationChanged(this.rule, instance.violation || '');
        const height = (item) => {
            if (isGroup(item)) {
                return typeof instance.group === 'number' ? instance.group : instance.group(item);
            }
            return typeof instance.item === 'number' ? instance.item : instance.item(item);
        };
        this.levelOfDetail = (rowIndex) => {
            const item = data[rowIndex];
            return this.rule ? this.rule.levelOfDetail(item, height(item)) : 'high';
        };
        // padding is always 0 since included in height
        // const padding = (item: IGroupData | IGroupItem | null) => {
        //   if (!item) {
        //     item = data[0];
        //   }
        //   const lod = this.rule ? this.rule.levelOfDetail(item, height(item)) : 'high';
        //   return lod === 'high' ? 0 : 0; // always 0 since
        // };
        return {
            defaultHeight: typeof instance.item === 'number' ? instance.item : NaN,
            height,
            padding: 0,
        };
    }
    createEventList() {
        return super
            .createEventList()
            .concat([
            TaggleRenderer.EVENT_HIGHLIGHT_CHANGED,
            TaggleRenderer.EVENT_DIALOG_OPENED,
            TaggleRenderer.EVENT_DIALOG_CLOSED,
        ]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    zoomOut() {
        this.renderer.zoomOut();
    }
    zoomIn() {
        this.renderer.zoomIn();
    }
    switchRule(rule) {
        if (this.rule === rule) {
            return;
        }
        this.rule = rule;
        this.update();
    }
    getRule() {
        return this.rule;
    }
    destroy() {
        this.renderer.destroy();
    }
    update() {
        this.renderer.update();
    }
    setDataProvider(data) {
        if (this.data) {
            this.data.on(`${DataProvider.EVENT_SELECTION_CHANGED}.rule`, null);
        }
        this.data = data;
        this.data.on(`${DataProvider.EVENT_SELECTION_CHANGED}.rule`, () => {
            if (this.isDynamicLeafHeight) {
                this.update();
            }
        });
        this.renderer.setDataProvider(data);
        this.update();
    }
    setHighlight(dataIndex, scrollIntoView) {
        return this.renderer.setHighlight(dataIndex, scrollIntoView);
    }
    getHighlight() {
        return this.renderer.getHighlight();
    }
    enableHighlightListening(enable) {
        this.renderer.enableHighlightListening(enable);
    }
}
TaggleRenderer.EVENT_HIGHLIGHT_CHANGED = EngineRenderer.EVENT_HIGHLIGHT_CHANGED;
TaggleRenderer.EVENT_DIALOG_OPENED = EngineRenderer.EVENT_DIALOG_OPENED;
TaggleRenderer.EVENT_DIALOG_CLOSED = EngineRenderer.EVENT_DIALOG_CLOSED;
export default TaggleRenderer;
