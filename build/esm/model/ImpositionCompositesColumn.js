var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImpositionCompositesColumn_1;
import { suffix } from '../internal';
import { toolbar, dialogAddons, SortByDefault } from './annotations';
import { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, dirtyCaches, DEFAULT_COLOR, } from './Column';
import CompositeColumn, { addColumn, filterChanged, moveColumn, removeColumn } from './CompositeColumn';
import { EAdvancedSortMethod, isNumbersColumn, isMapAbleColumn, } from './INumberColumn';
import { ScaleMappingFunction } from './MappingFunction';
import NumbersColumn from './NumbersColumn';
import { DEFAULT_COLOR_FUNCTION } from './ColorMappingFunction';
import { DEFAULT_FORMATTER, noNumberFilter } from './internalNumber';
import { integrateDefaults } from './internal';
/**
 *  factory for creating a description creating a max column
 * @param label
 * @returns {{type: string, label: string}}
 */
export function createImpositionsDesc(label = 'Imposition') {
    return { type: 'impositions', label };
}
/**
 * implementation of a combine column, standard operations how to select
 */
let ImpositionCompositesColumn = ImpositionCompositesColumn_1 = class ImpositionCompositesColumn extends CompositeColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            renderer: 'numbers',
            groupRenderer: 'numbers',
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
        return this._children.find(isNumbersColumn) || null;
    }
    get rest() {
        const w = this.wrapper;
        return this._children.filter((d) => d !== w);
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
        return `${w ? w.getLabel(row) : '?'} (${rest.map((c) => `${c.label} = ${c.getLabel(row)}`)})`;
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
    createEventList() {
        return super
            .createEventList()
            .concat([
            ImpositionCompositesColumn_1.EVENT_MAPPING_CHANGED,
            ImpositionCompositesColumn_1.EVENT_COLOR_MAPPING_CHANGED,
        ]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    get labels() {
        const w = this.wrapper;
        return w ? w.labels : [];
    }
    get dataLength() {
        const w = this.wrapper;
        return w ? w.dataLength : null;
    }
    getNumberFormat() {
        const w = this.wrapper;
        return w ? w.getNumberFormat() : DEFAULT_FORMATTER;
    }
    getValue(row) {
        const w = this.wrapper;
        return w ? w.getValue(row) : [];
    }
    getNumber(row) {
        const w = this.wrapper;
        return w ? w.getNumber(row) : NaN;
    }
    getRawNumber(row) {
        const w = this.wrapper;
        return w ? w.getRawNumber(row) : NaN;
    }
    getExportValue(row, format) {
        if (format === 'json') {
            const value = this.getRawNumber(row);
            if (Number.isNaN(value)) {
                return null;
            }
            return {
                label: this.getLabels(row),
                color: this.getColor(row),
            };
        }
        return super.getExportValue(row, format);
    }
    getNumbers(row) {
        const w = this.wrapper;
        return w ? w.getNumbers(row) : [];
    }
    getRawNumbers(row) {
        const w = this.wrapper;
        return w ? w.getRawNumbers(row) : [];
    }
    iterNumber(row) {
        return this.getNumbers(row);
    }
    iterRawNumber(row) {
        return this.getRawNumbers(row);
    }
    getBoxPlotData(row) {
        const w = this.wrapper;
        return w ? w.getBoxPlotData(row) : null;
    }
    getRawBoxPlotData(row) {
        const w = this.wrapper;
        return w ? w.getRawBoxPlotData(row) : null;
    }
    getMapping() {
        const w = this.wrapper;
        return w ? w.getMapping() : new ScaleMappingFunction();
    }
    getOriginalMapping() {
        const w = this.wrapper;
        return w ? w.getOriginalMapping() : new ScaleMappingFunction();
    }
    getSortMethod() {
        const w = this.wrapper;
        return w ? w.getSortMethod() : EAdvancedSortMethod.min;
    }
    setSortMethod(value) {
        const w = this.wrapper;
        return w ? w.setSortMethod(value) : undefined;
    }
    setMapping(mapping) {
        const w = this.wrapper;
        return w ? w.setMapping(mapping) : undefined;
    }
    getColorMapping() {
        const w = this.wrapper;
        return w ? w.getColorMapping() : DEFAULT_COLOR_FUNCTION;
    }
    setColorMapping(mapping) {
        const w = this.wrapper;
        return w ? w.setColorMapping(mapping) : undefined;
    }
    getFilter() {
        const w = this.wrapper;
        return w ? w.getFilter() : noNumberFilter();
    }
    setFilter(value) {
        const w = this.wrapper;
        return w ? w.setFilter(value) : undefined;
    }
    getRange() {
        const w = this.wrapper;
        return w ? w.getRange() : ['0', '1'];
    }
    getMap(row) {
        const w = this.wrapper;
        return w ? w.getMap(row) : [];
    }
    getMapLabel(row) {
        const w = this.wrapper;
        return w ? w.getMapLabel(row) : [];
    }
    getLabels(row) {
        const w = this.wrapper;
        return w ? w.getLabels(row) : [];
    }
    getValues(row) {
        const w = this.wrapper;
        return w ? w.getValues(row) : [];
    }
    toCompareValue(row) {
        return NumbersColumn.prototype.toCompareValue.call(this, row);
    }
    toCompareValueType() {
        return NumbersColumn.prototype.toCompareValueType.call(this);
    }
    toCompareGroupValue(rows, group) {
        return NumbersColumn.prototype.toCompareGroupValue.call(this, rows, group);
    }
    toCompareGroupValueType() {
        return NumbersColumn.prototype.toCompareGroupValueType.call(this);
    }
    insert(col, index) {
        if (this._children.length === 1 && !this.wrapper && !isNumbersColumn(col)) {
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
        if (isNumbersColumn(col)) {
            this.forward(col, ...suffix('.impose', NumbersColumn.EVENT_MAPPING_CHANGED));
        }
        if (isMapAbleColumn(col)) {
            this.forward(col, ...suffix('.impose', NumbersColumn.EVENT_COLOR_MAPPING_CHANGED));
        }
        return super.insertImpl(col, index);
    }
    removeImpl(child, index) {
        if (isNumbersColumn(child)) {
            this.unforward(child, ...suffix('.impose', NumbersColumn.EVENT_MAPPING_CHANGED));
        }
        if (isMapAbleColumn(child)) {
            this.unforward(child, ...suffix('.impose', NumbersColumn.EVENT_COLOR_MAPPING_CHANGED));
        }
        return super.removeImpl(child, index);
    }
};
ImpositionCompositesColumn.EVENT_MAPPING_CHANGED = NumbersColumn.EVENT_MAPPING_CHANGED;
ImpositionCompositesColumn.EVENT_COLOR_MAPPING_CHANGED = NumbersColumn.EVENT_COLOR_MAPPING_CHANGED;
ImpositionCompositesColumn = ImpositionCompositesColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'filterNumber', 'colorMapped', 'editMapping'),
    dialogAddons('sort', 'sortNumbers'),
    SortByDefault('descending')
], ImpositionCompositesColumn);
export default ImpositionCompositesColumn;
