var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Column, CompositeColumn, Ranking, ReduceColumn, StackColumn, createAggregateDesc, createGroupDesc, createImpositionBoxPlotDesc, createImpositionDesc, createImpositionsDesc, createNestedDesc, createRankDesc, createReduceDesc, createScriptDesc, createSelectionDesc, createStackDesc, EAdvancedSortMethod, } from '../model';
/**
 * builder for a ranking
 */
var RankingBuilder = /** @class */ (function () {
    function RankingBuilder() {
        this.columns = [];
        this.sort = [];
        this.groupSort = [];
        this.groups = [];
    }
    /**
     * specify another sorting criteria
     * @param {string} column the column name optionally with encoded sorting separated by colon, e.g. a:desc
     * @param {boolean | "asc" | "desc"} asc ascending or descending order
     */
    RankingBuilder.prototype.sortBy = function (column, asc) {
        if (asc === void 0) { asc = true; }
        if (column.includes(':')) {
            // encoded sorting order
            var index = column.indexOf(':');
            asc = column.slice(index + 1);
            column = column.slice(0, index);
        }
        this.sort.push({ column: column, asc: asc === true || String(asc)[0] === 'a' });
        return this;
    };
    /**
     * specify grouping criteria
     * @returns {this}
     */
    RankingBuilder.prototype.groupBy = function () {
        var _a;
        var columns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            columns[_i] = arguments[_i];
        }
        for (var _b = 0, columns_1 = columns; _b < columns_1.length; _b++) {
            var col = columns_1[_b];
            if (Array.isArray(col)) {
                (_a = this.groups).push.apply(_a, col);
            }
            else {
                this.groups.push(col);
            }
        }
        return this;
    };
    /**
     * specify another grouping sorting criteria
     * @param {string} column the column name optionally with encoded sorting separated by colon, e.g. a:desc
     * @param {boolean | "asc" | "desc"} asc ascending or descending order
     */
    RankingBuilder.prototype.groupSortBy = function (column, asc) {
        if (asc === void 0) { asc = true; }
        if (column.includes(':')) {
            // encoded sorting order
            var index = column.indexOf(':');
            asc = column.slice(index + 1);
            column = column.slice(0, index);
        }
        this.groupSort.push({ column: column, asc: asc === true || String(asc)[0] === 'a' });
        return this;
    };
    /**
     * add another column to this ranking, identified by column name or label. magic names are used for special columns:
     * <ul>
     *     <li>'*' = all columns</li>
     *     <li>'_*' = all support columns</li>
     *     <li>'_aggregate' = aggregate column</li>
     *     <li>'_selection' = selection column</li>
     *     <li>'_group' = group column</li>
     *     <li>'_rank' = rank column</li>
     * </ul>
     * In addition build objects for combined columns are supported.
     * @param {string | IImposeColumnBuilder | INestedBuilder | IWeightedSumBuilder | IReduceBuilder | IScriptedBuilder} column
     */
    RankingBuilder.prototype.column = function (column) {
        if (typeof column === 'string') {
            switch (column) {
                case '_aggregate':
                    return this.aggregate();
                case '_selection':
                    return this.selection();
                case '_group':
                    return this.group();
                case '_rank':
                    return this.rank();
                case '_*':
                    return this.supportTypes();
                case '*':
                    return this.allColumns();
            }
            this.columns.push(column);
            return this;
        }
        var label = column.label || null;
        // builder ish
        switch (column.type) {
            case 'impose':
                return this.impose(label, column.column, column.colorColumn);
            case 'min':
            case 'max':
            case 'median':
            case 'mean':
                console.assert(column.columns.length >= 2);
                return this.reduce.apply(this, __spreadArray([label, column.type, column.columns[0], column.columns[1]], column.columns.slice(2), false));
            case 'nested':
                console.assert(column.columns.length >= 1);
                return this.nested.apply(this, __spreadArray([label, column.columns[0]], column.columns.slice(1), false));
            case 'script':
                return this.scripted.apply(this, __spreadArray([label, column.code], column.columns, false));
            case 'weightedSum': {
                console.assert(column.columns.length >= 2);
                console.assert(column.columns.length === column.weights.length);
                var mixed_1 = [];
                column.columns.slice(2).forEach(function (c, i) {
                    mixed_1.push(c);
                    mixed_1.push(column.weights[i + 2]);
                });
                return this.weightedSum.apply(this, __spreadArray([label,
                    column.columns[0],
                    column.weights[0],
                    column.columns[1],
                    column.weights[1]], mixed_1, false));
            }
        }
    };
    /**
     * add an imposed column (numerical column colored by categorical column) to this ranking
     * @param {string | null} label optional label
     * @param {string} numberColumn numerical column reference
     * @param {string} colorColumn categorical column reference
     */
    RankingBuilder.prototype.impose = function (label, numberColumn, colorColumn) {
        this.columns.push({
            desc: function (data) {
                var base = data.getColumns().find(function (d) { return d.label === numberColumn || d.column === numberColumn; });
                switch (base ? base.type : '') {
                    case 'boxplot':
                        return createImpositionBoxPlotDesc(label ? label : undefined);
                    case 'numbers':
                        return createImpositionsDesc(label ? label : undefined);
                    default:
                        return createImpositionDesc(label ? label : undefined);
                }
            },
            columns: [numberColumn, colorColumn],
        });
        return this;
    };
    /**
     * add a nested / group composite column
     * @param {string | null} label optional label
     * @param {string} column first element of the group enforcing not empty ones
     * @param {string} columns additional columns
     */
    RankingBuilder.prototype.nested = function (label, column) {
        var columns = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            columns[_i - 2] = arguments[_i];
        }
        this.columns.push({
            desc: createNestedDesc(label ? label : undefined),
            columns: [column].concat(columns),
        });
        return this;
    };
    /**
     * @param {IColumnDesc} desc the composite column description
     * @param {string} columns additional columns to add as children
     */
    RankingBuilder.prototype.composite = function (desc) {
        var columns = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            columns[_i - 1] = arguments[_i];
        }
        this.columns.push({
            desc: desc,
            columns: columns,
        });
        return this;
    };
    /**
     * add a weighted sum / stack column
     * @param {string | null} label optional label
     * @param {string} numberColumn1 the first numerical column
     * @param {number} weight1 its weight (0..1)
     * @param {string} numberColumn2 the second numerical column
     * @param {number} weight2 its weight (0..1)
     * @param {string | number} numberColumnAndWeights alternating column weight references
     */
    RankingBuilder.prototype.weightedSum = function (label, numberColumn1, weight1, numberColumn2, weight2) {
        var numberColumnAndWeights = [];
        for (var _i = 5; _i < arguments.length; _i++) {
            numberColumnAndWeights[_i - 5] = arguments[_i];
        }
        var weights = [weight1, weight2].concat(numberColumnAndWeights.filter(function (_, i) { return i % 2 === 1; }));
        this.columns.push({
            desc: createStackDesc(label ? label : undefined),
            columns: [numberColumn1, numberColumn2].concat(numberColumnAndWeights.filter(function (_, i) { return i % 2 === 0; })),
            post: function (col) {
                col.setWeights(weights);
            },
        });
        return this;
    };
    /**
     * add reducing column (min, max, median, mean, ...)
     * @param {string | null} label optional label
     * @param {EAdvancedSortMethod} operation operation to apply (min, max, median, mean, ...)
     * @param {string} numberColumn1 first numerical column
     * @param {string} numberColumn2 second numerical column
     * @param {string} numberColumns additional numerical columns
     */
    RankingBuilder.prototype.reduce = function (label, operation, numberColumn1, numberColumn2) {
        var numberColumns = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            numberColumns[_i - 4] = arguments[_i];
        }
        this.columns.push({
            desc: createReduceDesc(label ? label : undefined),
            columns: [numberColumn1, numberColumn2].concat(numberColumns),
            post: function (col) {
                col.setReduce(operation);
            },
        });
        return this;
    };
    /**
     * add a scripted / formula column
     * @param {string | null} label optional label
     * @param {string} code the JS code see ScriptColumn for details
     * @param {string} numberColumns additional script columns
     */
    RankingBuilder.prototype.scripted = function (label, code) {
        var numberColumns = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            numberColumns[_i - 2] = arguments[_i];
        }
        this.columns.push({
            desc: Object.assign(createScriptDesc(label ? label : undefined), { script: code }),
            columns: numberColumns,
        });
        return this;
    };
    /**
     * add a selection column for easier multi selections
     */
    RankingBuilder.prototype.selection = function () {
        this.columns.push({
            desc: createSelectionDesc(),
            columns: [],
        });
        return this;
    };
    /**
     * add a group column to show the current group name
     */
    RankingBuilder.prototype.group = function () {
        this.columns.push({
            desc: createGroupDesc(),
            columns: [],
        });
        return this;
    };
    /**
     * add an aggregate column to this ranking to collapse/expand groups
     */
    RankingBuilder.prototype.aggregate = function () {
        this.columns.push({
            desc: createAggregateDesc(),
            columns: [],
        });
        return this;
    };
    /**
     * add a ranking column
     */
    RankingBuilder.prototype.rank = function () {
        this.columns.push({
            desc: createRankDesc(),
            columns: [],
        });
        return this;
    };
    /**
     * add suporttypes (aggregate, rank, selection) to the ranking
     */
    RankingBuilder.prototype.supportTypes = function () {
        return this.aggregate().rank().selection();
    };
    /**
     * add all columns to this ranking
     */
    RankingBuilder.prototype.allColumns = function () {
        this.columns.push(RankingBuilder.ALL_MAGIC_FLAG);
        return this;
    };
    RankingBuilder.prototype.build = function (data) {
        var r = data.pushRanking();
        var cols = data.getColumns();
        var findDesc = function (c) { return cols.find(function (d) { return d.label === c || d.column === c; }); };
        var addColumn = function (c) {
            var desc = findDesc(c);
            if (desc) {
                return data.push(r, desc) != null;
            }
            console.warn('invalid column: ', c);
            return false;
        };
        this.columns.forEach(function (c) {
            if (c === RankingBuilder.ALL_MAGIC_FLAG) {
                cols.forEach(function (col) { return data.push(r, col); });
                return;
            }
            if (typeof c === 'string') {
                addColumn(c);
                return;
            }
            var col = data.create(typeof c.desc === 'function' ? c.desc(data) : c.desc);
            r.push(col);
            c.columns.forEach(function (ci) {
                var d = findDesc(ci);
                var child = d ? data.create(d) : null;
                if (!child) {
                    console.warn('invalid column: ', ci);
                    return;
                }
                col.push(child);
            });
            if (c.post) {
                c.post(col);
            }
        });
        var children = r.children;
        {
            var groups_1 = [];
            this.groups.forEach(function (column) {
                var col = children.find(function (d) { return d.desc.label === column || d.desc.column === column; });
                if (col) {
                    groups_1.push(col);
                    return;
                }
                var desc = findDesc(column);
                if (!desc) {
                    console.warn('invalid group criteria column: ', column);
                    return;
                }
                var col2 = data.push(r, desc);
                if (col2) {
                    groups_1.push(col2);
                    return;
                }
                console.warn('invalid group criteria column: ', column);
            });
            if (groups_1.length > 0) {
                r.setGroupCriteria(groups_1);
            }
        }
        {
            var sorts_1 = [];
            this.sort.forEach(function (_a) {
                var column = _a.column, asc = _a.asc;
                var col = children.find(function (d) { return d.desc.label === column || d.desc.column === column; });
                if (col) {
                    sorts_1.push({ col: col, asc: asc });
                    return;
                }
                var desc = findDesc(column);
                if (!desc) {
                    console.warn('invalid sort criteria column: ', column);
                    return;
                }
                var col2 = data.push(r, desc);
                if (col2) {
                    sorts_1.push({ col: col2, asc: asc });
                    return;
                }
                console.warn('invalid sort criteria column: ', column);
            });
            if (sorts_1.length > 0) {
                r.setSortCriteria(sorts_1);
            }
        }
        {
            var sorts_2 = [];
            this.groupSort.forEach(function (_a) {
                var column = _a.column, asc = _a.asc;
                var col = children.find(function (d) { return d.desc.label === column || d.desc.column === column; });
                if (col) {
                    sorts_2.push({ col: col, asc: asc });
                    return;
                }
                var desc = findDesc(column);
                if (!desc) {
                    console.warn('invalid group sort criteria column: ', column);
                    return;
                }
                var col2 = data.push(r, desc);
                if (col2) {
                    sorts_2.push({ col: col2, asc: asc });
                    return;
                }
                console.warn('invalid group sort criteria column: ', column);
            });
            if (sorts_2.length > 0) {
                r.setGroupSortCriteria(sorts_2);
            }
        }
        return r;
    };
    RankingBuilder.ALL_MAGIC_FLAG = '*';
    return RankingBuilder;
}());
export { RankingBuilder };
/**
 * creates a new instance of a ranking builder
 * @returns {RankingBuilder}
 */
export function buildRanking() {
    return new RankingBuilder();
}
//# sourceMappingURL=RankingBuilder.js.map