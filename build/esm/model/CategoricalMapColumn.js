var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CategoricalMapColumn_1;
import MapColumn, {} from './MapColumn';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import CategoricalColumn from './CategoricalColumn';
import { DEFAULT_COLOR, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, widthChanged, dirtyCaches, } from './Column';
import { toolbar } from './annotations';
import { toCategories } from './internalCategorical';
let CategoricalMapColumn = CategoricalMapColumn_1 = class CategoricalMapColumn extends MapColumn {
    constructor(id, desc) {
        super(id, desc);
        this.lookup = new Map();
        this.categories = toCategories(desc);
        this.categories.forEach((d) => this.lookup.set(d.name, d));
        this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
    }
    onDataUpdate(rows) {
        super.onDataUpdate(rows);
        if (this.desc.categories) {
            return;
        }
        // derive
        const categories = new Set();
        rows.forEach((row) => {
            const value = super.getValue(row);
            if (!value || !Array.isArray(value) || value.length === 0) {
                return;
            }
            for (const kv of value) {
                if (!kv || !kv.value) {
                    continue;
                }
                categories.add(String(kv.value));
            }
        });
        this.categories.splice(0, this.categories.length, ...toCategories({ categories: Array.from(categories) }));
        this.categories.forEach((d) => this.lookup.set(d.name, d));
    }
    createEventList() {
        return super.createEventList().concat([CategoricalMapColumn_1.EVENT_COLOR_MAPPING_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    parseValue(v) {
        if (!v) {
            return null;
        }
        const vs = String(v);
        return this.lookup.has(vs) ? this.lookup.get(vs) : null;
    }
    getCategoryMap(row) {
        return super.getMap(row).map(({ key, value }) => ({
            key,
            value: this.parseValue(value),
        }));
    }
    getCategories(row) {
        return this.getCategoryMap(row).map((d) => d.value);
    }
    getColors(row) {
        return this.getCategoryMap(row).map(({ key, value }) => ({
            key,
            value: value ? this.colorMapping.apply(value) : DEFAULT_COLOR,
        }));
    }
    getValue(row) {
        const r = this.getCategoryMap(row);
        return r.length === 0
            ? null
            : r.map(({ key, value }) => ({
                key,
                value: value ? value.name : null,
            }));
    }
    getLabels(row) {
        return this.getCategoryMap(row).map(({ key, value }) => ({
            key,
            value: value ? value.label : '',
        }));
    }
    getColorMapping() {
        return this.colorMapping.clone();
    }
    setColorMapping(mapping) {
        return CategoricalColumn.prototype.setColorMapping.call(this, mapping);
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.colorMapping = this.colorMapping.toJSON();
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        this.colorMapping = factory.categoricalColorMappingFunction(dump.colorMapping, this.categories);
    }
    iterCategory(row) {
        return this.getCategories(row);
    }
};
CategoricalMapColumn.EVENT_COLOR_MAPPING_CHANGED = CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED;
CategoricalMapColumn = CategoricalMapColumn_1 = __decorate([
    toolbar('rename', 'colorMappedCategorical')
], CategoricalMapColumn);
export default CategoricalMapColumn;
