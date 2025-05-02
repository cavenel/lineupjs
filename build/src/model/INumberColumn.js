import Column from './Column';
export function isMapAbleColumn(col) {
    return ((col instanceof Column && typeof col.getMapping === 'function') ||
        (!(col instanceof Column) &&
            isNumberColumn(col) &&
            (col.type.startsWith('number') || col.type.startsWith('boxplot'))));
}
export function isNumberColumn(col) {
    return ((col instanceof Column && typeof col.getNumber === 'function') ||
        (!(col instanceof Column) && col.type.match(/(number|stack|ordinal)/) != null));
}
export var ESortMethod;
(function (ESortMethod) {
    ESortMethod["min"] = "min";
    ESortMethod["max"] = "max";
    ESortMethod["median"] = "median";
    ESortMethod["q1"] = "q1";
    ESortMethod["q3"] = "q3";
})(ESortMethod || (ESortMethod = {}));
export function isBoxPlotColumn(col) {
    return typeof col.getBoxPlotData === 'function';
}
export var EAdvancedSortMethod;
(function (EAdvancedSortMethod) {
    EAdvancedSortMethod["min"] = "min";
    EAdvancedSortMethod["max"] = "max";
    EAdvancedSortMethod["median"] = "median";
    EAdvancedSortMethod["q1"] = "q1";
    EAdvancedSortMethod["q3"] = "q3";
    EAdvancedSortMethod["mean"] = "mean";
})(EAdvancedSortMethod || (EAdvancedSortMethod = {}));
export function isNumbersColumn(col) {
    return isBoxPlotColumn(col) && typeof col.getNumbers === 'function';
}
//# sourceMappingURL=INumberColumn.js.map