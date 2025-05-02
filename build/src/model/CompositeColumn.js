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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { suffix } from '../internal';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import { Category, toolbar } from './annotations';
import { isNumberColumn } from './INumberColumn';
import ValueColumn from './ValueColumn';
/**
 * implementation of a combine column, standard operations how to select
 */
var CompositeColumn = /** @class */ (function (_super) {
    __extends(CompositeColumn, _super);
    function CompositeColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._children = [];
        return _this;
    }
    CompositeColumn_1 = CompositeColumn;
    CompositeColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            CompositeColumn_1.EVENT_FILTER_CHANGED,
            CompositeColumn_1.EVENT_ADD_COLUMN,
            CompositeColumn_1.EVENT_MOVE_COLUMN,
            CompositeColumn_1.EVENT_REMOVE_COLUMN,
        ]);
    };
    CompositeColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    CompositeColumn.prototype.assignNewId = function (idGenerator) {
        _super.prototype.assignNewId.call(this, idGenerator);
        this._children.forEach(function (c) { return c.assignNewId(idGenerator); });
    };
    Object.defineProperty(CompositeColumn.prototype, "children", {
        get: function () {
            return this._children.slice();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CompositeColumn.prototype, "length", {
        get: function () {
            return this._children.length;
        },
        enumerable: false,
        configurable: true
    });
    CompositeColumn.prototype.flatten = function (r, offset, levelsToGo, padding) {
        if (levelsToGo === void 0) { levelsToGo = 0; }
        if (padding === void 0) { padding = 0; }
        var w = 0;
        //no more levels or just this one
        if (levelsToGo === 0 || levelsToGo <= Column.FLAT_ALL_COLUMNS) {
            w = this.getWidth();
            r.push({ col: this, offset: offset, width: w });
            if (levelsToGo === 0) {
                return w;
            }
        }
        //push children
        this._children.forEach(function (c) {
            if (c.isVisible() && levelsToGo <= Column.FLAT_ALL_COLUMNS) {
                c.flatten(r, offset, levelsToGo - 1, padding);
            }
        });
        return w;
    };
    CompositeColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.children = this._children.map(function (d) { return d.dump(toDescRef); });
        return r;
    };
    CompositeColumn.prototype.restore = function (dump, factory) {
        var _this = this;
        dump.children.forEach(function (child) {
            var c = factory(child);
            if (c) {
                _this.push(c);
            }
        });
        _super.prototype.restore.call(this, dump, factory);
    };
    /**
     * inserts a column at a the given position
     * @param col
     * @param index
     * @returns {any}
     */
    CompositeColumn.prototype.insert = function (col, index) {
        if (!isNumberColumn(col) && this.canJustAddNumbers) {
            //indicator it is a number type
            return null;
        }
        this._children.splice(index, 0, col);
        //listen and propagate events
        return this.insertImpl(col, index);
    };
    CompositeColumn.prototype.move = function (col, index) {
        if (col.parent !== this) {
            //not moving
            return null;
        }
        var old = this._children.indexOf(col);
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
    };
    CompositeColumn.prototype.insertImpl = function (col, index) {
        col.attach(this);
        this.forward.apply(this, __spreadArray([col], suffix('.combine', Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY_CACHES, Column.EVENT_DIRTY, CompositeColumn_1.EVENT_FILTER_CHANGED, Column.EVENT_RENDERER_TYPE_CHANGED, Column.EVENT_GROUP_RENDERER_TYPE_CHANGED), false));
        this.fire([
            CompositeColumn_1.EVENT_ADD_COLUMN,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], col, index);
        return col;
    };
    CompositeColumn.prototype.moveImpl = function (col, index, oldIndex) {
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
    };
    CompositeColumn.prototype.push = function (col) {
        return this.insert(col, this._children.length);
    };
    CompositeColumn.prototype.at = function (index) {
        return this._children[index];
    };
    CompositeColumn.prototype.indexOf = function (col) {
        return this._children.indexOf(col);
    };
    CompositeColumn.prototype.insertAfter = function (col, ref) {
        var i = this.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.insert(col, i + 1);
    };
    CompositeColumn.prototype.moveAfter = function (col, ref) {
        var i = this.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.move(col, i + 1);
    };
    CompositeColumn.prototype.insertBefore = function (col, ref) {
        var i = this.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.insert(col, i);
    };
    CompositeColumn.prototype.moveBefore = function (col, ref) {
        var i = this.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.move(col, i);
    };
    CompositeColumn.prototype.remove = function (col) {
        var i = this._children.indexOf(col);
        if (i < 0) {
            return false;
        }
        this._children.splice(i, 1); //remove and deregister listeners
        return this.removeImpl(col, i);
    };
    CompositeColumn.prototype.removeImpl = function (col, index) {
        col.detach();
        this.unforward.apply(this, __spreadArray([col], suffix('.combine', Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY_CACHES, Column.EVENT_DIRTY, CompositeColumn_1.EVENT_FILTER_CHANGED), false));
        this.fire([
            CompositeColumn_1.EVENT_REMOVE_COLUMN,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], col, index);
        return true;
    };
    CompositeColumn.prototype.isFiltered = function () {
        return this._children.some(function (d) { return d.isFiltered(); });
    };
    CompositeColumn.prototype.clearFilter = function () {
        return this._children.map(function (d) { return d.clearFilter(); }).some(function (d) { return d; });
    };
    CompositeColumn.prototype.filter = function (row) {
        return this._children.every(function (d) { return d.filter(row); });
    };
    CompositeColumn.prototype.isLoaded = function () {
        return this._children.every(function (c) {
            return !(c instanceof ValueColumn || c instanceof CompositeColumn_1) ||
                c.isLoaded();
        });
    };
    Object.defineProperty(CompositeColumn.prototype, "canJustAddNumbers", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    var CompositeColumn_1;
    CompositeColumn.EVENT_FILTER_CHANGED = 'filterChanged';
    CompositeColumn.EVENT_ADD_COLUMN = 'addColumn';
    CompositeColumn.EVENT_MOVE_COLUMN = 'moveColumn';
    CompositeColumn.EVENT_REMOVE_COLUMN = 'removeColumn';
    CompositeColumn = CompositeColumn_1 = __decorate([
        toolbar('compositeContained', 'splitCombined'),
        Category('composite')
    ], CompositeColumn);
    return CompositeColumn;
}(Column));
export default CompositeColumn;
//# sourceMappingURL=CompositeColumn.js.map