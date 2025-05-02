import get from 'lodash.get';
/**
 * @internal
 */
export function isComplexAccessor(column) {
    // something like a.b or a[4]
    return typeof column === 'string' && (column.includes('.') || column.includes('['));
}
/**
 * @internal
 */
export function resolveValue(value, column) {
    if (value != null && value[column] != null) {
        // well complex but a direct hit
        return value[column];
    }
    return get(value, column);
}
/**
 * @internal
 */
export function rowComplexGetter(row, desc) {
    return resolveValue(row.v, desc.column);
}
/**
 * simple row getter
 * @internal
 */
export function rowGetter(row, desc) {
    return row.v[desc.column];
}
/**
 * @internal
 */
export function rowGuessGetter(row, desc) {
    var column = desc.column;
    if (isComplexAccessor(column)) {
        return rowComplexGetter(row, desc);
    }
    return rowGetter(row, desc);
}
//# sourceMappingURL=accessor.js.map