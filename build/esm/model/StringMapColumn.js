var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { toolbar } from './annotations';
import MapColumn, {} from './MapColumn';
import { EAlignment } from './StringColumn';
import { isMissingValue } from './missing';
import { integrateDefaults } from './internal';
/**
 * a string column with optional alignment
 */
let StringMapColumn = class StringMapColumn extends MapColumn {
    constructor(id, desc) {
        var _a;
        super(id, integrateDefaults(desc, {
            width: 200,
            renderer: 'map',
        }));
        this.alignment = (_a = desc.alignment) !== null && _a !== void 0 ? _a : EAlignment.left;
        this.escape = desc.escape !== false;
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getValue(row) {
        const r = this.getMapValue(row);
        return r.every((d) => d.value === '') ? null : r;
    }
    getMapValue(row) {
        return super.getMap(row).map(({ key, value }) => ({
            key,
            value: isMissingValue(value) ? '' : String(value),
        }));
    }
};
StringMapColumn = __decorate([
    toolbar('rename', 'search')
], StringMapColumn);
export default StringMapColumn;
