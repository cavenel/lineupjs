var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LinkColumn_1;
import { Category, toolbar, dialogAddons } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, } from './Column';
import { patternFunction, integrateDefaults } from './internal';
import ValueColumn from './ValueColumn';
import { EAlignment, EStringGroupCriteriaType, } from './StringColumn';
import StringColumn from './StringColumn';
/**
 * a string column with optional alignment
 */
let LinkColumn = LinkColumn_1 = class LinkColumn extends ValueColumn {
    constructor(id, desc) {
        var _a;
        super(id, integrateDefaults(desc, Object.assign({
            width: 200,
        }, desc.pattern
            ? {
                renderer: 'link',
                groupRenderer: 'link',
            }
            : {})));
        this.patternFunction = null;
        this.currentFilter = null;
        this.currentGroupCriteria = {
            type: EStringGroupCriteriaType.startsWith,
            values: [],
        };
        this.alignment = (_a = desc.alignment) !== null && _a !== void 0 ? _a : EAlignment.left;
        this.escape = desc.escape !== false;
        this.pattern = desc.pattern || '';
        this.patternTemplates = desc.patternTemplates || [];
    }
    setPattern(pattern) {
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
    }
    getPattern() {
        return this.pattern;
    }
    createEventList() {
        return super
            .createEventList()
            .concat([LinkColumn_1.EVENT_PATTERN_CHANGED, LinkColumn_1.EVENT_GROUPING_CHANGED, LinkColumn_1.EVENT_FILTER_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getValue(row) {
        const l = this.getLink(row);
        return l == null ? null : l.href;
    }
    getLink(row) {
        const v = super.getValue(row);
        return this.transformValue(v, row);
    }
    transformValue(v, row) {
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
    }
    getLabel(row) {
        const l = this.getLink(row);
        return l == null ? '' : l.alt;
    }
    dump(toDescRef) {
        const r = StringColumn.prototype.dump.call(this, toDescRef);
        if (this.pattern !== this.desc.pattern) {
            r.pattern = this.pattern;
        }
        return r;
    }
    restore(dump, factory) {
        StringColumn.prototype.restore.call(this, dump, factory);
        if (dump.pattern) {
            this.pattern = dump.pattern;
        }
    }
    isFiltered() {
        return this.currentFilter != null;
    }
    filter(row) {
        return StringColumn.prototype.filter.call(this, row);
    }
    getFilter() {
        return this.currentFilter;
    }
    setFilter(filter) {
        return StringColumn.prototype.setFilter.call(this, filter);
    }
    clearFilter() {
        return StringColumn.prototype.clearFilter.call(this);
    }
    getGroupCriteria() {
        return this.currentGroupCriteria;
    }
    setGroupCriteria(value) {
        return StringColumn.prototype.setGroupCriteria.call(this, value);
    }
    toCompareValue(a) {
        return StringColumn.prototype.toCompareValue.call(this, a);
    }
    toCompareValueType() {
        return StringColumn.prototype.toCompareValueType.call(this);
    }
    toCompareGroupValue(rows, group) {
        return StringColumn.prototype.toCompareGroupValue.call(this, rows, group);
    }
    toCompareGroupValueType() {
        return StringColumn.prototype.toCompareGroupValueType.call(this);
    }
    group(row) {
        return StringColumn.prototype.group.call(this, row);
    }
};
LinkColumn.EVENT_FILTER_CHANGED = StringColumn.EVENT_FILTER_CHANGED;
LinkColumn.EVENT_GROUPING_CHANGED = StringColumn.EVENT_GROUPING_CHANGED;
LinkColumn.EVENT_PATTERN_CHANGED = 'patternChanged';
LinkColumn = LinkColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'search', 'groupBy', 'filterString', 'editPattern'),
    dialogAddons('group', 'groupString'),
    Category('string')
], LinkColumn);
export default LinkColumn;
