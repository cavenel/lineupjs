import ColumnBuilder from './ColumnBuilder';
export default class BooleanColumnBuilder extends ColumnBuilder {
    constructor(column) {
        super('boolean', column);
    }
    trueMarker(marker) {
        this.desc.trueMarker = marker;
        return this;
    }
    falseMarker(marker) {
        this.desc.falseMarker = marker;
        return this;
    }
    trueValues(values) {
        this.desc.trueValues = values;
        return this;
    }
}
/**
 * builds a boolean column builder
 * @param {string} column column which contains the associated data
 * @returns {BooleanColumnBuilder}
 */
export function buildBooleanColumn(column) {
    return new BooleanColumnBuilder(column);
}
