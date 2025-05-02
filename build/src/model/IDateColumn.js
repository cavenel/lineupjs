import Column from './Column';
export function isDateColumn(col) {
    return ((col instanceof Column && typeof col.getDate === 'function') ||
        (!(col instanceof Column) && col.type.startsWith('date')));
}
export function isDatesColumn(col) {
    return typeof col.getDates === 'function';
}
//# sourceMappingURL=IDateColumn.js.map