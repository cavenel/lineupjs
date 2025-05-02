import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, dirtyCaches, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, } from './Column';
/**
 * a column having an accessor to get the cell value
 */
class ValueColumn extends Column {
    constructor(id, desc) {
        super(id, desc);
        //find accessor
        this.accessor = desc.accessor || (() => null);
        this.loaded = desc.lazyLoaded !== true;
    }
    onDataUpdate(_rows) {
        // hook for listening to data updates
    }
    createEventList() {
        return super.createEventList().concat([ValueColumn.EVENT_DATA_LOADED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getLabel(row) {
        if (!this.isLoaded()) {
            return '';
        }
        const v = this.getValue(row);
        return v == null ? '' : String(v);
    }
    getRaw(row) {
        if (!this.isLoaded()) {
            return null;
        }
        return this.accessor(row, this.desc);
    }
    getValue(row) {
        return this.getRaw(row);
    }
    isLoaded() {
        return this.loaded;
    }
    setLoaded(loaded) {
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
    }
    getRenderer() {
        if (!this.isLoaded()) {
            return ValueColumn.RENDERER_LOADING;
        }
        return super.getRenderer();
    }
    /**
     * patch the dump such that the loaded attribute is defined (for lazy loading columns)
     * @param toDescRef
     * @returns {any}
     */
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.loaded = this.loaded;
        if (!this.loaded && r.renderer === ValueColumn.RENDERER_LOADING) {
            delete r.renderer;
        }
        return r;
    }
    restore(dump, factory) {
        if (dump.loaded !== undefined) {
            this.loaded = dump.loaded;
        }
        super.restore(dump, factory);
    }
}
ValueColumn.EVENT_DATA_LOADED = 'dataLoaded';
ValueColumn.RENDERER_LOADING = 'loading';
export default ValueColumn;
