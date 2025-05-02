var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImpositionCompositeColumn_1;
import { suffix } from '../internal';
import { toolbar, SortByDefault } from './annotations';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, DEFAULT_COLOR, } from './Column';
import CompositeColumn, { addColumn, filterChanged, moveColumn, removeColumn } from './CompositeColumn';
import { isNumberColumn, isMapAbleColumn, } from './INumberColumn';
import NumberColumn from './NumberColumn';
import { DEFAULT_FORMATTER, noNumberFilter } from './internalNumber';
import { ScaleMappingFunction } from './MappingFunction';
import { DEFAULT_COLOR_FUNCTION } from './ColorMappingFunction';
import { integrateDefaults } from './internal';
/**
 *  factory for creating a description creating a max column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createImpositionDesc(label = 'Imposition') {
    return { type: 'imposition', label };
}
/**
 * implementation of a combine column, standard operations how to select
 */
let ImpositionCompositeColumn = ImpositionCompositeColumn_1 = class ImpositionCompositeColumn extends CompositeColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            renderer: 'number',
            groupRenderer: 'boxplot',
            summaryRenderer: 'histogram',
        }));
    }
    get label() {
        const l = super.getMetaData().label;
        const c = this._children;
        if (l !== 'Imposition' || c.length === 0) {
            return l;
        }
        if (c.length === 1) {
            return c[0].label;
        }
        const w = this.wrapper;
        const rest = this.rest;
        return `${w ? w.label : '?'} (${rest.map((c) => c.label).join(', ')})`;
    }
    get wrapper() {
        var _a;
        return (_a = this._children.find(isNumberColumn)) !== null && _a !== void 0 ? _a : null;
    }
    get rest() {
        const w = this.wrapper;
        return this._children.filter((d) => d !== w);
    }
    createEventList() {
        return super
            .createEventList()
            .concat([ImpositionCompositeColumn_1.EVENT_MAPPING_CHANGED, ImpositionCompositeColumn_1.EVENT_COLOR_MAPPING_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getLabel(row) {
        const c = this._children;
        if (c.length === 0) {
            return '';
        }
        if (c.length === 1) {
            return c[0].getLabel(row);
        }
        const w = this.wrapper;
        const rest = this.rest;
        return `${w ? w.getLabel(row) : '?'} (${rest.map((c) => `${c.label} = ${c.getLabel(row)}`).join(', ')})`;
    }
    getColor(row) {
        const c = this._children;
        switch (c.length) {
            case 0:
                return DEFAULT_COLOR;
            case 1:
                return c[0].getColor(row);
            default:
                return this.rest[0].getColor(row);
        }
    }
    getNumberFormat() {
        const w = this.wrapper;
        return w ? w.getNumberFormat() : DEFAULT_FORMATTER;
    }
    getValue(row) {
        const w = this.wrapper;
        return w ? w.getValue(row) : NaN;
    }
    getNumber(row) {
        const w = this.wrapper;
        return w ? w.getNumber(row) : NaN;
    }
    getRawNumber(row) {
        const w = this.wrapper;
        return w ? w.getRawNumber(row) : NaN;
    }
    iterNumber(row) {
        return [this.getNumber(row)];
    }
    iterRawNumber(row) {
        return [this.getRawNumber(row)];
    }
    getExportValue(row, format) {
        if (format === 'json') {
            const value = this.getRawNumber(row);
            if (Number.isNaN(value)) {
                return null;
            }
            return {
                label: this.getLabel(row),
                color: this.getColor(row),
                value,
            };
        }
        return super.getExportValue(row, format);
    }
    getMapping() {
        const w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.getMapping() : new ScaleMappingFunction();
    }
    getOriginalMapping() {
        const w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.getOriginalMapping() : new ScaleMappingFunction();
    }
    setMapping(mapping) {
        const w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.setMapping(mapping) : undefined;
    }
    getColorMapping() {
        const w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.getColorMapping() : DEFAULT_COLOR_FUNCTION;
    }
    setColorMapping(mapping) {
        const w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.setColorMapping(mapping) : undefined;
    }
    getFilter() {
        const w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.getFilter() : noNumberFilter();
    }
    setFilter(value) {
        const w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.setFilter(value) : undefined;
    }
    getRange() {
        const w = this.wrapper;
        return w && isMapAbleColumn(w) ? w.getRange() : ['0', '1'];
    }
    toCompareValue(row) {
        return NumberColumn.prototype.toCompareValue.call(this, row);
    }
    toCompareValueType() {
        return NumberColumn.prototype.toCompareValueType.call(this);
    }
    toCompareGroupValue(rows, group) {
        return NumberColumn.prototype.toCompareGroupValue.call(this, rows, group);
    }
    toCompareGroupValueType() {
        return NumberColumn.prototype.toCompareGroupValueType.call(this);
    }
    insert(col, index) {
        if (this._children.length === 1 && !this.wrapper && !isNumberColumn(col)) {
            // at least one has to be a number column
            return null;
        }
        if (this._children.length >= 2) {
            // limit to two
            return null;
        }
        return super.insert(col, index);
    }
    insertImpl(col, index) {
        if (isNumberColumn(col)) {
            this.forward(col, ...suffix('.impose', NumberColumn.EVENT_MAPPING_CHANGED));
        }
        if (isMapAbleColumn(col)) {
            this.forward(col, ...suffix('.impose', NumberColumn.EVENT_COLOR_MAPPING_CHANGED));
        }
        return super.insertImpl(col, index);
    }
    removeImpl(child, index) {
        if (isNumberColumn(child)) {
            this.unforward(child, ...suffix('.impose', NumberColumn.EVENT_MAPPING_CHANGED));
        }
        if (isMapAbleColumn(child)) {
            this.unforward(child, ...suffix('.impose', NumberColumn.EVENT_COLOR_MAPPING_CHANGED));
        }
        return super.removeImpl(child, index);
    }
};
ImpositionCompositeColumn.EVENT_MAPPING_CHANGED = NumberColumn.EVENT_MAPPING_CHANGED;
ImpositionCompositeColumn.EVENT_COLOR_MAPPING_CHANGED = NumberColumn.EVENT_COLOR_MAPPING_CHANGED;
ImpositionCompositeColumn = ImpositionCompositeColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'filterNumber', 'colorMapped', 'editMapping'),
    SortByDefault('descending')
], ImpositionCompositeColumn);
export default ImpositionCompositeColumn;
