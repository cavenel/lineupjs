var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MultiLevelCompositeColumn_1;
import { similar } from '../internal';
import { toolbar } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import CompositeColumn, { addColumn, filterChanged, moveColumn, removeColumn } from './CompositeColumn';
import { integrateDefaults } from './internal';
import StackColumn from './StackColumn';
let MultiLevelCompositeColumn = MultiLevelCompositeColumn_1 = class MultiLevelCompositeColumn extends CompositeColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            summaryRenderer: 'nested',
        }));
        /**
         * whether this stack column is collapsed i.e. just looks like an ordinary number column
         * @type {boolean}
         * @private
         */
        this.collapsed = false;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        this.adaptChange = function (old, newValue) {
            that.adaptWidthChange(old, newValue);
        };
    }
    createEventList() {
        return super
            .createEventList()
            .concat([MultiLevelCompositeColumn_1.EVENT_COLLAPSE_CHANGED, MultiLevelCompositeColumn_1.EVENT_MULTI_LEVEL_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    setCollapsed(value) {
        if (this.collapsed === value) {
            return;
        }
        this.fire([StackColumn.EVENT_COLLAPSE_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.collapsed, (this.collapsed = value));
    }
    getCollapsed() {
        return this.collapsed;
    }
    isShowNestedSummaries() {
        return this.desc.showNestedSummaries !== false;
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
    flatten(r, offset, levelsToGo = 0, padding = 0) {
        return StackColumn.prototype.flatten.call(this, r, offset, levelsToGo, padding);
    }
    /**
     * inserts a column at a the given position
     * @param col
     * @param index
     */
    insert(col, index) {
        col.on(`${Column.EVENT_WIDTH_CHANGED}.stack`, this.adaptChange);
        //increase my width
        super.setWidth(this.length === 0 ? col.getWidth() : this.getWidth() + col.getWidth());
        return super.insert(col, index);
    }
    /**
     * adapts weights according to an own width change
     * @param oldValue
     * @param newValue
     */
    adaptWidthChange(oldValue, newValue) {
        if (similar(oldValue, newValue, 0.5)) {
            return;
        }
        const act = this.getWidth();
        const next = act + (newValue - oldValue);
        this.fire([MultiLevelCompositeColumn_1.EVENT_MULTI_LEVEL_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY], act, next);
        super.setWidth(next);
    }
    removeImpl(child, index) {
        child.on(`${Column.EVENT_WIDTH_CHANGED}.stack`, null);
        super.setWidth(this.length === 0 ? 100 : this.getWidth() - child.getWidth());
        return super.removeImpl(child, index);
    }
    setWidth(value) {
        const act = this.getWidth();
        const factor = value / act;
        this._children.forEach((child) => {
            //disable since we change it
            child.setWidthImpl(child.getWidth() * factor);
        });
        if (!similar(act, value, 0.5)) {
            this.fire([MultiLevelCompositeColumn_1.EVENT_MULTI_LEVEL_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY], act, value);
        }
        super.setWidth(value);
    }
    getRenderer() {
        if (this.getCollapsed()) {
            return MultiLevelCompositeColumn_1.COLLAPSED_RENDERER;
        }
        return super.getRenderer();
    }
    getExportValue(row, format) {
        if (format === 'json') {
            return {
                children: this.children.map((d) => d.getExportValue(row, format)),
            };
        }
        return super.getExportValue(row, format);
    }
};
MultiLevelCompositeColumn.EVENT_COLLAPSE_CHANGED = StackColumn.EVENT_COLLAPSE_CHANGED;
MultiLevelCompositeColumn.EVENT_MULTI_LEVEL_CHANGED = StackColumn.EVENT_MULTI_LEVEL_CHANGED;
MultiLevelCompositeColumn.COLLAPSED_RENDERER = 'default';
MultiLevelCompositeColumn = MultiLevelCompositeColumn_1 = __decorate([
    toolbar('compress', 'expand')
], MultiLevelCompositeColumn);
export default MultiLevelCompositeColumn;
