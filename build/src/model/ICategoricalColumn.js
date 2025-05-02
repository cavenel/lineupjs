import Column from './Column';
import { isArrayColumn } from './IArrayColumn';
export function isCategoricalLikeColumn(col) {
    return (typeof col.categories !== 'undefined' &&
        typeof col.iterCategory === 'function');
}
export function isSetColumn(col) {
    return isCategoricalLikeColumn(col) && typeof col.getSet === 'function';
}
export function isCategoricalColumn(col) {
    return ((col instanceof Column && typeof col.getCategory === 'function') ||
        (!(col instanceof Column) && col.type.match(/(categorical|ordinal|hierarchy)/) != null));
}
export function isCategoricalsColumn(col) {
    return isCategoricalLikeColumn(col) && isArrayColumn(col) && !isSetColumn(col);
}
export function isCategory(v) {
    return (typeof v.name === 'string' &&
        typeof v.label === 'string' &&
        typeof v.color === 'string' &&
        typeof v.value === 'number');
}
//# sourceMappingURL=ICategoricalColumn.js.map