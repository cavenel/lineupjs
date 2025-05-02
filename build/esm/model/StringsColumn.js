var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { toolbar } from './annotations';
import ArrayColumn, {} from './ArrayColumn';
import { EAlignment } from './StringColumn';
import { isMissingValue } from './missing';
import { integrateDefaults } from './internal';
/**
 * a string column with optional alignment
 */
let StringsColumn = class StringsColumn extends ArrayColumn {
    constructor(id, desc) {
        var _a;
        super(id, integrateDefaults(desc, {
            width: 200,
        }));
        this.alignment = (_a = desc.alignment) !== null && _a !== void 0 ? _a : EAlignment.left;
        this.escape = desc.escape !== false;
    }
    getValues(row) {
        return super.getValues(row).map((v) => {
            return isMissingValue(v) ? '' : String(v);
        });
    }
};
StringsColumn = __decorate([
    toolbar('rename', 'search')
], StringsColumn);
export default StringsColumn;
