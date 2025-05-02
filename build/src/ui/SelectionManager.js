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
import { OrderedSet, AEventDispatcher } from '../internal';
import { isGroup } from '../model';
import { cssClass, engineCssClass } from '../styles';
import { forEachIndices } from '../model/internal';
import { rangeSelection } from '../provider/utils';
import { detect } from 'detect-browser';
/** @internal */
var SelectionManager = /** @class */ (function (_super) {
    __extends(SelectionManager, _super);
    function SelectionManager(ctx, body, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.selectionActivateFilter, selectionActivateFilter = _c === void 0 ? true : _c;
        var _d;
        var _this = _super.call(this) || this;
        _this.ctx = ctx;
        _this.body = body;
        _this.selectionActivateFilter = true;
        _this.start = null;
        _this.isFirefox = ((_d = detect()) === null || _d === void 0 ? void 0 : _d.name) === 'firefox';
        _this.selectionActivateFilter = selectionActivateFilter;
        var root = body.parentElement.parentElement;
        var hr = root.querySelector('hr');
        if (!hr) {
            hr = root.ownerDocument.createElement('hr');
            root.appendChild(hr);
        }
        _this.hr = hr;
        _this.hr.classList.add(cssClass('hr'));
        var mouseMove = function (evt) {
            _this.showHint(evt);
        };
        var mouseUp = function (evt) {
            _this.body.removeEventListener('mousemove', mouseMove);
            _this.body.removeEventListener('mouseup', mouseUp);
            _this.body.removeEventListener('mouseleave', mouseUp);
            if (!_this.start) {
                return;
            }
            var row = engineCssClass('tr');
            var startNode = _this.start.node.classList.contains(row)
                ? _this.start.node
                : _this.start.node.closest(".".concat(row));
            // somehow on firefox the mouseUp will be triggered on the original node
            // thus search the node explicitly
            var end = _this.body.ownerDocument.elementFromPoint(evt.clientX, evt.clientY);
            var endNode = end.classList.contains(row) ? end : end.closest(".".concat(row));
            _this.start = null;
            _this.body.classList.remove(cssClass('selection-active'));
            _this.hr.classList.remove(cssClass('selection-active'));
            _this.select(evt.ctrlKey, startNode, endNode);
        };
        if (_this.selectionActivateFilter !== false) {
            body.addEventListener('mousedown', function (evt) {
                var _a, _b;
                // activate only when filter is satisfied
                if (!(_this.selectionActivateFilter !== false &&
                    (_this.selectionActivateFilter === true ||
                        ((_a = evt.target) === null || _a === void 0 ? void 0 : _a.matches(_this.selectionActivateFilter)) ||
                        ((_b = evt.target) === null || _b === void 0 ? void 0 : _b.closest(_this.selectionActivateFilter)) != null))) {
                    return;
                }
                var r = root.getBoundingClientRect();
                _this.start = {
                    x: evt.clientX,
                    y: evt.clientY,
                    xShift: r.left,
                    yShift: r.top,
                    node: evt.target,
                };
                _this.body.classList.add(cssClass('selection-active'));
                body.addEventListener('mousemove', mouseMove, {
                    passive: true,
                });
                body.addEventListener('mouseup', mouseUp, {
                    passive: true,
                });
                body.addEventListener('mouseleave', mouseUp, {
                    passive: true,
                });
            }, {
                passive: true,
            });
        }
        return _this;
    }
    SelectionManager.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([SelectionManager.EVENT_SELECT_RANGE]);
    };
    SelectionManager.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    SelectionManager.prototype.select = function (additional, startNode, endNode) {
        var _this = this;
        if (!startNode || !endNode || startNode === endNode) {
            return; // no single
        }
        var startIndex = Number.parseInt(startNode.dataset.index, 10);
        var endIndex = Number.parseInt(endNode.dataset.index, 10);
        var from = Math.min(startIndex, endIndex);
        var end = Math.max(startIndex, endIndex);
        if (from === end) {
            return; // no single
        }
        // bounce event end
        requestAnimationFrame(function () { return _this.fire(SelectionManager.EVENT_SELECT_RANGE, from, end, additional); });
    };
    SelectionManager.prototype.showHint = function (end) {
        var start = this.start;
        var sy = start.y;
        var ey = end.clientY;
        var visible = Math.abs(sy - ey) > SelectionManager.MIN_DISTANCE;
        this.hr.classList.toggle(cssClass('selection-active'), visible);
        this.hr.style.transform = "translate(".concat(start.x - start.xShift, "px,").concat(sy - start.yShift, "px)scale(1,").concat(Math.abs(ey - sy), ")rotate(").concat(ey > sy ? 90 : -90, "deg)");
    };
    SelectionManager.prototype.remove = function (node) {
        node.onclick = undefined;
    };
    SelectionManager.prototype.add = function (node) {
        var _this = this;
        node.onclick = function (evt) {
            if (_this.isFirefox) {
                var bb = node.getBoundingClientRect();
                // mouse up outside the element
                if (evt.offsetY < 0 || evt.offsetY > bb.height || evt.offsetX < 0 || evt.offsetY > bb.width) {
                    return;
                }
            }
            var dataIndex = Number.parseInt(node.dataset.i, 10);
            if (evt.shiftKey) {
                var relIndex = Number.parseInt(node.dataset.index, 10);
                var ranking = node.parentElement.dataset.ranking;
                if (rangeSelection(_this.ctx.provider, ranking, dataIndex, relIndex, evt.ctrlKey)) {
                    return;
                }
            }
            _this.ctx.provider.toggleSelection(dataIndex, evt.ctrlKey);
        };
    };
    SelectionManager.prototype.selectRange = function (rows, additional) {
        if (additional === void 0) { additional = false; }
        var current = new OrderedSet(additional ? this.ctx.provider.getSelection() : []);
        var toggle = function (dataIndex) {
            if (current.has(dataIndex)) {
                current.delete(dataIndex);
            }
            else {
                current.add(dataIndex);
            }
        };
        rows.forEach(function (d) {
            if (isGroup(d)) {
                forEachIndices(d.order, toggle);
            }
            else {
                toggle(d.dataIndex);
            }
        });
        this.ctx.provider.setSelection(Array.from(current));
    };
    SelectionManager.prototype.updateState = function (node, dataIndex) {
        if (this.ctx.provider.isSelected(dataIndex)) {
            node.classList.add(cssClass('selected'));
        }
        else {
            node.classList.remove(cssClass('selected'));
        }
    };
    SelectionManager.prototype.update = function (node, selectedDataIndices) {
        var dataIndex = Number.parseInt(node.dataset.i, 10);
        if (selectedDataIndices.has(dataIndex)) {
            node.classList.add(cssClass('selected'));
        }
        else {
            node.classList.remove(cssClass('selected'));
        }
    };
    SelectionManager.EVENT_SELECT_RANGE = 'selectRange';
    SelectionManager.MIN_DISTANCE = 10;
    return SelectionManager;
}(AEventDispatcher));
export default SelectionManager;
//# sourceMappingURL=SelectionManager.js.map