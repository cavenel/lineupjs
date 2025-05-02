import { range } from 'lineupengine';
import { isGroup, Ranking } from '../model';
import { aria, cssClass, engineCssClass, SLOPEGRAPH_WIDTH } from '../styles';
import { EMode } from './interfaces';
import { forEachIndices, filterIndices } from '../model/internal';
class ItemSlope {
    constructor(left, right, dataIndices) {
        this.left = left;
        this.right = right;
        this.dataIndices = dataIndices;
    }
    isSelected(selection) {
        return this.dataIndices.length === 1
            ? selection.has(this.dataIndices[0])
            : this.dataIndices.some((s) => selection.has(s));
    }
    update(path, width) {
        path.setAttribute('data-i', String(this.dataIndices[0]));
        path.setAttribute('class', cssClass('slope'));
        path.setAttribute('d', `M0,${this.left}L${width},${this.right}`);
    }
}
class GroupSlope {
    constructor(left, right, dataIndices) {
        this.left = left;
        this.right = right;
        this.dataIndices = dataIndices;
    }
    isSelected(selection) {
        return this.dataIndices.some((s) => selection.has(s));
    }
    update(path, width) {
        path.setAttribute('class', cssClass('group-slope'));
        path.setAttribute('d', `M0,${this.left[0]}L${width},${this.right[0]}L${width},${this.right[1]}L0,${this.left[1]}Z`);
    }
}
export default class SlopeGraph {
    constructor(header, body, id, ctx, options = {}) {
        this.header = header;
        this.body = body;
        this.id = id;
        this.ctx = ctx;
        this.leftSlopes = [];
        // rendered row to one ore multiple slopes
        this.rightSlopes = [];
        this.pool = [];
        this.scrollListener = null;
        this.width = SLOPEGRAPH_WIDTH;
        this.height = 0;
        this.current = null;
        this.chosen = new Set();
        this.chosenSelectionOnly = new Set();
        this._mode = EMode.ITEM;
        this.node = header.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.node.innerHTML = `<g transform="translate(0,0)"></g>`;
        header.classList.add(cssClass('slopegraph-header'));
        this._mode = options.mode === EMode.BAND ? EMode.BAND : EMode.ITEM;
        this.initHeader(header);
        body.classList.add(cssClass('slopegraph'));
        this.body.style.height = `1px`;
        body.appendChild(this.node);
    }
    init() {
        this.hide(); // hide by default
        const scroller = this.body.parentElement;
        //sync scrolling of header and body
        // use internals from lineup engine
        const scroll = scroller.__le_scroller__;
        let old = scroll.asInfo();
        scroll.push('animation', (this.scrollListener = (act) => {
            if (Math.abs(old.top - act.top) < 5) {
                return;
            }
            old = act;
            this.onScrolledVertically(act.top, act.height);
        }));
    }
    initHeader(header) {
        const active = cssClass('active');
        header.innerHTML = `<i title="Item" class="${this._mode === EMode.ITEM ? active : ''}">${aria('Item')}</i>
        <i title="Band" class="${this._mode === EMode.BAND ? active : ''}">${aria('Band')}</i>`;
        const icons = Array.from(header.children);
        icons.forEach((n, i) => {
            n.onclick = (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                if (n.classList.contains(active)) {
                    return;
                }
                this.mode = i === 0 ? EMode.ITEM : EMode.BAND;
                icons.forEach((d, j) => d.classList.toggle(active, j === i));
            };
        });
    }
    get mode() {
        return this._mode;
    }
    set mode(value) {
        if (value === this._mode) {
            return;
        }
        this._mode = value;
        if (this.current) {
            this.rebuild(this.current.leftRanking, this.current.left, this.current.leftContext, this.current.rightRanking, this.current.right, this.current.rightContext);
        }
    }
    get hidden() {
        return this.header.classList.contains(engineCssClass('loading'));
    }
    set hidden(value) {
        this.header.classList.toggle(engineCssClass('loading'), value);
        this.body.classList.toggle(engineCssClass('loading'), value);
    }
    hide() {
        this.hidden = true;
    }
    show() {
        const was = this.hidden;
        this.hidden = false;
        if (was) {
            this.revalidate();
        }
    }
    destroy() {
        this.header.remove();
        if (this.scrollListener) {
            //sync scrolling of header and body
            // use internals from lineup engine
            const scroll = this.body.parentElement.__le_scroller__;
            scroll.remove(this.scrollListener);
        }
        this.body.remove();
    }
    rebuild(leftRanking, left, leftContext, rightRanking, right, rightContext) {
        this.current = { leftRanking, left, leftContext, right, rightRanking, rightContext };
        const lookup = this.prepareRightSlopes(right, rightContext);
        this.computeSlopes(left, leftContext, lookup);
        this.revalidate();
    }
    computeSlopes(left, leftContext, lookup) {
        const mode = this.mode;
        const fakeGroups = new Map();
        const createFakeGroup = (first, group) => {
            let count = 0;
            let height = 0;
            // find all items in this group, assuming that they are in order
            for (let i = first; i < left.length; ++i) {
                const item = left[i];
                if (isGroup(item) || item.group !== group) {
                    break;
                }
                count++;
                height += leftContext.exceptionsLookup.get(i) || leftContext.defaultRowHeight;
            }
            const padded = height - leftContext.padding(first + count - 1);
            const gr = group;
            return { gr, padded, height };
        };
        let acc = 0;
        this.leftSlopes = left.map((r, i) => {
            let height = leftContext.exceptionsLookup.get(i) || leftContext.defaultRowHeight;
            let padded = height - 0; //leftContext.padding(i);
            const slopes = [];
            const start = acc;
            // shift by item height
            acc += height;
            let offset = 0;
            const push = (s, right, common = 1, heightPerRow = 0) => {
                // store slope in both
                slopes.push(s);
                forEachIndices(right.ref, (r) => this.rightSlopes[r].push(s));
                // update the offset of myself and of the right side
                right.offset += common * right.heightPerRow;
                offset += common * heightPerRow;
            };
            let gr;
            if (isGroup(r)) {
                gr = r;
            }
            else {
                const item = r;
                const dataIndex = item.dataIndex;
                const right = lookup.get(dataIndex);
                if (!right) {
                    // no match
                    return slopes;
                }
                if (mode === EMode.ITEM) {
                    const s = new ItemSlope(start + padded / 2, right.start + right.offset + right.heightPerRow / 2, [dataIndex]);
                    push(s, right);
                    return slopes;
                }
                if (fakeGroups.has(item.group)) {
                    // already handled by the first one, take the fake slopes
                    return fakeGroups.get(item.group);
                }
                const fakeGroup = createFakeGroup(i, item.group);
                gr = fakeGroup.gr;
                height = fakeGroup.height;
                padded = fakeGroup.padded;
                fakeGroups.set(item.group, slopes);
            }
            // free group items to share
            const free = new Set(gr.order);
            const heightPerRow = padded / gr.order.length;
            forEachIndices(gr.order, (d) => {
                if (!free.has(d)) {
                    return; // already handled
                }
                free.delete(d);
                const right = lookup.get(d);
                if (!right) {
                    return; // no matching
                }
                // find all of this group
                const intersection = filterIndices(right.rows, (r) => free.delete(r));
                intersection.push(d); //self
                const common = intersection.length;
                let s;
                if (common === 1) {
                    s = new ItemSlope(start + offset + heightPerRow / 2, right.start + right.offset + right.heightPerRow / 2, [
                        d,
                    ]);
                }
                else if (mode === EMode.ITEM) {
                    // fake item
                    s = new ItemSlope(start + offset + (heightPerRow * common) / 2, right.start + right.offset + (right.heightPerRow * common) / 2, intersection);
                }
                else {
                    s = new GroupSlope([start + offset, start + offset + heightPerRow * common], [right.start + right.offset, right.start + right.offset + right.heightPerRow * common], intersection);
                }
                push(s, right, common, heightPerRow);
            });
            return slopes;
        });
    }
    prepareRightSlopes(right, rightContext) {
        const lookup = new Map();
        const mode = this.mode;
        const fakeGroups = new Map();
        let acc = 0;
        this.rightSlopes = right.map((r, i) => {
            const height = rightContext.exceptionsLookup.get(i) || rightContext.defaultRowHeight;
            const padded = height - 0; //rightContext.padding(i);
            const start = acc;
            acc += height;
            const slopes = [];
            const base = {
                start,
                offset: 0,
                ref: [i],
            };
            if (isGroup(r)) {
                const p = Object.assign(base, {
                    rows: Array.from(r.order),
                    heightPerRow: padded / r.order.length,
                    group: r,
                });
                forEachIndices(r.order, (ri) => lookup.set(ri, p));
                return slopes;
            }
            // item
            const item = r;
            const dataIndex = r.dataIndex;
            let p = Object.assign(base, {
                rows: [dataIndex],
                heightPerRow: padded,
                group: item.group,
            });
            if (mode === EMode.ITEM) {
                lookup.set(dataIndex, p);
                return slopes;
            }
            // forced band mode
            // merge with the 'ueber' band
            if (!fakeGroups.has(item.group)) {
                p.heightPerRow = height; // include padding
                // TODO just support uniform item height
                fakeGroups.set(item.group, p);
            }
            else {
                // reuse old
                p = fakeGroups.get(item.group);
                p.rows.push(dataIndex);
                p.ref.push(i);
            }
            lookup.set(dataIndex, p);
            return slopes;
        });
        return lookup;
    }
    revalidate() {
        if (!this.current || this.hidden) {
            return;
        }
        const p = this.body.parentElement;
        this.onScrolledVertically(p.scrollTop, p.clientHeight);
    }
    highlight(dataIndex) {
        const highlight = engineCssClass('highlighted');
        const old = this.body.querySelector(`[data-i].${highlight}`);
        if (old) {
            old.classList.remove(highlight);
        }
        if (dataIndex < 0) {
            return false;
        }
        const item = this.body.querySelector(`[data-i="${dataIndex}"]`);
        if (item) {
            item.classList.add(highlight);
        }
        return item != null;
    }
    onScrolledVertically(scrollTop, clientHeight) {
        if (!this.current) {
            return;
        }
        // which lines are currently shown
        const { leftContext, rightContext } = this.current;
        const left = range(scrollTop, clientHeight, leftContext.defaultRowHeight, leftContext.exceptions, leftContext.numberOfRows);
        const right = range(scrollTop, clientHeight, rightContext.defaultRowHeight, rightContext.exceptions, rightContext.numberOfRows);
        const start = Math.min(left.firstRowPos, right.firstRowPos);
        const end = Math.max(left.endPos, right.endPos);
        // move to right position
        this.body.style.transform = `translate(0, ${start.toFixed(0)}px)`;
        this.body.style.height = `${(end - start).toFixed(0)}px`;
        this.node.firstElementChild.setAttribute('transform', `translate(0,-${start.toFixed(0)})`);
        this.chosen = this.choose(left.first, left.last, right.first, right.last);
        this.render(this.chosen, this.chooseSelection(left.first, left.last, this.chosen));
    }
    choose(leftVisibleFirst, leftVisibleLast, rightVisibleFirst, rightVisibleLast) {
        // assume no separate scrolling
        const slopes = new Set();
        for (let i = leftVisibleFirst; i <= leftVisibleLast; ++i) {
            for (const s of this.leftSlopes[i]) {
                slopes.add(s);
            }
        }
        for (let i = rightVisibleFirst; i <= rightVisibleLast; ++i) {
            for (const s of this.rightSlopes[i]) {
                slopes.add(s);
            }
        }
        return slopes;
    }
    chooseSelection(leftVisibleFirst, leftVisibleLast, alreadyVisible) {
        const slopes = new Set();
        // ensure selected slopes are always part of
        const p = this.ctx.provider;
        if (p.getSelection().length === 0) {
            return slopes;
        }
        const selectionLookup = { has: (dataIndex) => p.isSelected(dataIndex) };
        // try all not visible ones
        for (let i = 0; i < leftVisibleFirst; ++i) {
            for (const s of this.leftSlopes[i]) {
                if (s.isSelected(selectionLookup) && !alreadyVisible.has(s)) {
                    slopes.add(s);
                }
            }
        }
        for (let i = leftVisibleLast + 1; i < this.leftSlopes.length; ++i) {
            for (const s of this.leftSlopes[i]) {
                if (s.isSelected(selectionLookup) && !alreadyVisible.has(s)) {
                    slopes.add(s);
                }
            }
        }
        return slopes;
    }
    updatePath(p, g, s, width, selection) {
        s.update(p, width);
        p.__data__ = s; // data binding
        const selected = s.isSelected(selection);
        p.classList.toggle(cssClass('selected'), selected);
        if (selected) {
            g.appendChild(p); // to put it on top
        }
    }
    render(visible, selectionSlopes) {
        const g = this.node.firstElementChild;
        const width = g.ownerSVGElement.getBoundingClientRect().width;
        const paths = this.matchLength(visible.size + selectionSlopes.size, g);
        const p = this.ctx.provider;
        const selectionLookup = { has: (dataIndex) => p.isSelected(dataIndex) };
        // update paths
        let i = 0;
        const updatePath = (s) => {
            this.updatePath(paths[i++], g, s, width, selectionLookup);
        };
        visible.forEach(updatePath);
        selectionSlopes.forEach(updatePath);
    }
    addPath(g) {
        const elem = this.pool.pop();
        if (elem) {
            g.appendChild(elem);
            return elem;
        }
        const path = g.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.onclick = (evt) => {
            // d3 style
            const s = path.__data__;
            const p = this.ctx.provider;
            const ids = s.dataIndices;
            if (evt.ctrlKey) {
                ids.forEach((id) => p.toggleSelection(id, true));
            }
            else {
                // either unset or set depending on the first state
                const isSelected = p.isSelected(ids[0]);
                p.setSelection(isSelected ? [] : ids);
            }
        };
        g.appendChild(path);
        return path;
    }
    matchLength(slopes, g) {
        const paths = Array.from(g.children);
        for (let i = slopes; i < paths.length; ++i) {
            const elem = paths[i];
            this.pool.push(elem);
            elem.remove();
        }
        for (let i = paths.length; i < slopes; ++i) {
            paths.push(this.addPath(g));
        }
        return paths;
    }
    updateSelection(selectedDataIndices) {
        const g = this.node.firstElementChild;
        const paths = Array.from(g.children);
        const openDataIndices = new Set(selectedDataIndices);
        if (selectedDataIndices.size === 0) {
            // clear
            for (const p of paths) {
                const s = p.__data__;
                p.classList.toggle(cssClass('selected'), false);
                if (this.chosenSelectionOnly.has(s)) {
                    p.remove();
                }
            }
            this.chosenSelectionOnly.clear();
            return;
        }
        for (const p of paths) {
            const s = p.__data__;
            const selected = s.isSelected(selectedDataIndices);
            p.classList.toggle(cssClass('selected'), selected);
            if (!selected) {
                if (this.chosenSelectionOnly.delete(s)) {
                    // was only needed because of the selection
                    p.remove();
                }
                continue;
            }
            g.appendChild(p); // to put it on top
            // remove already handled
            s.dataIndices.forEach((d) => openDataIndices.delete(d));
        }
        if (openDataIndices.size === 0) {
            return;
        }
        // find and add missing slopes
        const width = g.ownerSVGElement.getBoundingClientRect().width;
        for (const ss of this.leftSlopes) {
            for (const s of ss) {
                if (this.chosen.has(s) || this.chosenSelectionOnly.has(s) || !s.isSelected(openDataIndices)) {
                    // not visible or not selected -> skip
                    continue;
                }
                // create new path for it
                this.chosenSelectionOnly.add(s);
                const p = this.addPath(g);
                this.updatePath(p, g, s, width, openDataIndices);
            }
        }
    }
}
