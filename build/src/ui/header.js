var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { MIN_LABEL_WIDTH } from '../constants';
import { dragAble, dropAble, hasDnDType } from '../internal';
import { categoryOf } from '../model';
import { createStackDesc, isArrayColumn, isBoxPlotColumn, isCategoricalColumn, isMapColumn, isNumberColumn, isNumbersColumn, Column, createImpositionDesc, createImpositionsDesc, createImpositionBoxPlotDesc, CompositeColumn, isMultiLevelColumn, } from '../model';
import { aria, cssClass, engineCssClass, RESIZE_ANIMATION_DURATION, RESIZE_SPACE } from '../styles';
import MoreColumnOptionsDialog from './dialogs/MoreColumnOptionsDialog';
import { getToolbar } from './toolbarResolvers';
import { dialogContext } from './dialogs';
import { addIconDOM, actionCSSClass, isActionMode, updateIconState } from './headerTooltip';
import { setText } from '../renderer/utils';
export { createToolbarMenuItems, actionCSSClass } from './headerTooltip';
function setTextOrEmpty(node, condition, text, asHTML) {
    if (asHTML === void 0) { asHTML = false; }
    if (condition) {
        setText(node, ' ');
    }
    else if (asHTML) {
        node.innerHTML = text;
    }
    else {
        setText(node, text);
    }
    return node;
}
/** @internal */
export function createHeader(col, ctx, options) {
    var _a;
    if (options === void 0) { options = {}; }
    options = Object.assign({
        dragAble: true,
        mergeDropAble: true,
        rearrangeAble: true,
        resizeable: true,
        level: 0,
        extraPrefix: '',
    }, options);
    var node = ctx.document.createElement('section');
    var extra = options.extraPrefix
        ? function (name) { return "".concat(cssClass(name), " ").concat(cssClass("".concat(options.extraPrefix, "-").concat(name))); }
        : cssClass;
    node.innerHTML = "\n    <div class=\"".concat(extra('label'), " ").concat(cssClass('typed-icon'), "\"></div>\n    <div class=\"").concat(extra('sublabel'), "\"></div>\n    <div class=\"").concat(extra('toolbar'), "\"></div>\n    <div class=\"").concat(extra('spacing'), "\"></div>\n    <div class=\"").concat(extra('handle'), " ").concat(cssClass('feature-advanced'), " ").concat(cssClass('feature-ui'), "\"></div>\n    ").concat(options.mergeDropAble ? "<div class=\"".concat(extra('header-drop'), " ").concat(extra('merger'), "\"></div>") : '', "\n    ").concat(options.rearrangeAble
        ? "<div class=\"".concat(extra('header-drop'), " ").concat(extra('placer'), "\" data-draginfo=\"Place here\"></div>")
        : '', "\n  ");
    var label = col.getHeaderLabel('header');
    setTextOrEmpty(node.firstElementChild, col.getWidth() < MIN_LABEL_WIDTH, label.content, label.asHTML);
    var summary = col.getSummaryLabel('header');
    setTextOrEmpty(node.children[1], col.getWidth() < MIN_LABEL_WIDTH || !summary, summary.content, summary.asHTML);
    // addTooltip(node, col);
    createShortcutMenuItems(node.getElementsByClassName(cssClass('toolbar'))[0], options.level, col, ctx, 'header');
    toggleToolbarIcons(node, col);
    if (options.dragAble) {
        dragAbleColumn(node, col, ctx);
    }
    if (options.mergeDropAble) {
        var merger = node.getElementsByClassName(cssClass('merger'))[0];
        if (!options.rearrangeAble) {
            merger.style.left = '0';
            merger.style.width = '100%';
        }
        mergeDropAble(merger, col, ctx);
    }
    if (options.rearrangeAble) {
        var placer = node.getElementsByClassName(cssClass('placer'))[0];
        var nextSibling = col.nextSibling();
        var widthFactor = !options.mergeDropAble ? 0.5 : 0.2;
        if (!options.mergeDropAble) {
            placer.style.left = '50%';
        }
        placer.style.width = "".concat(col.getWidth() * widthFactor + ((_a = nextSibling === null || nextSibling === void 0 ? void 0 : nextSibling.getWidth()) !== null && _a !== void 0 ? _a : 100) / 2, "px");
        rearrangeDropAble(placer, col, ctx);
    }
    if (options.resizeable) {
        dragWidth(col, node);
    }
    return node;
}
/** @internal */
export function updateHeader(node, col, labelCtx, minWidth) {
    var _a;
    if (labelCtx === void 0) { labelCtx = 'header'; }
    if (minWidth === void 0) { minWidth = MIN_LABEL_WIDTH; }
    var label = node.getElementsByClassName(cssClass('label'))[0];
    var labelText = col.getHeaderLabel(labelCtx);
    setTextOrEmpty(label, col.getWidth() < minWidth, labelText.content, labelText.asHTML);
    var summaryText = col.getSummaryLabel(labelCtx);
    var summary = col.desc.summary;
    var subLabel = node.getElementsByClassName(cssClass('sublabel'))[0];
    if (subLabel) {
        setTextOrEmpty(subLabel, col.getWidth() < minWidth || !summaryText.content, summaryText.content, summaryText.asHTML);
    }
    var title = col.label;
    if (summary) {
        title = "".concat(title, "\n").concat(summary);
    }
    if (col.description) {
        title = "".concat(title, "\n").concat(col.description);
    }
    node.title = title;
    node.dataset.colId = col.id;
    node.dataset.type = col.desc.type;
    label.dataset.typeCat = categoryOf(col).name;
    updateIconState(node, col);
    updateMoreDialogIcons(node, col);
    // update width for width of next sibling
    var placer = node.getElementsByClassName(cssClass('placer'))[0];
    if (placer) {
        var nextSibling = col.nextSibling();
        var widthFactor = node.getElementsByClassName(cssClass('merger')).length === 0 ? 0.5 : 0.2;
        placer.style.width = "".concat(col.getWidth() * widthFactor + ((_a = nextSibling === null || nextSibling === void 0 ? void 0 : nextSibling.getWidth()) !== null && _a !== void 0 ? _a : 100) * widthFactor + 5, "px");
    }
}
function updateMoreDialogIcons(node, col) {
    var root = node.closest(".".concat(cssClass()));
    if (!root) {
        return;
    }
    var dialog = root.querySelector(".".concat(cssClass('more-options'), "[data-col-id=\"").concat(col.id, "\"]"));
    if (!dialog) {
        return;
    }
    updateIconState(dialog, col);
}
/** @internal */
export function createShortcutMenuItems(node, level, col, ctx, mode, willAutoHide) {
    if (willAutoHide === void 0) { willAutoHide = true; }
    var addIcon = addIconDOM(node, col, ctx, level, false, mode);
    var toolbar = getToolbar(col, ctx);
    var shortcuts = toolbar.filter(function (d) { return !isActionMode(col, d, mode, 'menu'); });
    var hybrids = shortcuts.reduce(function (a, b) { return a + (isActionMode(col, b, mode, 'menu+shortcut') ? 1 : 0); }, 0);
    shortcuts.forEach(addIcon);
    var moreEntries = toolbar.length - shortcuts.length + hybrids;
    if (shortcuts.length === toolbar.length || (moreEntries === hybrids && !willAutoHide)) {
        // all visible or just hybrids that will always be visible
        return;
    }
    // need a more entry
    node.insertAdjacentHTML('beforeend', "<i data-a=\"m\" data-m=\"".concat(moreEntries, "\" title=\"More \u2026\" class=\"").concat(actionCSSClass('More'), "\">").concat(aria('More …'), "</i>"));
    var i = node.lastElementChild;
    i.onclick = function (evt) {
        evt.stopPropagation();
        ctx.dialogManager.setHighlightColumn(col);
        var dialog = new MoreColumnOptionsDialog(col, dialogContext(ctx, level, evt), mode, ctx);
        dialog.open();
    };
}
/** @internal */
function toggleRotatedHeader(node, col, defaultVisibleClientWidth) {
    // rotate header flag if needed
    var label = node.getElementsByClassName(cssClass('label'))[0];
    if (col.getWidth() < MIN_LABEL_WIDTH) {
        label.classList.remove(".".concat(cssClass('rotated')));
        return;
    }
    var width = label.clientWidth;
    var rotated = width <= 0
        ? ((col.label.length * defaultVisibleClientWidth) / 3) * 0.6 > col.getWidth()
        : label.scrollWidth * 0.6 > label.clientWidth;
    label.classList.toggle(".".concat(cssClass('rotated')), rotated);
}
/** @internal */
function toggleToolbarIcons(node, col, defaultVisibleClientWidth) {
    if (defaultVisibleClientWidth === void 0) { defaultVisibleClientWidth = 22.5; }
    toggleRotatedHeader(node, col, defaultVisibleClientWidth);
    var toolbar = node.getElementsByClassName(cssClass('toolbar'))[0];
    if (toolbar.childElementCount === 0) {
        return;
    }
    var availableWidth = col.getWidth();
    var actions = Array.from(toolbar.children).map(function (d) { return ({
        node: d,
        width: d.clientWidth > 0 ? d.clientWidth : defaultVisibleClientWidth,
    }); });
    var shortCuts = actions.filter(function (d) { return d.node.dataset.a === 'o'; });
    var hybrids = actions.filter(function (d) { return d.node.dataset.a === 's'; });
    var moreIcon = actions.find(function (d) { return d.node.dataset.a === 'm'; });
    var moreEntries = moreIcon ? Number.parseInt(moreIcon.node.dataset.m, 10) : 0;
    var needMore = moreEntries > hybrids.length;
    var total = actions.reduce(function (a, b) { return a + b.width; }, 0);
    for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
        var action = actions_1[_i];
        // maybe hide not needed "more"
        action.node.classList.remove(cssClass('hidden'));
    }
    // all visible
    if (total < availableWidth) {
        return;
    }
    if (moreIcon && !needMore && total - moreIcon.width < availableWidth) {
        // available space is enough we can skip the "more" and then it fits
        moreIcon.node.classList.add(cssClass('hidden'));
        return;
    }
    for (var _a = 0, _b = hybrids.reverse().concat(shortCuts.reverse()); _a < _b.length; _a++) {
        var action = _b[_a];
        // back to forth and hybrids earlier than pure shortcuts
        // hide and check if enough
        action.node.classList.add(cssClass('hidden'));
        total -= action.width;
        if (total < availableWidth) {
            return;
        }
    }
}
/**
 * allow to change the width of a column using dragging the handle
 * @internal
 */
