import ColumnBuilder from './ColumnBuilder';
export default class StringColumnBuilder extends ColumnBuilder {
    constructor(column) {
        super('string', column);
    }
    /**
     * makes the text editable within a cell and switches to the annotate type
     */
    editable() {
        this.desc.type = 'annotate';
        return this;
    }
    /**
     * changes the alignment of the column
     */
    alignment(align) {
        this.desc.alignment = align;
        return this;
    }
    /**
     * allow html text as values
     */
    html() {
        this.desc.escape = false;
        return this;
    }
    /**
     * provide a pattern with which the value will be wrapped, use `${value}` for the current and and `${item}` for the whole item
     * @param {string} pattern pattern to apply
     * @param {string[]} templates optional templates for patterns to provide in the edit pattern dialog
     */
    pattern(pattern, templates) {
        this.desc.type = 'link';
        this.desc.pattern = pattern;
        if (templates) {
            this.desc.patternTemplates = templates;
        }
        return this;
    }
}
/**
 * builds a string column builder
 * @param {string} column column which contains the associated data
 * @returns {StringColumnBuilder}
 */
export function buildStringColumn(column) {
    return new StringColumnBuilder(column);
}
