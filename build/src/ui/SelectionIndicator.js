import { isGroup } from '../model';
import { cssClass, SELECTED_COLOR } from '../styles';
import { everyIndices } from '../model/internal';
function isGroupSelected(group, selection) {
    var selected = 0;
    var unselected = 0;
    var total = group.order.length;
    everyIndices(group.order, function (i) {
        var s = selection.has(i);
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
var INDICATOR_WIDTH = 4;
var SelectionIndicator = /** @class */ (function () {
    function SelectionIndicator(scrollerNode) {
        var _this = this;
        this.scrollerNode = scrollerNode;
        this.blocks = [];
        var node = scrollerNode.ownerDocument.createElement('div');
        this.node = node;
        node.classList.add(cssClass('selection-indicator'));
        var canvas = scrollerNode.ownerDocument.createElement('canvas');
        node.appendChild(canvas);
        this.canvas = canvas;
        this.canvas.width = INDICATOR_WIDTH;
        this.canvas.addEventListener('click', function (e) {
            _this.onClick(e.clientY - _this.canvas.getBoundingClientRect().top);
        });
    }
    SelectionIndicator.prototype.toSelectionBlocks = function (data, rowContext, selection, height) {
        if (!data || !rowContext || !selection || selection.size === 0 || !height) {
            return [];
        }
        if (height > rowContext.totalHeight) {
            // all rows visible
            return [];
        }
        var posOf = function (index) {
            if (rowContext.exceptions.length === 0 || index < rowContext.exceptions[0].index) {
                // fast pass
                return index * rowContext.defaultRowHeight;
            }
            var before = rowContext.exceptions
                .slice()
                .reverse()
                .find(function (d) { return d.index <= index; });
            if (!before) {
                return -1;
            }
            if (before.index === index) {
                return before.y;
            }
            var regular = index - before.index - 1;
            return before.y2 + regular * rowContext.defaultRowHeight;
        };
        var blocks = [];
        var currentBlock = null;
        var currentBlockLastIndex = -1;
        data.forEach(function (row, i) {
            var _a, _b;
            var isSelected = isGroup(row) ? isGroupSelected(row, selection) : selection.has(row.dataIndex);
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
        var scaleFactor = height / rowContext.totalHeight;
        for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
            var block = blocks_1[_i];
            block.y = block.rawY * scaleFactor;
            block.height = Math.max(1, block.height * scaleFactor);
        }
        return blocks;
    };
    SelectionIndicator.prototype.updateData = function (data, rowContext) {
        this.data = data;
        this.rowContext = rowContext;
        this.render();
    };
    SelectionIndicator.prototype.updateSelection = function (selection) {
        this.selection = selection;
        this.render();
    };
    SelectionIndicator.prototype.onClick = function (y) {
        if (!this.blocks || this.blocks.length === 0 || !this.rowContext) {
            return;
        }
        var block = this.blocks.find(function (d) { return y >= d.y && y <= d.y + d.height; });
        if (!block) {
            return;
        }
        var targetY = block.rawY - this.rowContext.defaultRowHeight;
        this.scrollerNode.scrollTo({
            behavior: 'auto',
            top: Math.max(targetY, 0),
        });
    };
    SelectionIndicator.prototype.render = function () {
        var height = this.scrollerNode.offsetHeight;
        this.canvas.height = height;
        if (!this.selection || !this.data || !this.rowContext) {
            return;
        }
        this.blocks = this.toSelectionBlocks(this.data, this.rowContext, this.selection, height);
        this.node.classList.toggle(cssClass('some-selection'), this.blocks.length > 0);
        if (this.blocks.length === 0) {
            return;
        }
        var ctx = this.canvas.getContext('2d');
        ctx.resetTransform();
        ctx.clearRect(0, 0, INDICATOR_WIDTH, height);
        ctx.fillStyle = SELECTED_COLOR;
        for (var _i = 0, _a = this.blocks; _i < _a.length; _i++) {
            var block = _a[_i];
            ctx.fillRect(0, block.y, INDICATOR_WIDTH, block.height);
        }
    };
    return SelectionIndicator;
}());
export default SelectionIndicator;
//# sourceMappingURL=SelectionIndicator.js.map