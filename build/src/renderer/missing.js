import { Column, isMissingValue } from '../model';
import { CANVAS_HEIGHT, DASH, cssClass } from '../styles';
export function renderMissingValue(ctx, width, height, x, y) {
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    var dashX = Math.max(0, x + (width - DASH.width) / 2); // center horizontally
    var dashY = Math.max(0, y + (height - DASH.height) / 2); // center vertically
    ctx.fillStyle = DASH.color;
    ctx.fillRect(dashX, dashY, Math.min(width, DASH.width), Math.min(height, DASH.height));
}
export function renderMissingDOM(node, col, d) {
    var missing = isMissingValue(col.getValue(d));
    node.classList.toggle(cssClass('missing'), missing);
    return missing;
}
export function renderMissingCanvas(ctx, col, d, width, x, y) {
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    var missing = isMissingValue(col.getValue(d));
    if (missing) {
        renderMissingValue(ctx, width, CANVAS_HEIGHT, x, y);
    }
    return missing;
}
//# sourceMappingURL=missing.js.map