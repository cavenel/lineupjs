import { isGroup } from '../model';
import { cssClass, SELECTED_COLOR } from '../styles';
import { everyIndices } from '../model/internal';
function isGroupSelected(group, selection) {
    let selected = 0;
    let unselected = 0;
    const total = group.order.length;
    everyIndices(group.order, (i) => {
        const s = selection.has(i);
        if (s) {
            selected++;
        }
        else {
            unselected++;
        }
        if (selected * 2 > total || unselected * 2 > total) {
            // more than half already, can abort already decided
            return false;
        }
        return true;
    });
    // more than 50%
    return selected * 2 > total;
}
const INDICATOR_WIDTH = 4;
export default class SelectionIndicator {
    constructor(scrollerNode) {
        this.scrollerNode = scrollerNode;
        this.blocks = [];
        const node = scrollerNode.ownerDocument.createElement('div');
        this.node = node;
        node.classList.add(cssClass('selection-indicator'));
        const canvas = scrollerNode.ownerDocument.createElement('canvas');
        node.appendChild(canvas);
        this.canvas = canvas;
        this.canvas.width = INDICATOR_WIDTH;
        this.canvas.addEventListener('click', (e) => {
            this.onClick(e.clientY - this.canvas.getBoundingClientRect().top);
        });
    }
    toSelectionBlocks(data, rowContext, selection, height) {
        if (!data || !rowContext || !selection || selection.size === 0 || !height) {
            return [];
        }
        if (height > rowContext.totalHeight) {
            // all rows visible
            return [];
        }
        const posOf = (index) => {
            if (rowContext.exceptions.length === 0 || index < rowContext.exceptions[0].index) {
                // fast pass
                return index * rowContext.defaultRowHeight;
            }
            const before = rowContext.exceptions
                .slice()
                .reverse()
                .find((d) => d.index <= index);
            if (!before) {
                return -1;
            }
            if (before.index === index) {
                return before.y;
            }
            const regular = index - before.index - 1;
            return before.y2 + regular * rowContext.defaultRowHeight;
        };
        const blocks = [];
        let currentBlock = null;
        let currentBlockLastIndex = -1;
        data.forEach((row, i) => {
            var _a, _b;
            const isSelected = isGroup(row) ? isGroupSelected(row, selection) : selection.has(row.dataIndex);
            if (!isSelected) {
                return;
            }
            if (currentBlock && currentBlockLastIndex + 1 === i) {
                // concat the selection block
                currentBlock.height += (_a = rowContext.exceptionsLookup.get(i)) !== null && _a !== void 0 ? _a : rowContext.defaultRowHeight;
                currentBlockLastIndex = i;
                return;
            }
            // create a new block
            currentBlock = {
                firstRow: row,
                height: (_b = rowContext.exceptionsLookup.get(i)) !== null && _b !== void 0 ? _b : rowContext.defaultRowHeight,
                y: 0,
                rawY: posOf(i),
            };
            blocks.push(currentBlock);
            currentBlockLastIndex = i;
        });
        // scale blocks
        const scaleFactor = height / rowContext.totalHeight;
        for (const block of blocks) {
            block.y = block.rawY * scaleFactor;
            block.height = Math.max(1, block.height * scaleFactor);
        }
        return blocks;
    }
    updateData(data, rowContext) {
        this.data = data;
        this.rowContext = rowContext;
        this.render();
    }
    updateSelection(selection) {
        this.selection = selection;
        this.render();
    }
    onClick(y) {
        if (!this.blocks || this.blocks.length === 0 || !this.rowContext) {
            return;
        }
        const block = this.blocks.find((d) => y >= d.y && y <= d.y + d.height);
        if (!block) {
            return;
        }
        const targetY = block.rawY - this.rowContext.defaultRowHeight;
        this.scrollerNode.scrollTo({
            behavior: 'auto',
            top: Math.max(targetY, 0),
        });
    }
    render() {
        const height = this.scrollerNode.offsetHeight;
        this.canvas.height = height;
        if (!this.selection || !this.data || !this.rowContext) {
            return;
        }
        this.blocks = this.toSelectionBlocks(this.data, this.rowContext, this.selection, height);
        this.node.classList.toggle(cssClass('some-selection'), this.blocks.length > 0);
        if (this.blocks.length === 0) {
            return;
        }
        const ctx = this.canvas.getContext('2d');
        ctx.resetTransform();
        ctx.clearRect(0, 0, INDICATOR_WIDTH, height);
        ctx.fillStyle = SELECTED_COLOR;
        for (const block of this.blocks) {
            ctx.fillRect(0, block.y, INDICATOR_WIDTH, block.height);
        }
    }
}
