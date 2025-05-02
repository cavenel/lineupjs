var ColumnBuilder = /** @class */ (function () {
    function ColumnBuilder(type, column) {
        this.desc = { column: column, type: type, label: column ? column[0].toUpperCase() + column.slice(1) : type };
    }
    /**
     * column label
     */
    ColumnBuilder.prototype.label = function (label) {
        this.desc.label = label;
        return this;
    };
    ColumnBuilder.prototype.htmlLabel = function (label, render) {
        this.desc.label = label;
        this.desc.labelAsHTML = render !== null && render !== void 0 ? render : true;
        return this;
    };
    /**
     * hide this column by default
     */
    ColumnBuilder.prototype.hidden = function () {
        this.desc.visible = false;
        return this;
    };
    /**
     * column summary text (subtitle)
     */
    ColumnBuilder.prototype.summary = function (summary) {
        this.desc.summary = summary;
        return this;
    };
    ColumnBuilder.prototype.htmlSummary = function (label, render) {
        this.desc.summary = label;
        this.desc.summaryAsHTML = render !== null && render !== void 0 ? render : true;
        return this;
    };
    /**
     * column description
     */
    ColumnBuilder.prototype.description = function (description) {
        this.desc.description = description;
        return this;
    };
    /**
     * sets the frozen state of this column, i.e is sticky to the left side when scrolling horizontally
     */
    ColumnBuilder.prototype.frozen = function () {
        this.desc.frozen = true;
        return this;
    };
    /**
     * specify the renderer to used for this column
     * @param {string} renderer within a cell
     * @param {string} groupRenderer within an aggregated cell
     * @param {string} summaryRenderer within the summary in the header and side panel
     */
    ColumnBuilder.prototype.renderer = function (renderer, groupRenderer, summaryRenderer) {
        if (renderer) {
            this.desc.renderer = renderer;
        }
        if (groupRenderer) {
            this.desc.groupRenderer = groupRenderer;
        }
        if (summaryRenderer) {
            this.desc.summaryRenderer = summaryRenderer;
        }
        return this;
    };
    /**
     * specify a custom additional attribute for the description
     * @param {string} key the property key
     * @param value its value
     */
    ColumnBuilder.prototype.custom = function (key, value) {
        this.desc[key] = value;
        return this;
    };
    /**
     * sets the default width of the column
     */
    ColumnBuilder.prototype.width = function (width) {
        this.desc.width = width;
        return this;
    };
    /**
     * sets the column color in case of numerical columns
     * @deprecated use colorMapping in the number case instead
     */
    ColumnBuilder.prototype.color = function (_color) {
        return this;
    };
    /**
     * converts the column type to be an array type, supports only base types: boolean, categorical, date, number, and string
     * @param {string[] | number} labels labels to use for each array item or the expected length of an value
     */
    ColumnBuilder.prototype.asArray = function (labels) {
        console.assert(['boolean', 'categorical', 'date', 'number', 'string', 'link'].includes(this.desc.type));
        this.desc.type += 's';
        var a = this.desc;
        if (Array.isArray(labels)) {
            a.labels = labels;
            a.dataLength = labels.length;
        }
        else if (typeof labels === 'number') {
            a.dataLength = labels;
        }
        return this;
    };
    /**
     * converts the column type to be a map type, supports only base types: categorical, date, number, and string
     */
    ColumnBuilder.prototype.asMap = function () {
        console.assert(['categorical', 'date', 'number', 'string', 'link'].includes(this.desc.type));
        this.desc.type += 'Map';
        return this;
    };
    /**
     * build the column description
     */
    ColumnBuilder.prototype.build = function (_data) {
        return this.desc;
    };
    return ColumnBuilder;
}());
export default ColumnBuilder;
/**
 * build a column of a given type
 * @param {string} type column type
 * @param {string} column column which contains the associated data
 * @returns {ColumnBuilder<IColumnDesc>}
 */
export function buildColumn(type, column) {
    return new ColumnBuilder(type, column);
}
//# sourceMappingURL=ColumnBuilder.js.map