export function dragWidth(col, node) {
    var ueberElement;
    var sizeHelper;
    var currentFooterTransformation = '';
    var handle = node.getElementsByClassName(cssClass('handle'))[0];
    var start = 0;
    var originalWidth = 0;
    var mouseMove = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var end = evt.clientX;
        var delta = end - start;
        if (Math.abs(start - end) < 2) {
            //ignore
            return;
        }
        start = end;
        var width = Math.max(0, col.getWidth() + delta);
        sizeHelper.classList.toggle(cssClass('resize-animated'), width < originalWidth);
        // no idea why shifted by the size compared to the other footer element
        sizeHelper.style.transform = "".concat(currentFooterTransformation, " translate(").concat(width - originalWidth - RESIZE_SPACE, "px, 0px)");
        node.style.width = "".concat(width, "px");
        col.setWidth(width);
        toggleToolbarIcons(node, col);
    };
    var mouseUp = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var end = evt.clientX;
        node.classList.remove(cssClass('change-width'));
        ueberElement.removeEventListener('mousemove', mouseMove);
        ueberElement.removeEventListener('mouseup', mouseUp);
        ueberElement.removeEventListener('mouseleave', mouseUp);
        ueberElement.classList.remove(cssClass('resizing'));
        node.style.width = null;
        setTimeout(function () {
            sizeHelper.classList.remove(cssClass('resizing'), cssClass('resize-animated'));
        }, RESIZE_ANIMATION_DURATION * 1.2); // after animation ended
        if (Math.abs(start - end) < 2) {
            //ignore
            return;
        }
        var delta = end - start;
        var width = Math.max(0, col.getWidth() + delta);
        col.setWidth(width);
        toggleToolbarIcons(node, col);
    };
    handle.onmousedown = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        node.classList.add(cssClass('change-width'));
        originalWidth = col.getWidth();
        start = evt.clientX;
        ueberElement = node.closest('body') || node.closest(".".concat(cssClass())); // take the whole body or root lineup
        ueberElement.addEventListener('mousemove', mouseMove);
        ueberElement.addEventListener('mouseup', mouseUp);
        ueberElement.addEventListener('mouseleave', mouseUp);
        ueberElement.classList.add(cssClass('resizing'));
        sizeHelper = node
            .closest(".".concat(engineCssClass()))
            .querySelector(".".concat(cssClass('resize-helper')));
        currentFooterTransformation = sizeHelper.previousElementSibling.style.transform;
        sizeHelper.style.transform = "".concat(currentFooterTransformation, " translate(").concat(-RESIZE_SPACE, "px, 0px)");
        sizeHelper.classList.add(cssClass('resizing'));
    };
    handle.onclick = function (evt) {
        // avoid resorting
        evt.stopPropagation();
        evt.preventDefault();
    };
}
/** @internal */
export var MIMETYPE_PREFIX = 'text/x-caleydo-lineup-column';
/**
 * allow to drag the column away
 * @internal
 */
