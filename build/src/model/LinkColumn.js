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
import { Category, toolbar, dialogAddons } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import { patternFunction, integrateDefaults } from './internal';
import ValueColumn from './ValueColumn';
import { EAlignment, EStringGroupCriteriaType, } from './StringColumn';
import StringColumn from './StringColumn';
/**
 * a string column with optional alignment
 */
var LinkColumn = /** @class */ (function (_super) {
    __extends(LinkColumn, _super);
    function LinkColumn(id, desc) {
        var _a;
        var _this = _super.call(this, id, integrateDefaults(desc, Object.assign({
            width: 200,
        }, desc.pattern
            ? {
                renderer: 'link',
                groupRenderer: 'link',
            }
            : {}))) || this;
        _this.patternFunction = null;
        _this.currentFilter = null;
        _this.currentGroupCriteria = {
            type: EStringGroupCriteriaType.startsWith,
            values: [],
        };
        _this.alignment = (_a = desc.alignment) !== null && _a !== void 0 ? _a : EAlignment.left;
        _this.escape = desc.escape !== false;
        _this.pattern = desc.pattern || '';
        _this.patternTemplates = desc.patternTemplates || [];
        return _this;
    }
    LinkColumn_1 = LinkColumn;
    LinkColumn.prototype.setPattern = function (pattern) {
        if (pattern === this.pattern) {
            return;
        }
        this.patternFunction = null; // reset cache
        this.fire([
            LinkColumn_1.EVENT_PATTERN_CHANGED,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_CACHES,
            Column.EVENT_DIRTY,
        ], this.pattern, (this.pattern = pattern));
    };
    LinkColumn.prototype.getPattern = function () {
        return this.pattern;
    };
    LinkColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([LinkColumn_1.EVENT_PATTERN_CHANGED, LinkColumn_1.EVENT_GROUPING_CHANGED, LinkColumn_1.EVENT_FILTER_CHANGED]);
    };
    LinkColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    LinkColumn.prototype.getValue = function (row) {
        var l = this.getLink(row);
        return l == null ? null : l.href;
    };
    LinkColumn.prototype.getLink = function (row) {
        var v = _super.prototype.getValue.call(this, row);
        return this.transformValue(v, row);
    };
    LinkColumn.prototype.transformValue = function (v, row) {
        if (v == null || v === '') {
            return null;
        }
        if (typeof v === 'string') {
            if (!this.pattern) {
                return {
                    alt: v,
                    href: v,
                };
            }
            if (!this.patternFunction) {
                this.patternFunction = patternFunction(this.pattern, 'item');
            }
            return {
                alt: v,
                href: this.patternFunction.call(this, v, row.v),
            };
        }
        return v;
    };
    LinkColumn.prototype.getLabel = function (row) {
        var l = this.getLink(row);
        return l == null ? '' : l.alt;
    };
    LinkColumn.prototype.dump = function (toDescRef) {
        var r = StringColumn.prototype.dump.call(this, toDescRef);
        if (this.pattern !== this.desc.pattern) {
            r.pattern = this.pattern;
        }
        return r;
    };
    LinkColumn.prototype.restore = function (dump, factory) {
        StringColumn.prototype.restore.call(this, dump, factory);
        if (dump.pattern) {
            this.pattern = dump.pattern;
        }
    };
    LinkColumn.prototype.isFiltered = function () {
        return this.currentFilter != null;
    };
    LinkColumn.prototype.filter = function (row) {
        return StringColumn.prototype.filter.call(this, row);
    };
    LinkColumn.prototype.getFilter = function () {
        return this.currentFilter;
    };
    LinkColumn.prototype.setFilter = function (filter) {
        return StringColumn.prototype.setFilter.call(this, filter);
    };
    LinkColumn.prototype.clearFilter = function () {
        return StringColumn.prototype.clearFilter.call(this);
    };
    LinkColumn.prototype.getGroupCriteria = function () {
        return this.currentGroupCriteria;
    };
    LinkColumn.prototype.setGroupCriteria = function (value) {
        return StringColumn.prototype.setGroupCriteria.call(this, value);
    };
    LinkColumn.prototype.toCompareValue = function (a) {
        return StringColumn.prototype.toCompareValue.call(this, a);
    };
    LinkColumn.prototype.toCompareValueType = function () {
        return StringColumn.prototype.toCompareValueType.call(this);
    };
    LinkColumn.prototype.toCompareGroupValue = function (rows, group) {
        return StringColumn.prototype.toCompareGroupValue.call(this, rows, group);
    };
    LinkColumn.prototype.toCompareGroupValueType = function () {
        return StringColumn.prototype.toCompareGroupValueType.call(this);
    };
    LinkColumn.prototype.group = function (row) {
        return StringColumn.prototype.group.call(this, row);
    };
    var LinkColumn_1;
    LinkColumn.EVENT_FILTER_CHANGED = StringColumn.EVENT_FILTER_CHANGED;
    LinkColumn.EVENT_GROUPING_CHANGED = StringColumn.EVENT_GROUPING_CHANGED;
    LinkColumn.EVENT_PATTERN_CHANGED = 'patternChanged';
    LinkColumn = LinkColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'search', 'groupBy', 'filterString', 'editPattern'),
        dialogAddons('group', 'groupString'),
        Category('string')
    ], LinkColumn);
    return LinkColumn;
}(ValueColumn));
export default LinkColumn;
//# sourceMappingURL=LinkColumn.js.map