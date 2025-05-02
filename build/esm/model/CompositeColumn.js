var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CompositeColumn_1;
import { suffix } from '../internal';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import { Category, toolbar } from './annotations';
import { isNumberColumn } from './INumberColumn';
import ValueColumn from './ValueColumn';
/**
 * implementation of a combine column, standard operations how to select
 */
let CompositeColumn = CompositeColumn_1 = class CompositeColumn extends Column {
    constructor() {
        super(...arguments);
        this._children = [];
    }
    createEventList() {
        return super
            .createEventList()
            .concat([
            CompositeColumn_1.EVENT_FILTER_CHANGED,
            CompositeColumn_1.EVENT_ADD_COLUMN,
            CompositeColumn_1.EVENT_MOVE_COLUMN,
            CompositeColumn_1.EVENT_REMOVE_COLUMN,
        ]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    assignNewId(idGenerator) {
        super.assignNewId(idGenerator);
        this._children.forEach((c) => c.assignNewId(idGenerator));
    }
    get children() {
        return this._children.slice();
    }
    get length() {
        return this._children.length;
    }
    flatten(r, offset, levelsToGo = 0, padding = 0) {
        let w = 0;
        //no more levels or just this one
        if (levelsToGo === 0 || levelsToGo <= Column.FLAT_ALL_COLUMNS) {
            w = this.getWidth();
            r.push({ col: this, offset, width: w });
            if (levelsToGo === 0) {
                return w;
            }
        }
        //push children
        this._children.forEach((c) => {
            if (c.isVisible() && levelsToGo <= Column.FLAT_ALL_COLUMNS) {
                c.flatten(r, offset, levelsToGo - 1, padding);
            }
        });
        return w;
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.children = this._children.map((d) => d.dump(toDescRef));
        return r;
    }
    restore(dump, factory) {
        dump.children.forEach((child) => {
            const c = factory(child);
            if (c) {
                this.push(c);
            }
        });
        super.restore(dump, factory);
    }
    /**
     * inserts a column at a the given position
     * @param col
     * @param index
     * @returns {any}
     */
    insert(col, index) {
        if (!isNumberColumn(col) && this.canJustAddNumbers) {
            //indicator it is a number type
            return null;
        }
        this._children.splice(index, 0, col);
        //listen and propagate events
        return this.insertImpl(col, index);
    }
    move(col, index) {
        if (col.parent !== this) {
            //not moving
            return null;
        }
        const old = this._children.indexOf(col);
        if (index === old) {
            // no move needed
            return col;
        }
        //delete first
        this._children.splice(old, 1);
        // adapt target index based on previous index, i.e shift by one
        this._children.splice(old < index ? index - 1 : index, 0, col);
        //listen and propagate events
        return this.moveImpl(col, index, old);
    }
    insertImpl(col, index) {
        col.attach(this);
        this.forward(col, ...suffix('.combine', Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY_CACHES, Column.EVENT_DIRTY, CompositeColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_RENDERER_TYPE_CHANGED, Column.EVENT_GROUP_RENDERER_TYPE_CHANGED));
        this.fire([
            CompositeColumn_1.EVENT_ADD_COLUMN,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], col, index);
        return col;
    }
    moveImpl(col, index, oldIndex) {
        this.fire([
            CompositeColumn_1.EVENT_MOVE_COLUMN,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
            Column.EVENT_RENDERER_TYPE_CHANGED,
            Column.EVENT_GROUP_RENDERER_TYPE_CHANGED,
        ], col, index, oldIndex);
        return col;
    }
    push(col) {
        return this.insert(col, this._children.length);
    }
    at(index) {
        return this._children[index];
    }
    indexOf(col) {
        return this._children.indexOf(col);
    }
    insertAfter(col, ref) {
        const i = this.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.insert(col, i + 1);
    }
    moveAfter(col, ref) {
        const i = this.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.move(col, i + 1);
    }
    insertBefore(col, ref) {
        const i = this.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.insert(col, i);
    }
    moveBefore(col, ref) {
        const i = this.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.move(col, i);
    }
    remove(col) {
        const i = this._children.indexOf(col);
        if (i < 0) {
            return false;
        }
        this._children.splice(i, 1); //remove and deregister listeners
        return this.removeImpl(col, i);
    }
    removeImpl(col, index) {
        col.detach();
        this.unforward(col, ...suffix('.combine', Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY_CACHES, Column.EVENT_DIRTY, CompositeColumn_1.EVENT_FILTER_CHANGED));
        this.fire([
            CompositeColumn_1.EVENT_REMOVE_COLUMN,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], col, index);
        return true;
    }
    isFiltered() {
        return this._children.some((d) => d.isFiltered());
    }
    clearFilter() {
        return this._children.map((d) => d.clearFilter()).some((d) => d);
    }
    filter(row) {
        return this._children.every((d) => d.filter(row));
    }
    isLoaded() {
        return this._children.every((c) => !(c instanceof ValueColumn || c instanceof CompositeColumn_1) ||
            c.isLoaded());
    }
    get canJustAddNumbers() {
        return false;
    }
};
CompositeColumn.EVENT_FILTER_CHANGED = 'filterChanged';
CompositeColumn.EVENT_ADD_COLUMN = 'addColumn';
CompositeColumn.EVENT_MOVE_COLUMN = 'moveColumn';
CompositeColumn.EVENT_REMOVE_COLUMN = 'removeColumn';
CompositeColumn = CompositeColumn_1 = __decorate([
    toolbar('compositeContained', 'splitCombined'),
    Category('composite')
], CompositeColumn);
export default CompositeColumn;
