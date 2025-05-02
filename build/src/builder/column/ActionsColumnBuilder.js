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
import ColumnBuilder from './ColumnBuilder';
var ActionsColumnBuilder = /** @class */ (function (_super) {
    __extends(ActionsColumnBuilder, _super);
    function ActionsColumnBuilder() {
        return _super.call(this, 'actions', '') || this;
    }
    /**
     * adds another action
     * @param action the action
     */
    ActionsColumnBuilder.prototype.action = function (action) {
        return this.actions([action]);
    };
    /**
     * adds multiple actions
     * @param actions list of actions
     */
    ActionsColumnBuilder.prototype.actions = function (actions) {
        var _a;
        if (!this.desc.actions) {
            this.desc.actions = [];
        }
        (_a = this.desc.actions).push.apply(_a, actions);
        return this;
    };
    /**
     * adds another action that is shown in group rows
     * @param action the action
     */
    ActionsColumnBuilder.prototype.groupAction = function (action) {
        return this.groupActions([action]);
    };
    /**
     * add multiple group actions that are shown in group rows
     * @param actions list of actions
     */
    ActionsColumnBuilder.prototype.groupActions = function (actions) {
        var _a;
        if (!this.desc.groupActions) {
            this.desc.groupActions = [];
        }
        (_a = this.desc.groupActions).push.apply(_a, actions);
        return this;
    };
    return ActionsColumnBuilder;
}(ColumnBuilder));
export default ActionsColumnBuilder;
/**
 * builds a actions column builder
 * @returns {ActionsColumnBuilder}
 */
export function buildActionsColumn() {
    return new ActionsColumnBuilder();
}
//# sourceMappingURL=ActionsColumnBuilder.js.map