var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LinksColumn_1;
import { toolbar } from './annotations';
import ArrayColumn, {} from './ArrayColumn';
import { patternFunction, integrateDefaults } from './internal';
import { EAlignment } from './StringColumn';
import LinkColumn, {} from './LinkColumn';
let LinksColumn = LinksColumn_1 = class LinksColumn extends ArrayColumn {
    constructor(id, desc) {
        var _a, _b, _c;
        super(id, integrateDefaults(desc, {
            width: 200,
        }));
        this.patternFunction = null;
        this.alignment = (_a = desc.alignment) !== null && _a !== void 0 ? _a : EAlignment.left;
        this.escape = desc.escape !== false;
        this.pattern = (_b = desc.pattern) !== null && _b !== void 0 ? _b : '';
        this.patternTemplates = (_c = desc.patternTemplates) !== null && _c !== void 0 ? _c : [];
    }
    setPattern(pattern) {
        return LinkColumn.prototype.setPattern.call(this, pattern);
    }
    getPattern() {
        return this.pattern;
    }
    createEventList() {
        return super.createEventList().concat([LinksColumn_1.EVENT_PATTERN_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getValues(row) {
        return this.getLinks(row).map((d) => (d ? d.href : ''));
    }
    getLabels(row) {
        return this.getLinks(row).map((d) => (d ? d.alt : ''));
    }
    transformValue(v, row, i) {
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
                this.patternFunction = patternFunction(this.pattern, 'item', 'index');
            }
            return {
                alt: v,
                href: this.patternFunction.call(this, v, row.v, i),
            };
        }
        return v;
    }
    getLinks(row) {
        return super.getValues(row).map((v, i) => {
            return this.transformValue(v, row, i);
        });
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
LinksColumn.EVENT_PATTERN_CHANGED = LinkColumn.EVENT_PATTERN_CHANGED;
LinksColumn = LinksColumn_1 = __decorate([
    toolbar('rename', 'search', 'editPattern')
], LinksColumn);
export default LinksColumn;
