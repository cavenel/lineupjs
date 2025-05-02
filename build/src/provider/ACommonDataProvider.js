var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Ranking } from '../model';
import ADataProvider from './ADataProvider';
import { isComplexAccessor, rowGetter, rowComplexGetter, rowGuessGetter } from '../internal';
function injectAccessor(d) {
    d.accessor = d.accessor || (d.column ? (isComplexAccessor(d.column) ? rowComplexGetter : rowGetter) : rowGuessGetter);
    d.label = d.label || d.column;
    return d;
}
/**
 * common base implementation of a DataProvider with a fixed list of column descriptions
 */
var ACommonDataProvider = /** @class */ (function (_super) {
    __extends(ACommonDataProvider, _super);
    function ACommonDataProvider(columns, options) {
        if (columns === void 0) { columns = []; }
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this.columns = columns;
        _this.rankingIndex = 0;
        //generate the accessor
        columns.forEach(injectAccessor);
        return _this;
    }
    ACommonDataProvider.prototype.cloneRanking = function (existing) {
        var _this = this;
        var id = this.nextRankingId();
        var clone = new Ranking(id);
        if (existing) {
            //copy the ranking of the other one
            //TODO better cloning
            existing.children.forEach(function (child) {
                _this.push(clone, child.desc);
            });
        }
        return clone;
    };
    /**
     * adds another column description to this data provider
     * @param column
     */
    ACommonDataProvider.prototype.pushDesc = function (column) {
        injectAccessor(column);
        this.columns.push(column);
        this.fire(ADataProvider.EVENT_ADD_DESC, column);
    };
    ACommonDataProvider.prototype.clearColumns = function () {
        this.clearRankings();
        this.columns.splice(0, this.columns.length);
        this.fire(ADataProvider.EVENT_CLEAR_DESC);
    };
    /**
     * Remove the given column description from the data provider.
     * Column descriptions that are in use (i.e., has column instances in a ranking) cannot be removed by default.
     * Skip the check by setting the `ignoreBeingUsed` parameter to `true`.
     *
     * @param column Column description
     * @param ignoreBeingUsed Flag whether to ignore the usage of the column descriptions in rankings
     */
    ACommonDataProvider.prototype.removeDesc = function (column, ignoreBeingUsed) {
        if (ignoreBeingUsed === void 0) { ignoreBeingUsed = false; }
        var i = this.columns.indexOf(column);
        if (i < 0) {
            return false;
        }
        var isUsed = ignoreBeingUsed
            ? false
            : this.getRankings().some(function (d) { return d.flatColumns.some(function (c) { return c.desc === column; }); });
        if (isUsed) {
            return false;
        }
        this.columns.splice(i, 1);
        this.fire(ADataProvider.EVENT_REMOVE_DESC, column);
        return true;
    };
    ACommonDataProvider.prototype.getColumns = function () {
        return this.columns.slice();
    };
    ACommonDataProvider.prototype.findDesc = function (ref) {
        return this.columns.filter(function (c) { return c.column === ref; })[0];
    };
    /**
     * identify by the tuple type@columnname
     * @param desc
     * @returns {string}
     */
    ACommonDataProvider.prototype.toDescRef = function (desc) {
        return typeof desc.column !== 'undefined' ? "".concat(desc.type, "@").concat(desc.column) : this.cleanDesc(Object.assign({}, desc));
    };
    ACommonDataProvider.prototype.fromDescRef = function (descRef) {
        if (typeof descRef === 'string') {
            return this.columns.find(function (d) { return "".concat(d.type, "@").concat(d.column) === descRef || d.type === descRef; });
        }
        var existing = this.columns.find(function (d) { return descRef.column === d.column && descRef.label === d.label && descRef.type === d.type; });
        if (existing) {
            return existing;
        }
        return descRef;
    };
    ACommonDataProvider.prototype.restore = function (dump) {
        _super.prototype.restore.call(this, dump);
        this.rankingIndex = 1 + Math.max.apply(Math, this.getRankings().map(function (r) { return +r.id.substring(4); }));
    };
    ACommonDataProvider.prototype.nextRankingId = function () {
        return "rank".concat(this.rankingIndex++);
    };
    return ACommonDataProvider;
}(ADataProvider));
export default ACommonDataProvider;
//# sourceMappingURL=ACommonDataProvider.js.map