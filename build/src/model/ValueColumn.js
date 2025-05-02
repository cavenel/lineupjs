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
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, dirtyCaches, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, } from './Column';
/**
 * a column having an accessor to get the cell value
 */
var ValueColumn = /** @class */ (function (_super) {
    __extends(ValueColumn, _super);
    function ValueColumn(id, desc) {
        var _this = _super.call(this, id, desc) || this;
        //find accessor
        _this.accessor = desc.accessor || (function () { return null; });
        _this.loaded = desc.lazyLoaded !== true;
        return _this;
    }
    ValueColumn.prototype.onDataUpdate = function (_rows) {
        // hook for listening to data updates
    };
    ValueColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([ValueColumn.EVENT_DATA_LOADED]);
    };
    ValueColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    ValueColumn.prototype.getLabel = function (row) {
        if (!this.isLoaded()) {
            return '';
        }
        var v = this.getValue(row);
        return v == null ? '' : String(v);
    };
    ValueColumn.prototype.getRaw = function (row) {
        if (!this.isLoaded()) {
            return null;
        }
        return this.accessor(row, this.desc);
    };
    ValueColumn.prototype.getValue = function (row) {
        return this.getRaw(row);
    };
    ValueColumn.prototype.isLoaded = function () {
        return this.loaded;
    };
    ValueColumn.prototype.setLoaded = function (loaded) {
        if (this.loaded === loaded) {
            return;
        }
        this.fire([
            ValueColumn.EVENT_DATA_LOADED,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], this.loaded, (this.loaded = loaded));
    };
    ValueColumn.prototype.getRenderer = function () {
        if (!this.isLoaded()) {
            return ValueColumn.RENDERER_LOADING;
        }
        return _super.prototype.getRenderer.call(this);
    };
    /**
     * patch the dump such that the loaded attribute is defined (for lazy loading columns)
     * @param toDescRef
     * @returns {any}
     */
    ValueColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.loaded = this.loaded;
        if (!this.loaded && r.renderer === ValueColumn.RENDERER_LOADING) {
            delete r.renderer;
        }
        return r;
    };
    ValueColumn.prototype.restore = function (dump, factory) {
        if (dump.loaded !== undefined) {
            this.loaded = dump.loaded;
        }
        _super.prototype.restore.call(this, dump, factory);
    };
    ValueColumn.EVENT_DATA_LOADED = 'dataLoaded';
    ValueColumn.RENDERER_LOADING = 'loading';
    return ValueColumn;
}(Column));
export default ValueColumn;
//# sourceMappingURL=ValueColumn.js.map