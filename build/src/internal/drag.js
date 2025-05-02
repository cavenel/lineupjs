import { cssClass } from '../styles';
/**
 * allow to change the width of a column using dragging the handle
 * @internal
 */
export function dragHandle(handle, options) {
    if (options === void 0) { options = {}; }
    var o = Object.assign({
        container: handle.parentElement,
        filter: function () { return true; },
        onStart: function () { return undefined; },
        onDrag: function () { return undefined; },
        onEnd: function () { return undefined; },
        minDelta: 2,
    }, options);
    var ueberElement = null;
    // converts the given x coordinate to be relative to the given element
    var toContainerRelative = function (x, elem) {
        var rect = elem.getBoundingClientRect();
        return x - rect.left - elem.clientLeft;
    };
    var start = 0;
    var last = 0;
    var handleShift = 0;
    var mouseMove = function (evt) {
        if (!o.filter(evt)) {
            return;
        }
        evt.stopPropagation();
        evt.preventDefault();
        var end = toContainerRelative(evt.clientX, o.container) - handleShift;
        if (Math.abs(last - end) < o.minDelta) {
            //ignore
            return;
        }
        last = end;
        o.onDrag(handle, end, last - end, evt);
    };
    var mouseUp = function (evt) {
        if (!o.filter(evt)) {
            return;
        }
        evt.stopPropagation();
        evt.preventDefault();
        var end = toContainerRelative(evt.clientX, o.container) - handleShift;
        ueberElement.removeEventListener('mousemove', mouseMove);
        ueberElement.removeEventListener('mouseup', mouseUp);
        ueberElement.removeEventListener('mouseleave', mouseUp);
        ueberElement.classList.remove(cssClass('dragging'));
        if (Math.abs(start - end) < 2) {
            //ignore
            return;
        }
        o.onEnd(handle, end, start - end, evt);
    };
    handle.onmousedown = function (evt) {
        if (!o.filter(evt)) {
            return;
        }
        evt.stopPropagation();
        evt.preventDefault();
        handleShift = toContainerRelative(evt.clientX, handle);
        start = last = toContainerRelative(evt.clientX, o.container) - handleShift;
        // register other event listeners
        ueberElement = handle.closest('body') || handle.closest(".".concat(cssClass())); // take the whole body or root lineup
        ueberElement.addEventListener('mousemove', mouseMove);
        ueberElement.addEventListener('mouseup', mouseUp);
        ueberElement.addEventListener('mouseleave', mouseUp);
        ueberElement.classList.add(cssClass('dragging'));
        o.onStart(handle, start, 0, evt);
    };
}
//# sourceMappingURL=drag.js.map