export function dragAbleColumn(node, column, ctx) {
    dragAble(node, function () {
        var _a;
        var header = node.closest(".".concat(engineCssClass('header')));
        if (header) {
            header.classList.add(cssClass('dragging-column'));
        }
        var ref = JSON.stringify(ctx.provider.toDescRef(column.desc));
        var data = (_a = {
                'text/plain': column.label
            },
            _a["".concat(MIMETYPE_PREFIX, "-ref")] = column.id,
            _a[MIMETYPE_PREFIX] = ref,
            _a);
        if (isNumberColumn(column)) {
            data["".concat(MIMETYPE_PREFIX, "-number")] = ref;
            data["".concat(MIMETYPE_PREFIX, "-number-ref")] = column.id;
        }
        if (isCategoricalColumn(column)) {
            data["".concat(MIMETYPE_PREFIX, "-categorical")] = ref;
            data["".concat(MIMETYPE_PREFIX, "-categorical-ref")] = column.id;
        }
        if (isBoxPlotColumn(column)) {
            data["".concat(MIMETYPE_PREFIX, "-boxplot")] = ref;
            data["".concat(MIMETYPE_PREFIX, "-boxplot-ref")] = column.id;
        }
        if (isMapColumn(column)) {
            data["".concat(MIMETYPE_PREFIX, "-map")] = ref;
            data["".concat(MIMETYPE_PREFIX, "-map-ref")] = column.id;
        }
        if (isArrayColumn(column)) {
            data["".concat(MIMETYPE_PREFIX, "-array")] = ref;
            data["".concat(MIMETYPE_PREFIX, "-array-ref")] = column.id;
        }
        if (isNumbersColumn(column)) {
            data["".concat(MIMETYPE_PREFIX, "-numbers")] = ref;
            data["".concat(MIMETYPE_PREFIX, "-numbers-ref")] = column.id;
        }
        return {
            effectAllowed: 'copyMove',
            data: data,
        };
    }, function () {
        var header = node.closest(".".concat(engineCssClass('header')));
        if (header) {
            header.classList.remove(cssClass('dragging-column'));
        }
    }, true);
}
/**
 * dropper for allowing to rearrange (move, copy) columns
 * @internal
 */
