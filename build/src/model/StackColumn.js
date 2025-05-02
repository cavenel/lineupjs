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
export function createStackDesc(label, showNestedSummaries) {
    if (label === void 0) { label = 'Weighted Sum'; }
    if (showNestedSummaries === void 0) { showNestedSummaries = true; }
    return { type: 'stack', label: label, showNestedSummaries: showNestedSummaries };
}
/**
 * implementation of the stacked column
 */
var StackColumn = /** @class */ (function (_super) {
    __extends(StackColumn, _super);
    function StackColumn(id, desc) {
        var _this = _super.call(this, id, integrateDefaults(desc, {
            renderer: 'stack',
            groupRenderer: 'stack',
            summaryRenderer: 'stack',
        })) || this;
        /**
         * whether this stack column is collapsed i.e. just looks like an ordinary number column
         * @type {boolean}
         * @private
         */
        _this.collapsed = false;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = _this;
        _this.adaptChange = function (oldValue, newValue) {
            that.adaptWidthChange(this.source, oldValue, newValue);
        };
        return _this;
    }
    StackColumn_1 = StackColumn;
    Object.defineProperty(StackColumn.prototype, "label", {
        get: function () {
            var l = _super.prototype.getMetaData.call(this).label;
            var c = this._children;
            if (l !== 'Weighted Sum' || c.length === 0) {
                return l;
            }
            var weights = this.getWeights();
            return c.map(function (c, i) { return "".concat(c.label, " (").concat(round(100 * weights[i], 1), "%)"); }).join(' + ');
        },
        enumerable: false,
        configurable: true
    });
    StackColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            StackColumn_1.EVENT_COLLAPSE_CHANGED,
            StackColumn_1.EVENT_WEIGHTS_CHANGED,
            StackColumn_1.EVENT_MULTI_LEVEL_CHANGED,
        ]);
    };
    StackColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    StackColumn.prototype.setCollapsed = function (value) {
        if (this.collapsed === value) {
            return;
        }
        this.fire([StackColumn_1.EVENT_COLLAPSE_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.collapsed, (this.collapsed = value));
    };
    StackColumn.prototype.getCollapsed = function () {
        return this.collapsed;
    };
    StackColumn.prototype.isShowNestedSummaries = function () {
        return this.desc.showNestedSummaries !== false;
    };
    Object.defineProperty(StackColumn.prototype, "canJustAddNumbers", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    StackColumn.prototype.flatten = function (r, offset, levelsToGo, padding) {
        if (levelsToGo === void 0) { levelsToGo = 0; }
        if (padding === void 0) { padding = 0; }
        var self = null;
        var children = levelsToGo <= Column.FLAT_ALL_COLUMNS ? this._children : this._children.filter(function (c) { return c.isVisible(); });
        //no more levels or just this one
        if (levelsToGo === 0 || levelsToGo <= Column.FLAT_ALL_COLUMNS) {
            var w = this.getWidth();
            if (!this.collapsed) {
                w += (children.length - 1) * padding;
            }
            r.push((self = { col: this, offset: offset, width: w }));
            if (levelsToGo === 0) {
                return w;
            }
        }
        //push children
        var acc = offset;
        children.forEach(function (c) {
            acc += c.flatten(r, acc, levelsToGo - 1, padding) + padding;
        });
        if (self) {
            //nesting my even increase my width
            self.width = acc - offset - padding;
        }
        return acc - offset - padding;
    };
    StackColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.collapsed = this.collapsed;
        return r;
    };
    StackColumn.prototype.restore = function (dump, factory) {
        this.collapsed = dump.collapsed === true;
        _super.prototype.restore.call(this, dump, factory);
    };
    /**
     * inserts a column at a the given position
     */
    StackColumn.prototype.insert = function (col, index, weight) {
        if (weight === void 0) { weight = NaN; }
        if (!Number.isNaN(weight)) {
            col.setWidth((weight / (1 - weight)) * this.getWidth());
        }
        col.on("".concat(Column.EVENT_WIDTH_CHANGED, ".stack"), this.adaptChange);
        //increase my width
        _super.prototype.setWidth.call(this, this.length === 0 ? col.getWidth() : this.getWidth() + col.getWidth());
        return _super.prototype.insert.call(this, col, index);
    };
    StackColumn.prototype.push = function (col, weight) {
        if (weight === void 0) { weight = NaN; }
        return this.insert(col, this.length, weight);
    };
    StackColumn.prototype.insertAfter = function (col, ref, weight) {
        if (weight === void 0) { weight = NaN; }
        var i = this.indexOf(ref);
        if (i < 0) {
            return null;
        }
        return this.insert(col, i + 1, weight);
    };
    /**
     * adapts weights according to an own width change
     * @param col
     * @param oldValue
     * @param newValue
     */
    StackColumn.prototype.adaptWidthChange = function (col, oldValue, newValue) {
        if (similar(oldValue, newValue, 0.5)) {
            return;
        }
        var bak = this.getWeights();
        var full = this.getWidth(), change = (newValue - oldValue) / full;
        var oldWeight = oldValue / full;
        var factor = (1 - oldWeight - change) / (1 - oldWeight);
        var widths = this._children.map(function (c) {
            if (c === col) {
                //c.weight += change;
                return newValue;
            }
            var guess = c.getWidth() * factor;
            var w = Number.isNaN(guess) || guess < 1 ? 0 : guess;
            c.setWidthImpl(w);
            return w;
        });
        //adapt width if needed
        _super.prototype.setWidth.call(this, widths.reduce(function (a, b) { return a + b; }, 0));
        this.fire([
            StackColumn_1.EVENT_WEIGHTS_CHANGED,
            StackColumn_1.EVENT_MULTI_LEVEL_CHANGED,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], bak, this.getWeights());
    };
    StackColumn.prototype.getWeights = function () {
        var w = this.getWidth();
        return this._children.map(function (d) { return d.getWidth() / w; });
    };
    StackColumn.prototype.setWeights = function (weights) {
        var bak = this.getWeights();
        var delta = weights.length - this.length;
        var s;
        if (delta < 0) {
            s = weights.reduce(function (p, a) { return p + a; }, 0);
            if (s <= 1) {
                for (var i = 0; i < -delta; ++i) {
                    weights.push((1 - s) * (1 / -delta));
                }
            }
            else if (s <= 100) {
                for (var i = 0; i < -delta; ++i) {
                    weights.push((100 - s) * (1 / -delta));
                }
            }
        }
        weights = weights.slice(0, this.length);
        s = weights.reduce(function (p, a) { return p + a; }, 0) / this.getWidth();
        weights = weights.map(function (d) { return d / s; });
        this._children.forEach(function (c, i) {
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
    };
    StackColumn.prototype.removeImpl = function (child, index) {
        child.on("".concat(Column.EVENT_WIDTH_CHANGED, ".stack"), null);
        _super.prototype.setWidth.call(this, this.length === 0 ? 100 : this.getWidth() - child.getWidth());
        return _super.prototype.removeImpl.call(this, child, index);
    };
    StackColumn.prototype.setWidth = function (value) {
        var factor = value / this.getWidth();
        this._children.forEach(function (child) {
            //disable since we change it
            child.setWidthImpl(child.getWidth() * factor);
        });
        _super.prototype.setWidth.call(this, value);
    };
    StackColumn.prototype.compute = function (row) {
        var w = this.getWidth();
        // missing value for the stack column if at least one child value is missing
        if (this._children.some(function (d) { return d.getValue(row) === null; })) {
            return null;
        }
        return this._children.reduce(function (acc, d) { return acc + d.getValue(row) * (d.getWidth() / w); }, 0);
    };
    StackColumn.prototype.getRenderer = function () {
        if (this.getCollapsed() && this.isLoaded()) {
            return StackColumn_1.COLLAPSED_RENDERER;
        }
        return _super.prototype.getRenderer.call(this);
    };
    StackColumn.prototype.getExportValue = function (row, format) {
        if (format === 'json') {
            return {
                value: this.getRawNumber(row),
                children: this.children.map(function (d) { return d.getExportValue(row, format); }),
            };
        }
        return _super.prototype.getExportValue.call(this, row, format);
    };
    var StackColumn_1;
    StackColumn.EVENT_COLLAPSE_CHANGED = 'collapseChanged';
    StackColumn.EVENT_WEIGHTS_CHANGED = 'weightsChanged';
    StackColumn.EVENT_MULTI_LEVEL_CHANGED = 'nestedChildRatio';
    StackColumn.COLLAPSED_RENDERER = 'number';
    StackColumn = StackColumn_1 = __decorate([
        toolbar('editWeights', 'compress', 'expand')
    ], StackColumn);
    return StackColumn;
}(CompositeNumberColumn));
export default StackColumn;
//# sourceMappingURL=StackColumn.js.map