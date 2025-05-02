import ColumnBuilder from './ColumnBuilder';
import { cleanCategories } from '../../provider/utils';
import { resolveValue } from '../../internal';
export default class CategoricalColumnBuilder extends ColumnBuilder {
    constructor(column) {
        super('categorical', column);
    }
    /**
     * converts this type to an ordinal column type, such that categories are mapped to numbers
     */
    asOrdinal() {
        this.desc.type = 'ordinal';
        return this;
    }
    /**
     * specify the categories of this categorical column
     * @param {(string | Partial<ICategory>)[]} categories
     */
    categories(categories) {
        this.desc.categories = categories;
        return this;
    }
    /**
     * converts this type to a set column, i.e. multiple unique category in a value
     * @param {string} separator optional separator separating a string value
     */
    asSet(separator) {
        if (separator) {
            this.desc.separator = separator;
        }
        this.desc.type = 'set';
        return this;
    }
    derive(data) {
        // derive categories
        const categories = new Set();
        const isSet = this.desc.type === 'set';
        const separator = this.desc.separator || ';';
        const val = (vi) => {
            if (typeof vi === 'string' && vi !== '') {
                return vi;
            }
            if (vi != null && typeof vi.value === 'string' && vi.value !== '') {
                return vi.value;
            }
            return null;
        };
        const col = this.desc.column;
        data.forEach((d) => {
            const v = resolveValue(d, col);
            if (Array.isArray(v)) {
                v.forEach((vi) => categories.add(val(vi)));
            }
            else if (v != null && v !== '') {
                const vs = isSet ? [v.toString()] : v.toString().split(separator);
                vs.forEach((vi) => categories.add(val(vi)));
            }
        });
        this.categories(cleanCategories(categories));
    }
    build(data) {
        if (!this.desc.categories) {
            this.derive(data);
        }
        return super.build(data);
    }
}
/**
 * build a categorical column type
 * @param {string} column column which contains the associated data
 * @param {(string | Partial<ICategory>)[]} categories optional category definition
 * @returns {CategoricalColumnBuilder}
 */
export function buildCategoricalColumn(column, categories) {
    const r = new CategoricalColumnBuilder(column);
    if (categories) {
        r.categories(categories);
    }
    return r;
}
