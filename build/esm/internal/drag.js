import { cssClass } from '../styles';
/**
 * allow to change the width of a column using dragging the handle
 * @internal
 */
export function dragHandle(handle, options = {}) {
    const o = Object.assign({
        container: handle.parentElement,
        filter: () => true,
        onStart: () => undefined,
        onDrag: () => undefined,
        onEnd: () => undefined,
        minDelta: 2,
    }, options);
    let ueberElement = null;
    // converts the given x coordinate to be relative to the given element
    const toContainerRelative = (x, elem) => {
        const rect = elem.getBoundingClientRect();
        return x - rect.left - elem.clientLeft;
    };
    let start = 0;
    let last = 0;
    let handleShift = 0;
    const mouseMove = (evt) => {
        if (!o.filter(evt)) {
            return;
        }
        evt.stopPropagation();
        evt.preventDefault();
        const end = toContainerRelative(evt.clientX, o.container) - handleShift;
        if (Math.abs(last - end) < o.minDelta) {
            //ignore
            return;
        }
        last = end;
        o.onDrag(handle, end, last - end, evt);
    };
    const mouseUp = (evt) => {
        if (!o.filter(evt)) {
            return;
        }
        evt.stopPropagation();
        evt.preventDefault();
        const end = toContainerRelative(evt.clientX, o.container) - handleShift;
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
    handle.onmousedown = (evt) => {
        if (!o.filter(evt)) {
            return;
        }
        evt.stopPropagation();
        evt.preventDefault();
        handleShift = toContainerRelative(evt.clientX, handle);
        start = last = toContainerRelative(evt.clientX, o.container) - handleShift;
        // register other event listeners
        ueberElement = handle.closest('body') || handle.closest(`.${cssClass()}`); // take the whole body or root lineup
        ueberElement.addEventListener('mousemove', mouseMove);
        ueberElement.addEventListener('mouseup', mouseUp);
        ueberElement.addEventListener('mouseleave', mouseUp);
        ueberElement.classList.add(cssClass('dragging'));
        o.onStart(handle, start, 0, evt);
    };
}
