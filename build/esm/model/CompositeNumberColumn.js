var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { format } from 'd3-format';
import CompositeColumn from './CompositeColumn';
import { isMissingValue } from './missing';
import NumberColumn from './NumberColumn';
import { SortByDefault, toolbar } from './annotations';
/**
 * implementation of a combine column, standard operations how to select
 */
let CompositeNumberColumn = class CompositeNumberColumn extends CompositeColumn {
    constructor(id, desc) {
        super(id, desc);
        this.numberFormat = format('.3n');
        if (desc.numberFormat) {
            this.numberFormat = format(desc.numberFormat);
        }
    }
    getNumberFormat() {
        return this.numberFormat;
    }
    getLabel(row) {
        if (!this.isLoaded()) {
            return '';
        }
        const v = this.getValue(row);
        //keep non number if it is not a number else convert using formatter
        return String(typeof v === 'number' && !Number.isNaN(v) && isFinite(v) ? this.numberFormat(v) : v);
    }
    getValue(row) {
        if (!this.isLoaded()) {
            return null;
        }
        //weighted sum
        const v = this.compute(row);
        if (isMissingValue(v)) {
            return null;
        }
        return v;
    }
    compute(_row) {
        return NaN;
    }
    getNumber(row) {
        const r = this.getValue(row);
        return r == null ? NaN : r;
    }
    getRawNumber(row) {
        return this.getNumber(row);
    }
    iterNumber(row) {
        return [this.getNumber(row)];
    }
    iterRawNumber(row) {
        return [this.getRawNumber(row)];
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
    getRenderer() {
        return NumberColumn.prototype.getRenderer.call(this);
    }
};
CompositeNumberColumn = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'group', 'groupBy'),
    SortByDefault('descending')
], CompositeNumberColumn);
export default CompositeNumberColumn;
