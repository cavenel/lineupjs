import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import StringColumn from './StringColumn';
/**
 * a string column in which the values can be edited locally
 */
class AnnotateColumn extends StringColumn {
    constructor() {
        super(...arguments);
        this.annotations = new Map();
    }
    createEventList() {
        return super.createEventList().concat([AnnotateColumn.EVENT_VALUE_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getValue(row) {
        if (this.annotations.has(row.i)) {
            return this.annotations.get(row.i);
        }
        return super.getValue(row);
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.annotations = {};
        this.annotations.forEach((v, k) => {
            r.annotations[k] = v;
        });
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        if (!dump.annotations) {
            return;
        }
        Object.keys(dump.annotations).forEach((k) => {
            this.annotations.set(Number(k), dump.annotations[k]);
        });
    }
    setValue(row, value) {
        const old = this.getValue(row);
        if (old === value) {
            return true;
        }
        if (value === '' || value == null) {
            this.annotations.delete(row.i);
        }
        else {
            this.annotations.set(row.i, value);
        }
        this.fire([AnnotateColumn.EVENT_VALUE_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY_CACHES, Column.EVENT_DIRTY], row.i, old, value);
        return true;
    }
}
AnnotateColumn.EVENT_VALUE_CHANGED = 'valueChanged';
export default AnnotateColumn;
