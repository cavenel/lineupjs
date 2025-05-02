var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CategoricalsColumn_1;
import ArrayColumn, {} from './ArrayColumn';
import { toolbar } from './annotations';
import CategoricalColumn from './CategoricalColumn';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import { DEFAULT_COLOR, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, widthChanged, dirtyCaches, } from './Column';
import { toCategories } from './internalCategorical';
/**
 * a string column with optional alignment
 */
let CategoricalsColumn = CategoricalsColumn_1 = class CategoricalsColumn extends ArrayColumn {
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
                if (!kv) {
                    continue;
                }
                categories.add(String(kv));
            }
        });
        this.categories.splice(0, this.categories.length, ...toCategories({ categories: Array.from(categories) }));
        this.categories.forEach((d) => this.lookup.set(d.name, d));
    }
    createEventList() {
        return super.createEventList().concat([CategoricalsColumn_1.EVENT_COLOR_MAPPING_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    getCategories(row) {
        return super.getValues(row).map((v) => {
            if (!v) {
                return null;
            }
            const vs = String(v);
            return this.lookup.has(vs) ? this.lookup.get(vs) : null;
        });
    }
    getColors(row) {
        return this.getCategories(row).map((d) => (d ? this.colorMapping.apply(d) : DEFAULT_COLOR));
    }
    iterCategory(row) {
        return this.getCategories(row);
    }
    getValues(row) {
        return this.getCategories(row).map((v) => (v ? v.name : null));
    }
    getLabels(row) {
        return this.getCategories(row).map((v) => (v ? v.label : ''));
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
};
CategoricalsColumn.EVENT_COLOR_MAPPING_CHANGED = CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED;
CategoricalsColumn = CategoricalsColumn_1 = __decorate([
    toolbar('rename', 'colorMappedCategorical')
], CategoricalsColumn);
export default CategoricalsColumn;
