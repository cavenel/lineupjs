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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { AEventDispatcher, suffix } from '../../internal';
import { isGroup, Ranking } from '../../model';
import { DataProvider } from '../../provider';
import EngineRenderer from '../EngineRenderer';
var TaggleRenderer = /** @class */ (function (_super) {
    __extends(TaggleRenderer, _super);
    function TaggleRenderer(data, parent, options) {
        var _this = _super.call(this) || this;
        _this.data = data;
        _this.isDynamicLeafHeight = false;
        _this.rule = null;
        _this.levelOfDetail = null;
        _this.options = {
            violationChanged: function () { return undefined; },
            rowPadding: 2,
        };
        Object.assign(_this.options, options);
        _this.renderer = new EngineRenderer(data, parent, Object.assign({}, options, {
            dynamicHeight: function (data, ranking) {
                var r = _this.dynamicHeight(data, ranking);
                if (r) {
                    return r;
                }
                return options.dynamicHeight ? options.dynamicHeight(data, ranking) : null;
            },
            levelOfDetail: function (rowIndex) { return (_this.levelOfDetail ? _this.levelOfDetail(rowIndex) : 'high'); },
        }));
        _this.data.on("".concat(DataProvider.EVENT_SELECTION_CHANGED, ".rule"), function () {
            if (_this.isDynamicLeafHeight) {
                _this.update();
            }
        });
        _this.forward.apply(_this, __spreadArray([_this.renderer], suffix('.main', EngineRenderer.EVENT_HIGHLIGHT_CHANGED, EngineRenderer.EVENT_DIALOG_OPENED, EngineRenderer.EVENT_DIALOG_CLOSED), false));
        return _this;
    }
    Object.defineProperty(TaggleRenderer.prototype, "style", {
        get: function () {
            return this.renderer.style;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TaggleRenderer.prototype, "ctx", {
        get: function () {
            return this.renderer.ctx;
        },
        enumerable: false,
        configurable: true
    });
    TaggleRenderer.prototype.pushUpdateAble = function (updateAble) {
        this.renderer.pushUpdateAble(updateAble);
    };
    TaggleRenderer.prototype.dynamicHeight = function (data, ranking) {
        var _this = this;
        if (!this.rule) {
            this.levelOfDetail = null;
            this.options.violationChanged(null, '');
            return null;
        }
        var availableHeight = this.renderer ? this.renderer.node.querySelector('main').clientHeight : 100;
        var topNGetter = function (group) { return _this.data.getTopNAggregated(ranking, group); };
        var instance = this.rule.apply(data, availableHeight, new Set(this.data.getSelection()), topNGetter);
        this.isDynamicLeafHeight = typeof instance.item === 'function';
        this.options.violationChanged(this.rule, instance.violation || '');
        var height = function (item) {
            if (isGroup(item)) {
                return typeof instance.group === 'number' ? instance.group : instance.group(item);
            }
            return typeof instance.item === 'number' ? instance.item : instance.item(item);
        };
        this.levelOfDetail = function (rowIndex) {
            var item = data[rowIndex];
            return _this.rule ? _this.rule.levelOfDetail(item, height(item)) : 'high';
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
            height: height,
            padding: 0,
        };
    };
    TaggleRenderer.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            TaggleRenderer.EVENT_HIGHLIGHT_CHANGED,
            TaggleRenderer.EVENT_DIALOG_OPENED,
            TaggleRenderer.EVENT_DIALOG_CLOSED,
        ]);
    };
    TaggleRenderer.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    TaggleRenderer.prototype.zoomOut = function () {
        this.renderer.zoomOut();
    };
    TaggleRenderer.prototype.zoomIn = function () {
        this.renderer.zoomIn();
    };
    TaggleRenderer.prototype.switchRule = function (rule) {
        if (this.rule === rule) {
            return;
        }
        this.rule = rule;
        this.update();
    };
    TaggleRenderer.prototype.getRule = function () {
        return this.rule;
    };
    TaggleRenderer.prototype.destroy = function () {
        this.renderer.destroy();
    };
    TaggleRenderer.prototype.update = function () {
        this.renderer.update();
    };
    TaggleRenderer.prototype.setDataProvider = function (data) {
        var _this = this;
        if (this.data) {
            this.data.on("".concat(DataProvider.EVENT_SELECTION_CHANGED, ".rule"), null);
        }
        this.data = data;
        this.data.on("".concat(DataProvider.EVENT_SELECTION_CHANGED, ".rule"), function () {
            if (_this.isDynamicLeafHeight) {
                _this.update();
            }
        });
        this.renderer.setDataProvider(data);
        this.update();
    };
    TaggleRenderer.prototype.setHighlight = function (dataIndex, scrollIntoView) {
        return this.renderer.setHighlight(dataIndex, scrollIntoView);
    };
    TaggleRenderer.prototype.getHighlight = function () {
        return this.renderer.getHighlight();
    };
    TaggleRenderer.prototype.enableHighlightListening = function (enable) {
        this.renderer.enableHighlightListening(enable);
    };
    TaggleRenderer.EVENT_HIGHLIGHT_CHANGED = EngineRenderer.EVENT_HIGHLIGHT_CHANGED;
    TaggleRenderer.EVENT_DIALOG_OPENED = EngineRenderer.EVENT_DIALOG_OPENED;
    TaggleRenderer.EVENT_DIALOG_CLOSED = EngineRenderer.EVENT_DIALOG_CLOSED;
    return TaggleRenderer;
}(AEventDispatcher));
export default TaggleRenderer;
//# sourceMappingURL=TaggleRenderer.js.map