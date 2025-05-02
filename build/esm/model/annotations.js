import 'reflect-metadata';
const supportType = Symbol.for('SupportType');
const category = Symbol.for('Category');
export function SupportType() {
    return Reflect.metadata(supportType, true);
}
export function SortByDefault(order = 'ascending') {
    if (order === 'descending') {
        return Reflect.metadata(Symbol.for('sortDescendingByDefault'), true);
    }
    return (d) => d;
}
export function isSortingAscByDefault(col) {
    const clazz = col.constructor;
    return !Reflect.hasMetadata(Symbol.for('sortDescendingByDefault'), clazz);
}
export class Categories {
    constructor() {
        this.string = { label: 'label', order: 1, name: 'string', featureLevel: 'basic' };
        this.categorical = { label: 'categorical', order: 2, name: 'categorical', featureLevel: 'basic' };
        this.number = { label: 'numerical', order: 3, name: 'number', featureLevel: 'basic' };
        this.date = { label: 'date', order: 4, name: 'date', featureLevel: 'basic' };
        this.array = { label: 'matrix', order: 5, name: 'array', featureLevel: 'advanced' };
        this.map = { label: 'map', order: 6, name: 'map', featureLevel: 'advanced' };
        this.composite = { label: 'combined', order: 7, name: 'composite', featureLevel: 'advanced' };
        this.support = { label: 'support', order: 8, name: 'support', featureLevel: 'advanced' };
        this.other = { label: 'others', order: 9, name: 'other', featureLevel: 'advanced' };
    }
}
export const categories = new Categories();
export function Category(cat) {
    return Reflect.metadata(category, cat);
}
export function getSortType(col) {
    const cat = categoryOf(col);
    const type = col.desc.type;
    if (cat === categories.string || cat === categories.categorical) {
        return 'abc';
    }
    if (cat === categories.number || type === 'rank' || isSortingAscByDefault(col)) {
        return 'num';
    }
    const numbers = new Set(['rank', 'number', 'numbers', 'ordinal', 'boxplot', 'script', 'reduce', 'stack']);
    return numbers.has(type) ? 'num' : undefined;
}
export function toolbar(...keys) {
    return Reflect.metadata(Symbol.for('toolbarIcon'), keys);
}
export function dialogAddons(key, ...keys) {
    return Reflect.metadata(Symbol.for(`toolbarDialogAddon${key}`), keys);
}
export function isSupportType(col) {
    const clazz = col.constructor;
    return Reflect.hasMetadata(supportType, clazz);
}
export function categoryOf(col) {
    var _a, _b;
    const cat = ((_a = Reflect.getMetadata(category, typeof col === 'function' ? col : Object.getPrototypeOf(col).constructor)) !== null && _a !== void 0 ? _a : 'other');
    return ((_b = categories[cat]) !== null && _b !== void 0 ? _b : categories.other);
}
export function categoryOfDesc(col, models) {
    const type = typeof col === 'string' ? col : col.type;
    const clazz = models[type];
    return clazz ? categoryOf(clazz) : categories.other;
}
