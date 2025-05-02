import 'reflect-metadata';
var supportType = Symbol.for('SupportType');
var category = Symbol.for('Category');
export function SupportType() {
    return Reflect.metadata(supportType, true);
}
export function SortByDefault(order) {
    if (order === void 0) { order = 'ascending'; }
    if (order === 'descending') {
        return Reflect.metadata(Symbol.for('sortDescendingByDefault'), true);
    }
    return function (d) { return d; };
}
export function isSortingAscByDefault(col) {
    var clazz = col.constructor;
    return !Reflect.hasMetadata(Symbol.for('sortDescendingByDefault'), clazz);
}
var Categories = /** @class */ (function () {
    function Categories() {
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
    return Categories;
}());
export { Categories };
export var categories = new Categories();
export function Category(cat) {
    return Reflect.metadata(category, cat);
}
export function getSortType(col) {
    var cat = categoryOf(col);
    var type = col.desc.type;
    if (cat === categories.string || cat === categories.categorical) {
        return 'abc';
    }
    if (cat === categories.number || type === 'rank' || isSortingAscByDefault(col)) {
        return 'num';
    }
    var numbers = new Set(['rank', 'number', 'numbers', 'ordinal', 'boxplot', 'script', 'reduce', 'stack']);
    return numbers.has(type) ? 'num' : undefined;
}
export function toolbar() {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return Reflect.metadata(Symbol.for('toolbarIcon'), keys);
}
export function dialogAddons(key) {
    var keys = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        keys[_i - 1] = arguments[_i];
    }
    return Reflect.metadata(Symbol.for("toolbarDialogAddon".concat(key)), keys);
}
export function isSupportType(col) {
    var clazz = col.constructor;
    return Reflect.hasMetadata(supportType, clazz);
}
export function categoryOf(col) {
    var _a, _b;
    var cat = ((_a = Reflect.getMetadata(category, typeof col === 'function' ? col : Object.getPrototypeOf(col).constructor)) !== null && _a !== void 0 ? _a : 'other');
    return ((_b = categories[cat]) !== null && _b !== void 0 ? _b : categories.other);
}
export function categoryOfDesc(col, models) {
    var type = typeof col === 'string' ? col : col.type;
    var clazz = models[type];
    return clazz ? categoryOf(clazz) : categories.other;
}
//# sourceMappingURL=annotations.js.map