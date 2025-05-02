import { ActionColumn, Column } from '../model';
import { ERenderMode, } from './interfaces';
import { forEachChild, noRenderer } from './utils';
import { cssClass } from '../styles';
var ActionRenderer = /** @class */ (function () {
    function ActionRenderer() {
        this.title = 'Default';
    }
    ActionRenderer.prototype.canRender = function (col, mode) {
        return col instanceof ActionColumn && mode !== ERenderMode.SUMMARY;
    };
    ActionRenderer.prototype.create = function (col, context) {
        var actions = col.actions;
        return {
            template: "<div class=\"".concat(cssClass('actions'), " ").concat(cssClass('hover-only'), "\">").concat(actions
                .map(function (a) {
                return "<span title='".concat(context.sanitize(a.name), "' class='").concat(context.sanitize(a.className || ''), "'>").concat(context.sanitize(a.icon || ''), "</span>");
            })
                .join(''), "</div>"),
            update: function (n, d) {
                forEachChild(n, function (ni, i) {
                    ni.onclick = function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        setTimeout(function () { return actions[i].action(d); }, 1); // async
                    };
                });
            },
        };
    };
    ActionRenderer.prototype.createGroup = function (col, context) {
        var actions = col.groupActions;
        return {
            template: "<div class=\"".concat(cssClass('actions'), " ").concat(cssClass('hover-only'), "\">").concat(actions
                .map(function (a) {
                return "<span title='".concat(context.sanitize(a.name), "' class='").concat(context.sanitize(a.className || ''), "'>").concat(context.sanitize(a.icon || ''), "</span>");
            })
                .join(''), "</div>"),
            update: function (n, group) {
                forEachChild(n, function (ni, i) {
                    ni.onclick = function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        context.tasks
                            .groupRows(col, group, 'identity', function (r) { return r; })
                            .then(function (rows) {
                            if (typeof rows === 'symbol') {
                                return;
                            }
                            setTimeout(function () { return actions[i].action(group, Array.from(rows)); }, 1); // async
                        });
                    };
                });
            },
        };
    };
    ActionRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return ActionRenderer;
}());
export default ActionRenderer;
//# sourceMappingURL=ActionRenderer.js.map