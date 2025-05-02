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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import ValueColumn from './ValueColumn';
export * from './annotations';
export { isMissingValue, isUnknown, FIRST_IS_NAN, FIRST_IS_MISSING, missingGroup } from './missing';
export * from './interfaces';
export * from './ICategoricalColumn';
export * from './INumberColumn';
export * from './IDateColumn';
export * from './IArrayColumn';
export { toCategories } from './internalCategorical';
export { ScaleMappingFunction, ScriptMappingFunction, mappingFunctions } from './MappingFunction';
export { DEFAULT_CATEGORICAL_COLOR_FUNCTION, ReplacementColorMappingFunction } from './CategoricalColorMappingFunction';
export { CustomColorMappingFunction, DEFAULT_COLOR_FUNCTION, SequentialColorFunction, DivergentColorFunction, UnknownColorFunction, QuantizedColorFunction, SolidColorFunction, } from './ColorMappingFunction';
export { default as ActionColumn } from './ActionColumn';
export * from './ActionColumn';
export { default as AggregateGroupColumn } from './AggregateGroupColumn';
export * from './AggregateGroupColumn';
export { default as AnnotateColumn } from './AnnotateColumn';
export * from './AnnotateColumn';
export { default as ArrayColumn } from './ArrayColumn';
export * from './ArrayColumn';
export { default as BooleanColumn } from './BooleanColumn';
export * from './BooleanColumn';
export { default as BooleansColumn } from './BooleansColumn';
export * from './BooleansColumn';
export { default as BoxPlotColumn } from './BoxPlotColumn';
export * from './BoxPlotColumn';
export { default as CategoricalColumn } from './CategoricalColumn';
export * from './CategoricalColumn';
export { default as CategoricalMapColumn } from './CategoricalMapColumn';
export * from './CategoricalMapColumn';
export { default as CategoricalsColumn } from './CategoricalsColumn';
export * from './CategoricalsColumn';
export { default, default as Column, DEFAULT_COLOR } from './Column';
// no * export
export { default as CompositeColumn } from './CompositeColumn';
// no * export
export { default as CompositeNumberColumn } from './CompositeNumberColumn';
export * from './CompositeNumberColumn';
export { default as DateColumn } from './DateColumn';
export * from './DateColumn';
export { default as DatesColumn } from './DatesColumn';
export * from './DatesColumn';
export { default as DatesMapColumn } from './DatesMapColumn';
export * from './DatesMapColumn';
export { default as GroupColumn } from './GroupColumn';
export * from './GroupColumn';
export { default as HierarchyColumn } from './HierarchyColumn';
export * from './HierarchyColumn';
export { default as ImpositionBoxPlotColumn } from './ImpositionBoxPlotColumn';
export * from './ImpositionBoxPlotColumn';
export { default as ImpositionCompositeColumn } from './ImpositionCompositeColumn';
export * from './ImpositionCompositeColumn';
export { default as ImpositionCompositesColumn } from './ImpositionCompositesColumn';
export * from './ImpositionCompositesColumn';
export { default as LinkColumn } from './LinkColumn';
export * from './LinkColumn';
export { default as LinkMapColumn } from './LinkMapColumn';
export * from './LinkMapColumn';
export { default as LinksColumn } from './LinksColumn';
export * from './LinksColumn';
export { default as MapColumn } from './MapColumn';
export * from './MapColumn';
export { default as MultiLevelCompositeColumn } from './MultiLevelCompositeColumn';
export * from './MultiLevelCompositeColumn';
export { default as NestedColumn } from './NestedColumn';
export * from './NestedColumn';
export { default as NumberColumn } from './NumberColumn';
export * from './NumberColumn';
export { default as NumberMapColumn } from './NumberMapColumn';
export * from './NumberMapColumn';
export { default as NumbersColumn } from './NumbersColumn';
export * from './NumbersColumn';
export { default as OrdinalColumn } from './OrdinalColumn';
export * from './OrdinalColumn';
export { default as RankColumn } from './RankColumn';
export * from './RankColumn';
export { default as Ranking, EDirtyReason } from './Ranking';
// no * export
export { default as ReduceColumn } from './ReduceColumn';
export * from './ReduceColumn';
export { default as ScriptColumn } from './ScriptColumn';
export * from './ScriptColumn';
export { default as SelectionColumn } from './SelectionColumn';
export * from './SelectionColumn';
export { default as SetColumn } from './SetColumn';
export * from './SetColumn';
export { default as StackColumn } from './StackColumn';
export * from './StackColumn';
export { default as StringColumn } from './StringColumn';
export * from './StringColumn';
export { default as StringsColumn } from './StringsColumn';
export * from './StringsColumn';
export { default as StringMapColumn } from './StringMapColumn';
export * from './StringMapColumn';
export { default as ValueColumn } from './ValueColumn';
// no * export
/**
 * defines a new column type
 * @param name
 * @param functions
 * @returns {CustomColumn}
 */
export function defineColumn(name, functions) {
    if (functions === void 0) { functions = {}; }
    var CustomColumn = /** @class */ (function (_super) {
        __extends(CustomColumn, _super);
        function CustomColumn(id, desc) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var _this = _super.call(this, id, desc) || this;
            if (typeof _this.init === 'function') {
                _this.init.apply(_this, __spreadArray([id, desc], args, false));
            }
            return _this;
        }
        CustomColumn.prototype.init = function () {
            var _args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _args[_i] = arguments[_i];
            }
            // dummy
        };
        return CustomColumn;
    }(ValueColumn));
    CustomColumn.prototype.toString = function () { return name; };
    CustomColumn.prototype = Object.assign(CustomColumn.prototype, functions);
    return CustomColumn;
}
//# sourceMappingURL=index.js.map