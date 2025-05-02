var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BooleansColumn_1;
import ArrayColumn, {} from './ArrayColumn';
import CategoricalColumn from './CategoricalColumn';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import { DEFAULT_COLOR, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, widthChanged, dirtyCaches, } from './Column';
import { chooseUIntByDataLength, integrateDefaults } from './internal';
import { toCategory } from './internalCategorical';
import { toolbar } from './annotations';
let BooleansColumn = BooleansColumn_1 = class BooleansColumn extends ArrayColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            renderer: 'upset',
        }));
        this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
    }
    get categories() {
        return this.labels.map((d, i) => toCategory(d, i));
    }
    getSet(row) {
        const vs = this.getValues(row);
        return new Set(this.categories.filter((_, i) => vs[i]));
    }
    toCompareValue(row) {
        const v = this.getValue(row);
        if (v == null) {
            return NaN;
        }
        return v.reduce((a, b) => a + (b ? 1 : 0), 0);
    }
    toCompareValueType() {
        return chooseUIntByDataLength(this.dataLength);
    }
    getCategories(row) {
        const categories = this.categories;
        return super.getValues(row).map((v, i) => {
            return v ? categories[i] : null;
        });
    }
    iterCategory(row) {
        return this.getCategories(row);
    }
    getColors(row) {
        return this.getCategories(row).map((d) => (d ? this.colorMapping.apply(d) : DEFAULT_COLOR));
    }
    createEventList() {
        return super.createEventList().concat([BooleansColumn_1.EVENT_COLOR_MAPPING_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
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
BooleansColumn.EVENT_COLOR_MAPPING_CHANGED = CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED;
BooleansColumn = BooleansColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy')
], BooleansColumn);
export default BooleansColumn;
