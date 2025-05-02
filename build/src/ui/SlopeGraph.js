import { range } from 'lineupengine';
import { isGroup, Ranking } from '../model';
import { aria, cssClass, engineCssClass, SLOPEGRAPH_WIDTH } from '../styles';
import { EMode } from './interfaces';
import { forEachIndices, filterIndices } from '../model/internal';
var ItemSlope = /** @class */ (function () {
    function ItemSlope(left, right, dataIndices) {
        this.left = left;
        this.right = right;
        this.dataIndices = dataIndices;
    }
    ItemSlope.prototype.isSelected = function (selection) {
        return this.dataIndices.length === 1
            ? selection.has(this.dataIndices[0])
            : this.dataIndices.some(function (s) { return selection.has(s); });
    };
    ItemSlope.prototype.update = function (path, width) {
        path.setAttribute('data-i', String(this.dataIndices[0]));
        path.setAttribute('class', cssClass('slope'));
        path.setAttribute('d', "M0,".concat(this.left, "L").concat(width, ",").concat(this.right));
    };
    return ItemSlope;
}());
var GroupSlope = /** @class */ (function () {
    function GroupSlope(left, right, dataIndices) {
        this.left = left;
        this.right = right;
        this.dataIndices = dataIndices;
    }
    GroupSlope.prototype.isSelected = function (selection) {
        return this.dataIndices.some(function (s) { return selection.has(s); });
    };
    GroupSlope.prototype.update = function (path, width) {
        path.setAttribute('class', cssClass('group-slope'));
        path.setAttribute('d', "M0,".concat(this.left[0], "L").concat(width, ",").concat(this.right[0], "L").concat(width, ",").concat(this.right[1], "L0,").concat(this.left[1], "Z"));
    };
    return GroupSlope;
}());
var SlopeGraph = /** @class */ (function () {
    function SlopeGraph(header, body, id, ctx, options) {
        if (options === void 0) { options = {}; }
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
        this.node.innerHTML = "<g transform=\"translate(0,0)\"></g>";
        header.classList.add(cssClass('slopegraph-header'));
        this._mode = options.mode === EMode.BAND ? EMode.BAND : EMode.ITEM;
        this.initHeader(header);
        body.classList.add(cssClass('slopegraph'));
        this.body.style.height = "1px";
        body.appendChild(this.node);
    }
    SlopeGraph.prototype.init = function () {
        var _this = this;
        this.hide(); // hide by default
        var scroller = this.body.parentElement;
        //sync scrolling of header and body
        // use internals from lineup engine
        var scroll = scroller.__le_scroller__;
        var old = scroll.asInfo();
        scroll.push('animation', (this.scrollListener = function (act) {
            if (Math.abs(old.top - act.top) < 5) {
                return;
            }
            old = act;
            _this.onScrolledVertically(act.top, act.height);
        }));
    };
    SlopeGraph.prototype.initHeader = function (header) {
        var _this = this;
        var active = cssClass('active');
        header.innerHTML = "<i title=\"Item\" class=\"".concat(this._mode === EMode.ITEM ? active : '', "\">").concat(aria('Item'), "</i>\n        <i title=\"Band\" class=\"").concat(this._mode === EMode.BAND ? active : '', "\">").concat(aria('Band'), "</i>");
        var icons = Array.from(header.children);
        icons.forEach(function (n, i) {
            n.onclick = function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if (n.classList.contains(active)) {
                    return;
                }
                _this.mode = i === 0 ? EMode.ITEM : EMode.BAND;
                icons.forEach(function (d, j) { return d.classList.toggle(active, j === i); });
            };
        });
    };
    Object.defineProperty(SlopeGraph.prototype, "mode", {
        get: function () {
            return this._mode;
        },
        set: function (value) {
            if (value === this._mode) {
                return;
            }
            this._mode = value;
            if (this.current) {
                this.rebuild(this.current.leftRanking, this.current.left, this.current.leftContext, this.current.rightRanking, this.current.right, this.current.rightContext);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SlopeGraph.prototype, "hidden", {
        get: function () {
            return this.header.classList.contains(engineCssClass('loading'));
        },
        set: function (value) {
            this.header.classList.toggle(engineCssClass('loading'), value);
            this.body.classList.toggle(engineCssClass('loading'), value);
        },
        enumerable: false,
        configurable: true
    });
    SlopeGraph.prototype.hide = function () {
        this.hidden = true;
    };
    SlopeGraph.prototype.show = function () {
        var was = this.hidden;
        this.hidden = false;
        if (was) {
            this.revalidate();
        }
    };
    SlopeGraph.prototype.destroy = function () {
        this.header.remove();
        if (this.scrollListener) {
            //sync scrolling of header and body
            // use internals from lineup engine
            var scroll_1 = this.body.parentElement.__le_scroller__;
            scroll_1.remove(this.scrollListener);
        }
        this.body.remove();
    };
    SlopeGraph.prototype.rebuild = function (leftRanking, left, leftContext, rightRanking, right, rightContext) {
        this.current = { leftRanking: leftRanking, left: left, leftContext: leftContext, right: right, rightRanking: rightRanking, rightContext: rightContext };
        var lookup = this.prepareRightSlopes(right, rightContext);
        this.computeSlopes(left, leftContext, lookup);
        this.revalidate();
    };
    SlopeGraph.prototype.computeSlopes = function (left, leftContext, lookup) {
        var _this = this;
        var mode = this.mode;
        var fakeGroups = new Map();
        var createFakeGroup = function (first, group) {
            var count = 0;
            var height = 0;
            // find all items in this group, assuming that they are in order
            for (var i = first; i < left.length; ++i) {
                var item = left[i];
                if (isGroup(item) || item.group !== group) {
                    break;
                }
                count++;
                height += leftContext.exceptionsLookup.get(i) || leftContext.defaultRowHeight;
            }
            var padded = height - leftContext.padding(first + count - 1);
            var gr = group;
            return { gr: gr, padded: padded, height: height };
        };
        var acc = 0;
        this.leftSlopes = left.map(function (r, i) {
            var height = leftContext.exceptionsLookup.get(i) || leftContext.defaultRowHeight;
            var padded = height - 0; //leftContext.padding(i);
            var slopes = [];
            var start = acc;
            // shift by item height
            acc += height;
            var offset = 0;
            var push = function (s, right, common, heightPerRow) {
                if (common === void 0) { common = 1; }
                if (heightPerRow === void 0) { heightPerRow = 0; }
                // store slope in both
                slopes.push(s);
                forEachIndices(right.ref, function (r) { return _this.rightSlopes[r].push(s); });
                // update the offset of myself and of the right side
                right.offset += common * right.heightPerRow;
                offset += common * heightPerRow;
            };
            var gr;
            if (isGroup(r)) {
                gr = r;
            }
            else {
                var item = r;
                var dataIndex = item.dataIndex;
                var right = lookup.get(dataIndex);
                if (!right) {
                    // no match
                    return slopes;
                }
                if (mode === EMode.ITEM) {
                    var s = new ItemSlope(start + padded / 2, right.start + right.offset + right.heightPerRow / 2, [dataIndex]);
                    push(s, right);
                    return slopes;
                }
                if (fakeGroups.has(item.group)) {
                    // already handled by the first one, take the fake slopes
                    return fakeGroups.get(item.group);
                }
                var fakeGroup = createFakeGroup(i, item.group);
                gr = fakeGroup.gr;
                height = fakeGroup.height;
                padded = fakeGroup.padded;
                fakeGroups.set(item.group, slopes);
            }
            // free group items to share
            var free = new Set(gr.order);
            var heightPerRow = padded / gr.order.length;
            forEachIndices(gr.order, function (d) {
                if (!free.has(d)) {
                    return; // already handled
                }
                free.delete(d);
                var right = lookup.get(d);
                if (!right) {
                    return; // no matching
                }
                // find all of this group
                var intersection = filterIndices(right.rows, function (r) { return free.delete(r); });
                intersection.push(d); //self
                var common = intersection.length;
                var s;
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
    };
    SlopeGraph.prototype.prepareRightSlopes = function (right, rightContext) {
        var lookup = new Map();
        var mode = this.mode;
        var fakeGroups = new Map();
        var acc = 0;
        this.rightSlopes = right.map(function (r, i) {
            var height = rightContext.exceptionsLookup.get(i) || rightContext.defaultRowHeight;
            var padded = height - 0; //rightContext.padding(i);
            var start = acc;
            acc += height;
            var slopes = [];
            var base = {
                start: start,
                offset: 0,
                ref: [i],
            };
            if (isGroup(r)) {
                var p_1 = Object.assign(base, {
                    rows: Array.from(r.order),
                    heightPerRow: padded / r.order.length,
                    group: r,
                });
                forEachIndices(r.order, function (ri) { return lookup.set(ri, p_1); });
                return slopes;
            }
            // item
            var item = r;
            var dataIndex = r.dataIndex;
            var p = Object.assign(base, {
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
    };
    SlopeGraph.prototype.revalidate = function () {
        if (!this.current || this.hidden) {
            return;
        }
        var p = this.body.parentElement;
        this.onScrolledVertically(p.scrollTop, p.clientHeight);
    };
    SlopeGraph.prototype.highlight = function (dataIndex) {
        var highlight = engineCssClass('highlighted');
        var old = this.body.querySelector("[data-i].".concat(highlight));
        if (old) {
            old.classList.remove(highlight);
        }
        if (dataIndex < 0) {
            return false;
        }
        var item = this.body.querySelector("[data-i=\"".concat(dataIndex, "\"]"));
        if (item) {
            item.classList.add(highlight);
        }
        return item != null;
    };
    SlopeGraph.prototype.onScrolledVertically = function (scrollTop, clientHeight) {
        if (!this.current) {
            return;
        }
        // which lines are currently shown
        var _a = this.current, leftContext = _a.leftContext, rightContext = _a.rightContext;
        var left = range(scrollTop, clientHeight, leftContext.defaultRowHeight, leftContext.exceptions, leftContext.numberOfRows);
        var right = range(scrollTop, clientHeight, rightContext.defaultRowHeight, rightContext.exceptions, rightContext.numberOfRows);
        var start = Math.min(left.firstRowPos, right.firstRowPos);
        var end = Math.max(left.endPos, right.endPos);
        // move to right position
        this.body.style.transform = "translate(0, ".concat(start.toFixed(0), "px)");
        this.body.style.height = "".concat((end - start).toFixed(0), "px");
        this.node.firstElementChild.setAttribute('transform', "translate(0,-".concat(start.toFixed(0), ")"));
        this.chosen = this.choose(left.first, left.last, right.first, right.last);
        this.render(this.chosen, this.chooseSelection(left.first, left.last, this.chosen));
    };
    SlopeGraph.prototype.choose = function (leftVisibleFirst, leftVisibleLast, rightVisibleFirst, rightVisibleLast) {
        // assume no separate scrolling
        var slopes = new Set();
        for (var i = leftVisibleFirst; i <= leftVisibleLast; ++i) {
            for (var _i = 0, _a = this.leftSlopes[i]; _i < _a.length; _i++) {
                var s = _a[_i];
                slopes.add(s);
            }
        }
        for (var i = rightVisibleFirst; i <= rightVisibleLast; ++i) {
            for (var _b = 0, _c = this.rightSlopes[i]; _b < _c.length; _b++) {
                var s = _c[_b];
                slopes.add(s);
            }
        }
        return slopes;
    };
    SlopeGraph.prototype.chooseSelection = function (leftVisibleFirst, leftVisibleLast, alreadyVisible) {
        var slopes = new Set();
        // ensure selected slopes are always part of
        var p = this.ctx.provider;
        if (p.getSelection().length === 0) {
            return slopes;
        }
        var selectionLookup = { has: function (dataIndex) { return p.isSelected(dataIndex); } };
        // try all not visible ones
        for (var i = 0; i < leftVisibleFirst; ++i) {
            for (var _i = 0, _a = this.leftSlopes[i]; _i < _a.length; _i++) {
                var s = _a[_i];
                if (s.isSelected(selectionLookup) && !alreadyVisible.has(s)) {
                    slopes.add(s);
                }
            }
        }
        for (var i = leftVisibleLast + 1; i < this.leftSlopes.length; ++i) {
            for (var _b = 0, _c = this.leftSlopes[i]; _b < _c.length; _b++) {
                var s = _c[_b];
                if (s.isSelected(selectionLookup) && !alreadyVisible.has(s)) {
                    slopes.add(s);
                }
            }
        }
        return slopes;
    };
    SlopeGraph.prototype.updatePath = function (p, g, s, width, selection) {
        s.update(p, width);
        p.__data__ = s; // data binding
        var selected = s.isSelected(selection);
        p.classList.toggle(cssClass('selected'), selected);
        if (selected) {
            g.appendChild(p); // to put it on top
        }
    };
    SlopeGraph.prototype.render = function (visible, selectionSlopes) {
        var _this = this;
        var g = this.node.firstElementChild;
        var width = g.ownerSVGElement.getBoundingClientRect().width;
        var paths = this.matchLength(visible.size + selectionSlopes.size, g);
        var p = this.ctx.provider;
        var selectionLookup = { has: function (dataIndex) { return p.isSelected(dataIndex); } };
        // update paths
        var i = 0;
        var updatePath = function (s) {
            _this.updatePath(paths[i++], g, s, width, selectionLookup);
        };
        visible.forEach(updatePath);
        selectionSlopes.forEach(updatePath);
    };
    SlopeGraph.prototype.addPath = function (g) {
        var _this = this;
        var elem = this.pool.pop();
        if (elem) {
            g.appendChild(elem);
            return elem;
        }
        var path = g.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.onclick = function (evt) {
            // d3 style
            var s = path.__data__;
            var p = _this.ctx.provider;
            var ids = s.dataIndices;
            if (evt.ctrlKey) {
                ids.forEach(function (id) { return p.toggleSelection(id, true); });
            }
            else {
                // either unset or set depending on the first state
                var isSelected = p.isSelected(ids[0]);
                p.setSelection(isSelected ? [] : ids);
            }
        };
        g.appendChild(path);
        return path;
    };
    SlopeGraph.prototype.matchLength = function (slopes, g) {
        var paths = Array.from(g.children);
        for (var i = slopes; i < paths.length; ++i) {
            var elem = paths[i];
            this.pool.push(elem);
            elem.remove();
        }
        for (var i = paths.length; i < slopes; ++i) {
            paths.push(this.addPath(g));
        }
        return paths;
    };
    SlopeGraph.prototype.updateSelection = function (selectedDataIndices) {
        var g = this.node.firstElementChild;
        var paths = Array.from(g.children);
        var openDataIndices = new Set(selectedDataIndices);
        if (selectedDataIndices.size === 0) {
            // clear
            for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
                var p = paths_1[_i];
                var s = p.__data__;
                p.classList.toggle(cssClass('selected'), false);
                if (this.chosenSelectionOnly.has(s)) {
                    p.remove();
                }
            }
            this.chosenSelectionOnly.clear();
            return;
        }
        for (var _a = 0, paths_2 = paths; _a < paths_2.length; _a++) {
            var p = paths_2[_a];
            var s = p.__data__;
            var selected = s.isSelected(selectedDataIndices);
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
            s.dataIndices.forEach(function (d) { return openDataIndices.delete(d); });
        }
        if (openDataIndices.size === 0) {
            return;
        }
        // find and add missing slopes
        var width = g.ownerSVGElement.getBoundingClientRect().width;
        for (var _b = 0, _c = this.leftSlopes; _b < _c.length; _b++) {
            var ss = _c[_b];
            for (var _d = 0, ss_1 = ss; _d < ss_1.length; _d++) {
                var s = ss_1[_d];
                if (this.chosen.has(s) || this.chosenSelectionOnly.has(s) || !s.isSelected(openDataIndices)) {
                    // not visible or not selected -> skip
                    continue;
                }
                // create new path for it
                this.chosenSelectionOnly.add(s);
                var p = this.addPath(g);
                this.updatePath(p, g, s, width, openDataIndices);
            }
        }
    };
    return SlopeGraph;
}());
export default SlopeGraph;
//# sourceMappingURL=SlopeGraph.js.map