export function rearrangeDropAble(node, column, ctx) {
    dropAble(node, ["".concat(MIMETYPE_PREFIX, "-ref"), MIMETYPE_PREFIX], function (result) {
        var col = null;
        var data = result.data;
        if (!("".concat(MIMETYPE_PREFIX, "-ref") in data)) {
            var desc = JSON.parse(data[MIMETYPE_PREFIX]);
            col = ctx.provider.create(ctx.provider.fromDescRef(desc));
            return col != null && column.insertAfterMe(col) != null;
        }
        // find by reference
        var id = data["".concat(MIMETYPE_PREFIX, "-ref")];
        col = ctx.provider.find(id);
        if (!col || (col === column && !result.effect.startsWith('copy'))) {
            return false;
        }
        if (result.effect.startsWith('copy')) {
            col = ctx.provider.clone(col);
            return col != null && column.insertAfterMe(col) != null;
        }
        // detect whether it is an internal move operation or an real remove/insert operation
        var toInsertParent = col.parent;
        if (!toInsertParent) {
            // no parent will always be a move
            return column.insertAfterMe(col) != null;
        }
        if (toInsertParent === column.parent) {
            // move operation
            return toInsertParent.moveAfter(col, column) != null;
        }
        col.removeMe();
        return column.insertAfterMe(col) != null;
    }, null, true);
}
/**
 * dropper for merging columns
 * @internal
 */
