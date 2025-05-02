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
function setTextOrEmpty(node, condition, text, asHTML = false) {
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
export function createHeader(col, ctx, options = {}) {
    var _a;
    options = Object.assign({
        dragAble: true,
        mergeDropAble: true,
        rearrangeAble: true,
        resizeable: true,
        level: 0,
        extraPrefix: '',
    }, options);
    const node = ctx.document.createElement('section');
    const extra = options.extraPrefix
        ? (name) => `${cssClass(name)} ${cssClass(`${options.extraPrefix}-${name}`)}`
        : cssClass;
    node.innerHTML = `
    <div class="${extra('label')} ${cssClass('typed-icon')}"></div>
    <div class="${extra('sublabel')}"></div>
    <div class="${extra('toolbar')}"></div>
    <div class="${extra('spacing')}"></div>
    <div class="${extra('handle')} ${cssClass('feature-advanced')} ${cssClass('feature-ui')}"></div>
    ${options.mergeDropAble ? `<div class="${extra('header-drop')} ${extra('merger')}"></div>` : ''}
    ${options.rearrangeAble
        ? `<div class="${extra('header-drop')} ${extra('placer')}" data-draginfo="Place here"></div>`
        : ''}
  `;
    const label = col.getHeaderLabel('header');
    setTextOrEmpty(node.firstElementChild, col.getWidth() < MIN_LABEL_WIDTH, label.content, label.asHTML);
    const summary = col.getSummaryLabel('header');
    setTextOrEmpty(node.children[1], col.getWidth() < MIN_LABEL_WIDTH || !summary, summary.content, summary.asHTML);
    // addTooltip(node, col);
    createShortcutMenuItems(node.getElementsByClassName(cssClass('toolbar'))[0], options.level, col, ctx, 'header');
    toggleToolbarIcons(node, col);
    if (options.dragAble) {
        dragAbleColumn(node, col, ctx);
    }
    if (options.mergeDropAble) {
        const merger = node.getElementsByClassName(cssClass('merger'))[0];
        if (!options.rearrangeAble) {
            merger.style.left = '0';
            merger.style.width = '100%';
        }
        mergeDropAble(merger, col, ctx);
    }
    if (options.rearrangeAble) {
        const placer = node.getElementsByClassName(cssClass('placer'))[0];
        const nextSibling = col.nextSibling();
        const widthFactor = !options.mergeDropAble ? 0.5 : 0.2;
        if (!options.mergeDropAble) {
            placer.style.left = '50%';
        }
        placer.style.width = `${col.getWidth() * widthFactor + ((_a = nextSibling === null || nextSibling === void 0 ? void 0 : nextSibling.getWidth()) !== null && _a !== void 0 ? _a : 100) / 2}px`;
        rearrangeDropAble(placer, col, ctx);
    }
    if (options.resizeable) {
        dragWidth(col, node);
    }
    return node;
}
/** @internal */
export function updateHeader(node, col, labelCtx = 'header', minWidth = MIN_LABEL_WIDTH) {
    var _a;
    const label = node.getElementsByClassName(cssClass('label'))[0];
    const labelText = col.getHeaderLabel(labelCtx);
    setTextOrEmpty(label, col.getWidth() < minWidth, labelText.content, labelText.asHTML);
    const summaryText = col.getSummaryLabel(labelCtx);
    const summary = col.desc.summary;
    const subLabel = node.getElementsByClassName(cssClass('sublabel'))[0];
    if (subLabel) {
        setTextOrEmpty(subLabel, col.getWidth() < minWidth || !summaryText.content, summaryText.content, summaryText.asHTML);
    }
    let title = col.label;
    if (summary) {
        title = `${title}\n${summary}`;
    }
    if (col.description) {
        title = `${title}\n${col.description}`;
    }
    node.title = title;
    node.dataset.colId = col.id;
    node.dataset.type = col.desc.type;
    label.dataset.typeCat = categoryOf(col).name;
    updateIconState(node, col);
    updateMoreDialogIcons(node, col);
    // update width for width of next sibling
    const placer = node.getElementsByClassName(cssClass('placer'))[0];
    if (placer) {
        const nextSibling = col.nextSibling();
        const widthFactor = node.getElementsByClassName(cssClass('merger')).length === 0 ? 0.5 : 0.2;
        placer.style.width = `${col.getWidth() * widthFactor + ((_a = nextSibling === null || nextSibling === void 0 ? void 0 : nextSibling.getWidth()) !== null && _a !== void 0 ? _a : 100) * widthFactor + 5}px`;
    }
}
function updateMoreDialogIcons(node, col) {
    const root = node.closest(`.${cssClass()}`);
    if (!root) {
        return;
    }
    const dialog = root.querySelector(`.${cssClass('more-options')}[data-col-id="${col.id}"]`);
    if (!dialog) {
        return;
    }
    updateIconState(dialog, col);
}
/** @internal */
export function createShortcutMenuItems(node, level, col, ctx, mode, willAutoHide = true) {
    const addIcon = addIconDOM(node, col, ctx, level, false, mode);
    const toolbar = getToolbar(col, ctx);
    const shortcuts = toolbar.filter((d) => !isActionMode(col, d, mode, 'menu'));
    const hybrids = shortcuts.reduce((a, b) => a + (isActionMode(col, b, mode, 'menu+shortcut') ? 1 : 0), 0);
    shortcuts.forEach(addIcon);
    const moreEntries = toolbar.length - shortcuts.length + hybrids;
    if (shortcuts.length === toolbar.length || (moreEntries === hybrids && !willAutoHide)) {
        // all visible or just hybrids that will always be visible
        return;
    }
    // need a more entry
    node.insertAdjacentHTML('beforeend', `<i data-a="m" data-m="${moreEntries}" title="More …" class="${actionCSSClass('More')}">${aria('More …')}</i>`);
    const i = node.lastElementChild;
    i.onclick = (evt) => {
        evt.stopPropagation();
        ctx.dialogManager.setHighlightColumn(col);
        const dialog = new MoreColumnOptionsDialog(col, dialogContext(ctx, level, evt), mode, ctx);
        dialog.open();
    };
}
/** @internal */
function toggleRotatedHeader(node, col, defaultVisibleClientWidth) {
    // rotate header flag if needed
    const label = node.getElementsByClassName(cssClass('label'))[0];
    if (col.getWidth() < MIN_LABEL_WIDTH) {
        label.classList.remove(`.${cssClass('rotated')}`);
        return;
    }
    const width = label.clientWidth;
    const rotated = width <= 0
        ? ((col.label.length * defaultVisibleClientWidth) / 3) * 0.6 > col.getWidth()
        : label.scrollWidth * 0.6 > label.clientWidth;
    label.classList.toggle(`.${cssClass('rotated')}`, rotated);
}
/** @internal */
function toggleToolbarIcons(node, col, defaultVisibleClientWidth = 22.5) {
    toggleRotatedHeader(node, col, defaultVisibleClientWidth);
    const toolbar = node.getElementsByClassName(cssClass('toolbar'))[0];
    if (toolbar.childElementCount === 0) {
        return;
    }
    const availableWidth = col.getWidth();
    const actions = Array.from(toolbar.children).map((d) => ({
        node: d,
        width: d.clientWidth > 0 ? d.clientWidth : defaultVisibleClientWidth,
    }));
    const shortCuts = actions.filter((d) => d.node.dataset.a === 'o');
    const hybrids = actions.filter((d) => d.node.dataset.a === 's');
    const moreIcon = actions.find((d) => d.node.dataset.a === 'm');
    const moreEntries = moreIcon ? Number.parseInt(moreIcon.node.dataset.m, 10) : 0;
    const needMore = moreEntries > hybrids.length;
    let total = actions.reduce((a, b) => a + b.width, 0);
    for (const action of actions) {
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
    for (const action of hybrids.reverse().concat(shortCuts.reverse())) {
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
    let ueberElement;
    let sizeHelper;
    let currentFooterTransformation = '';
    const handle = node.getElementsByClassName(cssClass('handle'))[0];
    let start = 0;
    let originalWidth = 0;
    const mouseMove = (evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        const end = evt.clientX;
        const delta = end - start;
        if (Math.abs(start - end) < 2) {
            //ignore
            return;
        }
        start = end;
        const width = Math.max(0, col.getWidth() + delta);
        sizeHelper.classList.toggle(cssClass('resize-animated'), width < originalWidth);
        // no idea why shifted by the size compared to the other footer element
        sizeHelper.style.transform = `${currentFooterTransformation} translate(${width - originalWidth - RESIZE_SPACE}px, 0px)`;
        node.style.width = `${width}px`;
        col.setWidth(width);
        toggleToolbarIcons(node, col);
    };
    const mouseUp = (evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        const end = evt.clientX;
        node.classList.remove(cssClass('change-width'));
        ueberElement.removeEventListener('mousemove', mouseMove);
        ueberElement.removeEventListener('mouseup', mouseUp);
        ueberElement.removeEventListener('mouseleave', mouseUp);
        ueberElement.classList.remove(cssClass('resizing'));
        node.style.width = null;
        setTimeout(() => {
            sizeHelper.classList.remove(cssClass('resizing'), cssClass('resize-animated'));
        }, RESIZE_ANIMATION_DURATION * 1.2); // after animation ended
        if (Math.abs(start - end) < 2) {
            //ignore
            return;
        }
        const delta = end - start;
        const width = Math.max(0, col.getWidth() + delta);
        col.setWidth(width);
        toggleToolbarIcons(node, col);
    };
    handle.onmousedown = (evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        node.classList.add(cssClass('change-width'));
        originalWidth = col.getWidth();
        start = evt.clientX;
        ueberElement = node.closest('body') || node.closest(`.${cssClass()}`); // take the whole body or root lineup
        ueberElement.addEventListener('mousemove', mouseMove);
        ueberElement.addEventListener('mouseup', mouseUp);
        ueberElement.addEventListener('mouseleave', mouseUp);
        ueberElement.classList.add(cssClass('resizing'));
        sizeHelper = node
            .closest(`.${engineCssClass()}`)
            .querySelector(`.${cssClass('resize-helper')}`);
        currentFooterTransformation = sizeHelper.previousElementSibling.style.transform;
        sizeHelper.style.transform = `${currentFooterTransformation} translate(${-RESIZE_SPACE}px, 0px)`;
        sizeHelper.classList.add(cssClass('resizing'));
    };
    handle.onclick = (evt) => {
        // avoid resorting
        evt.stopPropagation();
        evt.preventDefault();
    };
}
/** @internal */
export const MIMETYPE_PREFIX = 'text/x-caleydo-lineup-column';
/**
 * allow to drag the column away
 * @internal
 */
export function dragAbleColumn(node, column, ctx) {
    dragAble(node, () => {
        const header = node.closest(`.${engineCssClass('header')}`);
        if (header) {
            header.classList.add(cssClass('dragging-column'));
        }
        const ref = JSON.stringify(ctx.provider.toDescRef(column.desc));
        const data = {
            'text/plain': column.label,
            [`${MIMETYPE_PREFIX}-ref`]: column.id,
            [MIMETYPE_PREFIX]: ref,
        };
        if (isNumberColumn(column)) {
            data[`${MIMETYPE_PREFIX}-number`] = ref;
            data[`${MIMETYPE_PREFIX}-number-ref`] = column.id;
        }
        if (isCategoricalColumn(column)) {
            data[`${MIMETYPE_PREFIX}-categorical`] = ref;
            data[`${MIMETYPE_PREFIX}-categorical-ref`] = column.id;
        }
        if (isBoxPlotColumn(column)) {
            data[`${MIMETYPE_PREFIX}-boxplot`] = ref;
            data[`${MIMETYPE_PREFIX}-boxplot-ref`] = column.id;
        }
        if (isMapColumn(column)) {
            data[`${MIMETYPE_PREFIX}-map`] = ref;
            data[`${MIMETYPE_PREFIX}-map-ref`] = column.id;
        }
        if (isArrayColumn(column)) {
            data[`${MIMETYPE_PREFIX}-array`] = ref;
            data[`${MIMETYPE_PREFIX}-array-ref`] = column.id;
        }
        if (isNumbersColumn(column)) {
            data[`${MIMETYPE_PREFIX}-numbers`] = ref;
            data[`${MIMETYPE_PREFIX}-numbers-ref`] = column.id;
        }
        return {
            effectAllowed: 'copyMove',
            data,
        };
    }, () => {
        const header = node.closest(`.${engineCssClass('header')}`);
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
    dropAble(node, [`${MIMETYPE_PREFIX}-ref`, MIMETYPE_PREFIX], (result) => {
        let col = null;
        const data = result.data;
        if (!(`${MIMETYPE_PREFIX}-ref` in data)) {
            const desc = JSON.parse(data[MIMETYPE_PREFIX]);
            col = ctx.provider.create(ctx.provider.fromDescRef(desc));
            return col != null && column.insertAfterMe(col) != null;
        }
        // find by reference
        const id = data[`${MIMETYPE_PREFIX}-ref`];
        col = ctx.provider.find(id);
        if (!col || (col === column && !result.effect.startsWith('copy'))) {
            return false;
        }
        if (result.effect.startsWith('copy')) {
            col = ctx.provider.clone(col);
            return col != null && column.insertAfterMe(col) != null;
        }
        // detect whether it is an internal move operation or an real remove/insert operation
        const toInsertParent = col.parent;
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
    const resolveDrop = (result) => {
        const data = result.data;
        const copy = result.effect === 'copy';
        const prefix = MIMETYPE_PREFIX;
        const key = Object.keys(data).find((d) => d.startsWith(prefix) && d.endsWith('-ref'));
        if (key) {
            const id = data[key];
            let col = ctx.provider.find(id);
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
        const alternative = Object.keys(data).find((d) => d.startsWith(prefix));
        if (!alternative) {
            return null;
        }
        const desc = JSON.parse(alternative);
        return ctx.provider.create(ctx.provider.fromDescRef(desc));
    };
    const pushChild = (result) => {
        const col = resolveDrop(result);
        return col != null && column.push(col) != null;
    };
    const mergeImpl = (col, desc) => {
        if (col == null) {
            return false;
        }
        const ranking = column.findMyRanker();
        const index = ranking.indexOf(column);
        const parent = ctx.provider.create(desc);
        column.removeMe();
        parent.push(column);
        parent.push(col);
        return ranking.insert(parent, index) != null;
    };
    const mergeWith = (desc) => (result) => {
        const col = resolveDrop(result);
        return mergeImpl(col, desc);
    };
    const all = [`${MIMETYPE_PREFIX}-ref`, MIMETYPE_PREFIX];
    const numberlike = [`${MIMETYPE_PREFIX}-number-ref`, `${MIMETYPE_PREFIX}-number`];
    const categorical = [`${MIMETYPE_PREFIX}-categorical-ref`, `${MIMETYPE_PREFIX}-categorical`];
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
        return dropAble(node, categorical.concat(numberlike), (result) => {
            const col = resolveDrop(result);
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
        }, (e) => {
            if (hasDnDType(e, ...categorical)) {
                node.dataset.draginfo = 'Color by';
                return;
            }
            if (hasDnDType(e, ...numberlike)) {
                node.dataset.draginfo = 'Sum';
            }
        });
    }
}
