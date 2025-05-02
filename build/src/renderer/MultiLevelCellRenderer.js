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
import { round } from '../internal';
import { Column, isNumberColumn, isMultiLevelColumn, } from '../model';
import { medianIndex } from '../model/internalNumber';
import { COLUMN_PADDING } from '../styles';
import { AAggregatedGroupRenderer } from './AAggregatedGroupRenderer';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
import { matchColumns, multiLevelGridCSSClass } from './utils';
import { cssClass } from '../styles';
import { abortAbleAll } from 'lineupengine';
/**
 * @internal
 * @param parent Parent column
 * @param context Render context
 * @param stacked Are the columns stacked?
 * @param mode Render mode
 * @param imposer Imposer object
 */
export function createData(parent, context, stacked, mode, imposer) {
    var padding = COLUMN_PADDING;
    var offset = 0;
    var cols = parent.children.map(function (column) {
        var shift = offset;
        var width = column.getWidth();
        offset += width;
        offset += !stacked ? padding : 0;
        var renderer = mode === ERenderMode.CELL ? context.renderer(column, imposer) : null;
        var groupRenderer = mode === ERenderMode.GROUP ? context.groupRenderer(column, imposer) : null;
        var summaryRenderer = mode === ERenderMode.GROUP ? context.summaryRenderer(column, false, imposer) : null;
        var template = '';
        var rendererId = '';
        switch (mode) {
            case ERenderMode.CELL:
                template = renderer.template;
                rendererId = column.getRenderer();
                break;
            case ERenderMode.GROUP:
                template = groupRenderer.template;
                rendererId = column.getGroupRenderer();
                break;
            case ERenderMode.SUMMARY:
                template = summaryRenderer.template;
                rendererId = column.getSummaryRenderer();
                break;
        }
        // inject data attributes
        template = template.replace(/^<([^ >]+)([ >])/, "<$1 data-column-id=\"".concat(column.id, "\" data-renderer=\"").concat(rendererId, "\"$2"));
        // inject classes
        if (/^<([^>]+) class="([ >]*)/.test(template)) {
            // has class attribute
            template = template.replace(/^<([^>]+) class="([ >]*)/, "<$1 class=\"".concat(cssClass("renderer-".concat(rendererId)), " $2"));
        }
        else {
            // inject as the others
            template = template.replace(/^<([^ >]+)([ >])/, "<$1 class=\"".concat(cssClass("renderer-".concat(rendererId)), "\"$2"));
        }
        return {
            column: column,
            shift: shift,
            width: width,
            template: template,
            rendererId: rendererId,
            renderer: renderer,
            groupRenderer: groupRenderer,
            summaryRenderer: summaryRenderer,
        };
    });
    return { cols: cols, stacked: stacked, padding: padding };
}
var MultiLevelCellRenderer = /** @class */ (function (_super) {
    __extends(MultiLevelCellRenderer, _super);
    function MultiLevelCellRenderer(stacked) {
        if (stacked === void 0) { stacked = true; }
        var _this = _super.call(this) || this;
        _this.stacked = stacked;
        _this.title = _this.stacked ? 'Stacked Bar' : 'Nested';
        return _this;
    }
    MultiLevelCellRenderer.prototype.canRender = function (col) {
        return isMultiLevelColumn(col);
    };
    MultiLevelCellRenderer.prototype.create = function (col, context, imposer) {
        var _this = this;
        var _a = createData(col, context, this.stacked, ERenderMode.CELL, imposer), cols = _a.cols, stacked = _a.stacked;
        var width = context.colWidth(col);
        return {
            template: "<div class='".concat(multiLevelGridCSSClass(context.idPrefix, col), " ").concat(!stacked ? cssClass('grid-space') : '', "'>").concat(cols.map(function (d) { return d.template; }).join(''), "</div>"),
            update: function (n, d, i, group) {
                if (renderMissingDOM(n, col, d)) {
                    return null;
                }
                matchColumns(n, cols, context);
                var toWait = [];
                var children = Array.from(n.children);
                var total = col.getWidth();
                var missingWeight = 0;
                cols.forEach(function (col, ci) {
                    var weight = col.column.getWidth() / total;
                    var cNode = children[ci];
                    cNode.classList.add(cssClass(_this.stacked ? 'stack-sub' : 'nested-sub'), cssClass('detail'));
                    cNode.dataset.group = 'd';
                    cNode.style.transform = stacked ? "translate(-".concat(round((missingWeight / weight) * 100, 4), "%,0)") : null;
                    cNode.style.gridColumnStart = (ci + 1).toString();
                    var r = col.renderer.update(cNode, d, i, group);
                    if (stacked) {
                        missingWeight += (1 - col.column.getNumber(d)) * weight;
                        if (ci < cols.length - 1) {
                            var span = cNode.querySelector('span');
                            if (span) {
                                span.style.overflow = 'hidden';
                            }
                        }
                    }
                    if (r) {
                        toWait.push(r);
                    }
                });
                if (toWait.length > 0) {
                    return abortAbleAll(toWait);
                }
                return null;
            },
            render: function (ctx, d, i, group) {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return null;
                }
                var toWait = [];
                var stackShift = 0;
                for (var _i = 0, cols_1 = cols; _i < cols_1.length; _i++) {
                    var col_1 = cols_1[_i];
                    var cr = col_1.renderer;
                    if (cr.render) {
                        var shift = col_1.shift - stackShift;
                        ctx.translate(shift, 0);
                        var r = cr.render(ctx, d, i, group);
                        if (typeof r !== 'boolean' && r) {
                            toWait.push({ shift: shift, r: r });
                        }
                        ctx.translate(-shift, 0);
                    }
                    if (stacked) {
                        stackShift += col_1.width * (1 - col_1.column.getNumber(d));
                    }
                }
                if (toWait.length === 0) {
                    return null;
                }
                return abortAbleAll(toWait.map(function (d) { return d.r; })).then(function (callbacks) {
                    return function (ctx) {
                        if (typeof callbacks === 'symbol') {
                            return;
                        }
                        for (var i_1 = 0; i_1 < callbacks.length; ++i_1) {
                            var callback = callbacks[i_1];
                            if (typeof callback !== 'function') {
                                continue;
                            }
                            var shift = toWait[i_1].shift;
                            ctx.translate(shift, 0);
                            callback(ctx);
                            ctx.translate(-shift, 0);
                        }
                    };
                });
            },
        };
    };
    MultiLevelCellRenderer.prototype.createGroup = function (col, context, imposer) {
        var _this = this;
        if (this.stacked && isNumberColumn(col)) {
            return _super.prototype.createGroup.call(this, col, context, imposer);
        }
        var cols = createData(col, context, false, ERenderMode.GROUP, imposer).cols;
        return {
            template: "<div class='".concat(multiLevelGridCSSClass(context.idPrefix, col), " ").concat(cssClass('grid-space'), "'>").concat(cols
                .map(function (d) { return d.template; })
                .join(''), "</div>"),
            update: function (n, group) {
                matchColumns(n, cols, context);
                var toWait = [];
                var children = Array.from(n.children);
                cols.forEach(function (col, ci) {
                    var childNode = children[ci];
                    childNode.classList.add(cssClass(_this.stacked ? 'stack-sub' : 'nested-sub'), cssClass('group'));
                    childNode.dataset.group = 'g';
                    childNode.style.gridColumnStart = (ci + 1).toString();
                    var r = col.groupRenderer.update(childNode, group);
                    if (r) {
                        toWait.push(r);
                    }
                });
                if (toWait.length > 0) {
                    return abortAbleAll(toWait);
                }
                return null;
            },
        };
    };
    MultiLevelCellRenderer.prototype.aggregatedIndex = function (rows, col) {
        console.assert(isNumberColumn(col));
        return medianIndex(rows, col);
    };
    return MultiLevelCellRenderer;
}(AAggregatedGroupRenderer));
export default MultiLevelCellRenderer;
//# sourceMappingURL=MultiLevelCellRenderer.js.map