import { OrderedSet, AEventDispatcher } from '../internal';
import { isGroup } from '../model';
import { cssClass, engineCssClass } from '../styles';
import { forEachIndices } from '../model/internal';
import { rangeSelection } from '../provider/utils';
import { detect } from 'detect-browser';
/** @internal */
class SelectionManager extends AEventDispatcher {
    constructor(ctx, body, { selectionActivateFilter = true } = {}) {
        var _a;
        super();
        this.ctx = ctx;
        this.body = body;
        this.selectionActivateFilter = true;
        this.start = null;
        this.isFirefox = ((_a = detect()) === null || _a === void 0 ? void 0 : _a.name) === 'firefox';
        this.selectionActivateFilter = selectionActivateFilter;
        const root = body.parentElement.parentElement;
        let hr = root.querySelector('hr');
        if (!hr) {
            hr = root.ownerDocument.createElement('hr');
            root.appendChild(hr);
        }
        this.hr = hr;
        this.hr.classList.add(cssClass('hr'));
        const mouseMove = (evt) => {
            this.showHint(evt);
        };
        const mouseUp = (evt) => {
            this.body.removeEventListener('mousemove', mouseMove);
            this.body.removeEventListener('mouseup', mouseUp);
            this.body.removeEventListener('mouseleave', mouseUp);
            if (!this.start) {
                return;
            }
            const row = engineCssClass('tr');
            const startNode = this.start.node.classList.contains(row)
                ? this.start.node
                : this.start.node.closest(`.${row}`);
            // somehow on firefox the mouseUp will be triggered on the original node
            // thus search the node explicitly
            const end = this.body.ownerDocument.elementFromPoint(evt.clientX, evt.clientY);
            const endNode = end.classList.contains(row) ? end : end.closest(`.${row}`);
            this.start = null;
            this.body.classList.remove(cssClass('selection-active'));
            this.hr.classList.remove(cssClass('selection-active'));
            this.select(evt.ctrlKey, startNode, endNode);
        };
        if (this.selectionActivateFilter !== false) {
            body.addEventListener('mousedown', (evt) => {
                var _a, _b;
                // activate only when filter is satisfied
                if (!(this.selectionActivateFilter !== false &&
                    (this.selectionActivateFilter === true ||
                        ((_a = evt.target) === null || _a === void 0 ? void 0 : _a.matches(this.selectionActivateFilter)) ||
                        ((_b = evt.target) === null || _b === void 0 ? void 0 : _b.closest(this.selectionActivateFilter)) != null))) {
                    return;
                }
                const r = root.getBoundingClientRect();
                this.start = {
                    x: evt.clientX,
                    y: evt.clientY,
                    xShift: r.left,
                    yShift: r.top,
                    node: evt.target,
                };
                this.body.classList.add(cssClass('selection-active'));
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
    }
    createEventList() {
        return super.createEventList().concat([SelectionManager.EVENT_SELECT_RANGE]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    select(additional, startNode, endNode) {
        if (!startNode || !endNode || startNode === endNode) {
            return; // no single
        }
        const startIndex = Number.parseInt(startNode.dataset.index, 10);
        const endIndex = Number.parseInt(endNode.dataset.index, 10);
        const from = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        if (from === end) {
            return; // no single
        }
        // bounce event end
        requestAnimationFrame(() => this.fire(SelectionManager.EVENT_SELECT_RANGE, from, end, additional));
    }
    showHint(end) {
        const start = this.start;
        const sy = start.y;
        const ey = end.clientY;
        const visible = Math.abs(sy - ey) > SelectionManager.MIN_DISTANCE;
        this.hr.classList.toggle(cssClass('selection-active'), visible);
        this.hr.style.transform = `translate(${start.x - start.xShift}px,${sy - start.yShift}px)scale(1,${Math.abs(ey - sy)})rotate(${ey > sy ? 90 : -90}deg)`;
    }
    remove(node) {
        node.onclick = undefined;
    }
    add(node) {
        node.onclick = (evt) => {
            if (this.isFirefox) {
                const bb = node.getBoundingClientRect();
                // mouse up outside the element
                if (evt.offsetY < 0 || evt.offsetY > bb.height || evt.offsetX < 0 || evt.offsetY > bb.width) {
                    return;
                }
            }
            const dataIndex = Number.parseInt(node.dataset.i, 10);
            if (evt.shiftKey) {
                const relIndex = Number.parseInt(node.dataset.index, 10);
                const ranking = node.parentElement.dataset.ranking;
                if (rangeSelection(this.ctx.provider, ranking, dataIndex, relIndex, evt.ctrlKey)) {
                    return;
                }
            }
            this.ctx.provider.toggleSelection(dataIndex, evt.ctrlKey);
        };
    }
    selectRange(rows, additional = false) {
        const current = new OrderedSet(additional ? this.ctx.provider.getSelection() : []);
        const toggle = (dataIndex) => {
            if (current.has(dataIndex)) {
                current.delete(dataIndex);
            }
            else {
                current.add(dataIndex);
            }
        };
        rows.forEach((d) => {
            if (isGroup(d)) {
                forEachIndices(d.order, toggle);
            }
            else {
                toggle(d.dataIndex);
            }
        });
        this.ctx.provider.setSelection(Array.from(current));
    }
    updateState(node, dataIndex) {
        if (this.ctx.provider.isSelected(dataIndex)) {
            node.classList.add(cssClass('selected'));
        }
        else {
            node.classList.remove(cssClass('selected'));
        }
    }
    update(node, selectedDataIndices) {
        const dataIndex = Number.parseInt(node.dataset.i, 10);
        if (selectedDataIndices.has(dataIndex)) {
            node.classList.add(cssClass('selected'));
        }
        else {
            node.classList.remove(cssClass('selected'));
        }
    }
}
SelectionManager.EVENT_SELECT_RANGE = 'selectRange';
SelectionManager.MIN_DISTANCE = 10;
export default SelectionManager;
