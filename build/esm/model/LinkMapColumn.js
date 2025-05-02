var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { toolbar } from './annotations';
import { patternFunction, integrateDefaults } from './internal';
import MapColumn, {} from './MapColumn';
import LinkColumn, {} from './LinkColumn';
import { EAlignment } from './StringColumn';
/**
 * a string column with optional alignment
 */
let LinkMapColumn = class LinkMapColumn extends MapColumn {
    constructor(id, desc) {
        var _a, _b, _c;
        super(id, integrateDefaults(desc, {
            width: 200,
            renderer: 'map',
        }));
        this.patternFunction = null;
        this.alignment = (_a = desc.alignment) !== null && _a !== void 0 ? _a : EAlignment.left;
        this.escape = desc.escape !== false;
        this.pattern = (_b = desc.pattern) !== null && _b !== void 0 ? _b : '';
        this.patternTemplates = (_c = desc.patternTemplates) !== null && _c !== void 0 ? _c : [];
    }
    setPattern(pattern) {
        LinkColumn.prototype.setPattern.call(this, pattern);
    }
    getPattern() {
        return this.pattern;
    }
    createEventList() {
        return super.createEventList().concat([LinkColumn.EVENT_PATTERN_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getValue(row) {
        const r = this.getLinkMap(row);
        return r.every((d) => d.value == null)
            ? null
            : r.map(({ key, value }) => ({
                key,
                value: value ? value.href : '',
            }));
    }
    getLabels(row) {
        return this.getLinkMap(row).map(({ key, value }) => ({
            key,
            value: value ? value.alt : '',
        }));
    }
    getLinkMap(row) {
        return super.getMap(row).map(({ key, value }) => ({
            key,
            value: this.transformValue(value, row, key),
        }));
    }
    transformValue(v, row, key) {
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
                this.patternFunction = patternFunction(this.pattern, 'item', 'key');
            }
            return {
                alt: v,
                href: this.patternFunction.call(this, v, row.v, key),
            };
        }
        return v;
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        if (this.pattern !== this.desc.pattern) {
            r.pattern = this.pattern;
        }
        return r;
    }
    restore(dump, factory) {
        if (dump.pattern) {
            this.pattern = dump.pattern;
        }
        super.restore(dump, factory);
    }
};
LinkMapColumn.EVENT_PATTERN_CHANGED = LinkColumn.EVENT_PATTERN_CHANGED;
LinkMapColumn = __decorate([
    toolbar('rename', 'search', 'editPattern')
], LinkMapColumn);
export default LinkMapColumn;
