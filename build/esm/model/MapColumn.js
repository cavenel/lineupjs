var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Category } from './annotations';
import ValueColumn from './ValueColumn';
import { integrateDefaults } from './internal';
let MapColumn = class MapColumn extends ValueColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            width: 200,
        }));
    }
    getValue(row) {
        const r = this.getMap(row);
        return r.length === 0 ? null : r;
    }
    getLabels(row) {
        const v = this.getMap(row);
        return v.map(({ key, value }) => ({ key, value: String(value) }));
    }
    getMap(row) {
        return toKeyValue(super.getValue(row));
    }
    getMapLabel(row) {
        return this.getLabels(row);
    }
    getLabel(row) {
        const v = this.getLabels(row);
        return `{${v.map(({ key, value }) => `${key}: ${value}`).join(', ')}}`;
    }
};
MapColumn = __decorate([
    Category('map')
], MapColumn);
export default MapColumn;
function byKey(a, b) {
    if (a === b) {
        return 0;
    }
    return a.key.localeCompare(b.key);
}
function toKeyValue(v) {
    if (!v) {
        return [];
    }
    if (v instanceof Map) {
        return Array.from(v.entries())
            .map(([key, value]) => ({ key, value }))
            .sort(byKey);
    }
    if (Array.isArray(v)) {
        return v; // keep original order
    }
    // object
    return Object.keys(v)
        .map((key) => ({ key, value: v[key] }))
        .sort(byKey);
}
