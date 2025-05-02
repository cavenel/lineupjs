var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StackColumn_1;
import { round, similar } from '../internal';
import { toolbar } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import CompositeNumberColumn, {} from './CompositeNumberColumn';
import { integrateDefaults } from './internal';
/**
 * factory for creating a description creating a stacked column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createStackDesc(label = 'Weighted Sum', showNestedSummaries = true) {
    return { type: 'stack', label, showNestedSummaries };
}
/**
 * implementation of the stacked column
 */
let StackColumn = StackColumn_1 = class StackColumn extends CompositeNumberColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            renderer: 'stack',
            groupRenderer: 'stack',
            summaryRenderer: 'stack',
        }));
        /**
         * whether this stack column is collapsed i.e. just looks like an ordinary number column
         * @type {boolean}
         * @private
         */
        this.collapsed = false;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        this.adaptChange = function (oldValue, newValue) {
            that.adaptWidthChange(this.source, oldValue, newValue);
        };
    }
    get label() {
        const l = super.getMetaData().label;
        const c = this._children;
        if (l !== 'Weighted Sum' || c.length === 0) {
            return l;
        }
        const weights = this.getWeights();
        return c.map((c, i) => `${c.label} (${round(100 * weights[i], 1)}%)`).join(' + ');
    }
    createEventList() {
        return super
            .createEventList()
            .concat([
            StackColumn_1.EVENT_COLLAPSE_CHANGED,
            StackColumn_1.EVENT_WEIGHTS_CHANGED,
            StackColumn_1.EVENT_MULTI_LEVEL_CHANGED,
        ]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    setCollapsed(value) {
        if (this.collapsed === value) {
            return;
        }
        this.fire([StackColumn_1.EVENT_COLLAPSE_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.collapsed, (this.collapsed = value));
    }
    getCollapsed() {
        return this.collapsed;
    }
    isShowNestedSummaries() {
        return this.desc.showNestedSummaries !== false;
    }
    get canJustAddNumbers() {
        return true;
    }
    flatten(r, offset, levelsToGo = 0, padding = 0) {
        let self = null;
        const children = levelsToGo <= Column.FLAT_ALL_COLUMNS ? this._children : this._children.filter((c) => c.isVisible());
        //no more levels or just this one
        if (levelsToGo === 0 || levelsToGo <= Column.FLAT_ALL_COLUMNS) {
            let w = this.getWidth();
            if (!this.collapsed) {
                w += (children.length - 1) * padding;
            }
            r.push((self = { col: this, offset, width: w }));
            if (levelsToGo === 0) {
                return w;
            }
        }
        //push children
        let acc = offset;
        children.forEach((c) => {
            acc += c.flatten(r, acc, levelsToGo - 1, padding) + padding;
        });
        if (self) {
            //nesting my even increase my width
            self.width = acc - offset - padding;
        }
        return acc - offset - padding;
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.collapsed = this.collapsed;
        return r;
    }
    restore(dump, factory) {
        this.collapsed = dump.collapsed === true;
        super.restore(dump, factory);
    }
    /**
     * inserts a column at a the given position
     */
    insert(col, index, weight = NaN) {
        if (!Number.isNaN(weight)) {
            col.setWidth((weight / (1 - weight)) * this.getWidth());
        }
        col.on(`${Column.EVENT_WIDTH_CHANGED}.stack`, this.adaptChange);
        //increase my width
        super.setWidth(this.length === 0 ? col.getWidth() : this.getWidth() + col.getWidth());
        return super.insert(col, index);
    }
    push(col, weight = NaN) {
        return this.insert(col, this.length, weight);
    }
    insertAfter(col, ref, weight = NaN) {
        const i = this.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.insert(col, i + 1, weight);
    }
    /**
     * adapts weights according to an own width change
     * @param col
     * @param oldValue
     * @param newValue
     */
    adaptWidthChange(col, oldValue, newValue) {
        if (similar(oldValue, newValue, 0.5)) {
            return;
        }
        const bak = this.getWeights();
        const full = this.getWidth(), change = (newValue - oldValue) / full;
        const oldWeight = oldValue / full;
        const factor = (1 - oldWeight - change) / (1 - oldWeight);
        const widths = this._children.map((c) => {
            if (c === col) {
                //c.weight += change;
                return newValue;
            }
            const guess = c.getWidth() * factor;
            const w = Number.isNaN(guess) || guess < 1 ? 0 : guess;
            c.setWidthImpl(w);
            return w;
        });
        //adapt width if needed
        super.setWidth(widths.reduce((a, b) => a + b, 0));
        this.fire([
            StackColumn_1.EVENT_WEIGHTS_CHANGED,
            StackColumn_1.EVENT_MULTI_LEVEL_CHANGED,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], bak, this.getWeights());
    }
    getWeights() {
        const w = this.getWidth();
        return this._children.map((d) => d.getWidth() / w);
    }
    setWeights(weights) {
        const bak = this.getWeights();
        const delta = weights.length - this.length;
        let s;
        if (delta < 0) {
            s = weights.reduce((p, a) => p + a, 0);
            if (s <= 1) {
                for (let i = 0; i < -delta; ++i) {
                    weights.push((1 - s) * (1 / -delta));
                }
            }
            else if (s <= 100) {
                for (let i = 0; i < -delta; ++i) {
                    weights.push((100 - s) * (1 / -delta));
                }
            }
        }
        weights = weights.slice(0, this.length);
        s = weights.reduce((p, a) => p + a, 0) / this.getWidth();
        weights = weights.map((d) => d / s);
        this._children.forEach((c, i) => {
            c.setWidthImpl(weights[i]);
        });
        this.fire([
            StackColumn_1.EVENT_WEIGHTS_CHANGED,
            StackColumn_1.EVENT_MULTI_LEVEL_CHANGED,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], bak, weights);
    }
    removeImpl(child, index) {
        child.on(`${Column.EVENT_WIDTH_CHANGED}.stack`, null);
        super.setWidth(this.length === 0 ? 100 : this.getWidth() - child.getWidth());
        return super.removeImpl(child, index);
    }
    setWidth(value) {
        const factor = value / this.getWidth();
        this._children.forEach((child) => {
            //disable since we change it
            child.setWidthImpl(child.getWidth() * factor);
        });
        super.setWidth(value);
    }
    compute(row) {
        const w = this.getWidth();
        // missing value for the stack column if at least one child value is missing
        if (this._children.some((d) => d.getValue(row) === null)) {
            return null;
        }
        return this._children.reduce((acc, d) => acc + d.getValue(row) * (d.getWidth() / w), 0);
    }
    getRenderer() {
        if (this.getCollapsed() && this.isLoaded()) {
            return StackColumn_1.COLLAPSED_RENDERER;
        }
        return super.getRenderer();
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
StackColumn.EVENT_COLLAPSE_CHANGED = 'collapseChanged';
StackColumn.EVENT_WEIGHTS_CHANGED = 'weightsChanged';
StackColumn.EVENT_MULTI_LEVEL_CHANGED = 'nestedChildRatio';
StackColumn.COLLAPSED_RENDERER = 'number';
StackColumn = StackColumn_1 = __decorate([
    toolbar('editWeights', 'compress', 'expand')
], StackColumn);
export default StackColumn;
