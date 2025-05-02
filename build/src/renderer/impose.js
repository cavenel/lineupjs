import { Column, isMapAbleColumn, DEFAULT_COLOR } from '../model';
export function colorOf(col, row, imposer, valueHint) {
    if (imposer && imposer.color) {
        return imposer.color(row, valueHint);
    }
    if (!row) {
        if (isMapAbleColumn(col)) {
            return col.getColorMapping().apply(valueHint != null ? valueHint : 0);
        }
        return DEFAULT_COLOR;
    }
    return col.getColor(row);
}
//# sourceMappingURL=impose.js.map