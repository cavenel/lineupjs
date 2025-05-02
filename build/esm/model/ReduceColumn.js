var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ReduceColumn_1;
import { median, quantile } from '../internal';
import { toolbar } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, DEFAULT_COLOR, } from './Column';
import CompositeNumberColumn, {} from './CompositeNumberColumn';
import { EAdvancedSortMethod } from './INumberColumn';
import { integrateDefaults } from './internal';
/**
 *  factory for creating a description creating a max column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createReduceDesc(label = 'Reduce') {
    return { type: 'reduce', label };
}
/**
 * combines multiple columns by using the maximal value
 */
let ReduceColumn = ReduceColumn_1 = class ReduceColumn extends CompositeNumberColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            renderer: 'interleaving',
            groupRenderer: 'interleaving',
            summaryRenderer: 'interleaving',
        }));
        this.reduce = desc.reduce || EAdvancedSortMethod.max;
    }
    get label() {
        const l = super.getMetaData().label;
        if (l !== 'Reduce') {
            return l;
        }
        return `${this.reduce[0].toUpperCase()}${this.reduce.slice(1)}(${this.children.map((d) => d.label).join(', ')})`;
    }
    getColor(row) {
        //compute the index of the maximal one
        const c = this._children;
        if (c.length === 0 ||
            this.reduce === EAdvancedSortMethod.q1 ||
            this.reduce === EAdvancedSortMethod.q3 ||
            this.reduce === EAdvancedSortMethod.mean) {
            return DEFAULT_COLOR;
        }
        const v = this.compute(row);
        const selected = c.find((c) => c.getValue(row) === v);
        return selected ? selected.getColor(row) : DEFAULT_COLOR;
    }
    compute(row) {
        const vs = this._children.map((d) => d.getValue(row)).filter((d) => !Number.isNaN(d));
        if (vs.length === 0) {
            return NaN;
        }
        switch (this.reduce) {
            case EAdvancedSortMethod.mean:
                return vs.reduce((a, b) => a + b, 0) / vs.length;
            case EAdvancedSortMethod.max:
                return vs.reduce((a, b) => Math.max(a, b), Number.NEGATIVE_INFINITY);
            case EAdvancedSortMethod.min:
                return vs.reduce((a, b) => Math.min(a, b), Number.POSITIVE_INFINITY);
            case EAdvancedSortMethod.median:
                return median(vs);
            case EAdvancedSortMethod.q1:
                return quantile(vs.sort((a, b) => a - b), 0.25);
            case EAdvancedSortMethod.q3:
                return quantile(vs.sort((a, b) => a - b), 0.75);
        }
    }
    createEventList() {
        return super.createEventList().concat([ReduceColumn_1.EVENT_REDUCE_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getReduce() {
        return this.reduce;
    }
    setReduce(reduce) {
        if (this.reduce === reduce) {
            return;
        }
        this.fire([ReduceColumn_1.EVENT_REDUCE_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY_CACHES, Column.EVENT_DIRTY], this.reduce, (this.reduce = reduce));
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.reduce = this.reduce;
        return r;
    }
    restore(dump, factory) {
        this.reduce = dump.reduce || this.reduce;
        super.restore(dump, factory);
    }
    get canJustAddNumbers() {
        return true;
    }
    getExportValue(row, format) {
        if (format === 'json') {
            return {
                value: this.getRawNumber(row),
                children: this.children.map((d) => d.getExportValue(row, format)),
            };
        }
        return super.getExportValue(row, format);
    }
};
ReduceColumn.EVENT_REDUCE_CHANGED = 'reduceChanged';
ReduceColumn = ReduceColumn_1 = __decorate([
    toolbar('reduce')
], ReduceColumn);
export default ReduceColumn;
