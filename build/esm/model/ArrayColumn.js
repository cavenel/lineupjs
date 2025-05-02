var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Category } from './annotations';
import ValueColumn from './ValueColumn';
import { empty } from '../internal';
let ArrayColumn = class ArrayColumn extends ValueColumn {
    constructor(id, desc) {
        super(id, desc);
        this._dataLength = desc.dataLength == null || Number.isNaN(desc.dataLength) ? null : desc.dataLength;
        this.originalLabels =
            desc.labels || empty(this._dataLength == null ? 0 : this._dataLength).map((_d, i) => `Column ${i}`);
    }
    get labels() {
        return this.originalLabels;
    }
    get dataLength() {
        return this._dataLength;
    }
    getValue(row) {
        const r = this.getValues(row);
        return r.every((d) => d === null) ? null : r;
    }
    getValues(row) {
        const r = super.getValue(row);
        return r == null ? [] : r;
    }
    getLabels(row) {
        return this.getValues(row).map(String);
    }
    getLabel(row) {
        const v = this.getLabels(row);
        if (v.length === 0) {
            return '';
        }
        return v.toString();
    }
    getMap(row) {
        const labels = this.labels;
        return this.getValues(row).map((value, i) => ({ key: labels[i], value }));
    }
    getMapLabel(row) {
        const labels = this.labels;
        return this.getLabels(row).map((value, i) => ({ key: labels[i], value }));
    }
};
ArrayColumn = __decorate([
    Category('array')
], ArrayColumn);
export default ArrayColumn;