export function mergeDropAble(node, column, ctx) {
    var resolveDrop = function (result) {
        var data = result.data;
        var copy = result.effect === 'copy';
        var prefix = MIMETYPE_PREFIX;
        var key = Object.keys(data).find(function (d) { return d.startsWith(prefix) && d.endsWith('-ref'); });
        if (key) {
            var id = data[key];
            var col = ctx.provider.find(id);
            if (copy) {
                col = ctx.provider.clone(col);
            }
            else if (col === column) {
                return null;
            }
            else {
                col.removeMe();
            }
            return col;
        }
        var alternative = Object.keys(data).find(function (d) { return d.startsWith(prefix); });
        if (!alternative) {
            return null;
        }
        var desc = JSON.parse(alternative);
        return ctx.provider.create(ctx.provider.fromDescRef(desc));
    };
    var pushChild = function (result) {
        var col = resolveDrop(result);
        return col != null && column.push(col) != null;
    };
    var mergeImpl = function (col, desc) {
        if (col == null) {
            return false;
        }
        var ranking = column.findMyRanker();
        var index = ranking.indexOf(column);
        var parent = ctx.provider.create(desc);
        column.removeMe();
        parent.push(column);
        parent.push(col);
        return ranking.insert(parent, index) != null;
    };
    var mergeWith = function (desc) { return function (result) {
        var col = resolveDrop(result);
        return mergeImpl(col, desc);
    }; };
    var all = ["".concat(MIMETYPE_PREFIX, "-ref"), MIMETYPE_PREFIX];
    var numberlike = ["".concat(MIMETYPE_PREFIX, "-number-ref"), "".concat(MIMETYPE_PREFIX, "-number")];
    var categorical = ["".concat(MIMETYPE_PREFIX, "-categorical-ref"), "".concat(MIMETYPE_PREFIX, "-categorical")];
    if (isMultiLevelColumn(column) || column instanceof CompositeColumn) {
        // stack column or nested
        node.dataset.draginfo = '+';
        return dropAble(node, column.canJustAddNumbers ? numberlike : all, pushChild);
    }
    if (isNumbersColumn(column)) {
        node.dataset.draginfo = 'Color by';
        return dropAble(node, categorical, mergeWith(createImpositionsDesc()));
    }
    if (isBoxPlotColumn(column)) {
        node.dataset.draginfo = 'Color by';
        return dropAble(node, categorical, mergeWith(createImpositionBoxPlotDesc()));
    }
    if (isNumberColumn(column)) {
        node.dataset.draginfo = 'Merge';
        return dropAble(node, categorical.concat(numberlike), function (result) {
            var col = resolveDrop(result);
            if (col == null) {
                return false;
            }
            if (isCategoricalColumn(col)) {
                return mergeImpl(col, createImpositionDesc());
            }
            if (isNumberColumn(col)) {
                return mergeImpl(col, createStackDesc());
            }
            return false;
        }, function (e) {
            if (hasDnDType.apply(void 0, __spreadArray([e], categorical, false))) {
                node.dataset.draginfo = 'Color by';
                return;
            }
            if (hasDnDType.apply(void 0, __spreadArray([e], numberlike, false))) {
                node.dataset.draginfo = 'Sum';
            }
        });
    }
}
//# sourceMappingURL=header.js.map