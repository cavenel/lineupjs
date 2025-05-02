import Column from './Column';
export function isMapColumn(col) {
    return ((col instanceof Column &&
        typeof col.getMap === 'function' &&
        typeof col.getMapLabel === 'function') ||
        (!(col instanceof Column) && col.type.endsWith('Map')));
}
export function isArrayColumn(col) {
    return ((col instanceof Column &&
        typeof col.getLabels === 'function' &&
        typeof col.getValues === 'function' &&
        isMapColumn(col)) ||
        (!(col instanceof Column) && col.type.endsWith('s') && col.type !== 'actions'));
}
//# sourceMappingURL=IArrayColumn.js.map