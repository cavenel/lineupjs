import { round } from '../internal';
import { Column, isNumberColumn, isMultiLevelColumn, } from '../model';
import { medianIndex } from '../model/internalNumber';
import { COLUMN_PADDING } from '../styles';
import { AAggregatedGroupRenderer } from './AAggregatedGroupRenderer';
import { ERenderMode, } from './interfaces';
import { renderMissingCanvas, renderMissingDOM } from './missing';
import { matchColumns, multiLevelGridCSSClass } from './utils';
import { cssClass } from '../styles';
import { abortAbleAll } from 'lineupengine';
/**
 * @internal
 * @param parent Parent column
 * @param context Render context
 * @param stacked Are the columns stacked?
 * @param mode Render mode
 * @param imposer Imposer object
 */
export function createData(parent, context, stacked, mode, imposer) {
    const padding = COLUMN_PADDING;
    let offset = 0;
    const cols = parent.children.map((column) => {
        const shift = offset;
        const width = column.getWidth();
        offset += width;
        offset += !stacked ? padding : 0;
        const renderer = mode === ERenderMode.CELL ? context.renderer(column, imposer) : null;
        const groupRenderer = mode === ERenderMode.GROUP ? context.groupRenderer(column, imposer) : null;
        const summaryRenderer = mode === ERenderMode.GROUP ? context.summaryRenderer(column, false, imposer) : null;
        let template = '';
        let rendererId = '';
        switch (mode) {
            case ERenderMode.CELL:
                template = renderer.template;
                rendererId = column.getRenderer();
                break;
            case ERenderMode.GROUP:
                template = groupRenderer.template;
                rendererId = column.getGroupRenderer();
                break;
            case ERenderMode.SUMMARY:
                template = summaryRenderer.template;
                rendererId = column.getSummaryRenderer();
                break;
        }
        // inject data attributes
        template = template.replace(/^<([^ >]+)([ >])/, `<$1 data-column-id="${column.id}" data-renderer="${rendererId}"$2`);
        // inject classes
        if (/^<([^>]+) class="([ >]*)/.test(template)) {
            // has class attribute
            template = template.replace(/^<([^>]+) class="([ >]*)/, `<$1 class="${cssClass(`renderer-${rendererId}`)} $2`);
        }
        else {
            // inject as the others
            template = template.replace(/^<([^ >]+)([ >])/, `<$1 class="${cssClass(`renderer-${rendererId}`)}"$2`);
        }
        return {
            column,
            shift,
            width,
            template,
            rendererId,
            renderer,
            groupRenderer,
            summaryRenderer,
        };
    });
    return { cols, stacked, padding };
}
export default class MultiLevelCellRenderer extends AAggregatedGroupRenderer {
    constructor(stacked = true) {
        super();
        this.stacked = stacked;
        this.title = this.stacked ? 'Stacked Bar' : 'Nested';
    }
    canRender(col) {
        return isMultiLevelColumn(col);
    }
    create(col, context, imposer) {
        const { cols, stacked } = createData(col, context, this.stacked, ERenderMode.CELL, imposer);
        const width = context.colWidth(col);
        return {
            template: `<div class='${multiLevelGridCSSClass(context.idPrefix, col)} ${!stacked ? cssClass('grid-space') : ''}'>${cols.map((d) => d.template).join('')}</div>`,
            update: (n, d, i, group) => {
                if (renderMissingDOM(n, col, d)) {
                    return null;
                }
                matchColumns(n, cols, context);
                const toWait = [];
                const children = Array.from(n.children);
                const total = col.getWidth();
                let missingWeight = 0;
                cols.forEach((col, ci) => {
                    const weight = col.column.getWidth() / total;
                    const cNode = children[ci];
                    cNode.classList.add(cssClass(this.stacked ? 'stack-sub' : 'nested-sub'), cssClass('detail'));
                    cNode.dataset.group = 'd';
                    cNode.style.transform = stacked ? `translate(-${round((missingWeight / weight) * 100, 4)}%,0)` : null;
                    cNode.style.gridColumnStart = (ci + 1).toString();
                    const r = col.renderer.update(cNode, d, i, group);
                    if (stacked) {
                        missingWeight += (1 - col.column.getNumber(d)) * weight;
                        if (ci < cols.length - 1) {
                            const span = cNode.querySelector('span');
                            if (span) {
                                span.style.overflow = 'hidden';
                            }
                        }
                    }
                    if (r) {
                        toWait.push(r);
                    }
                });
                if (toWait.length > 0) {
                    return abortAbleAll(toWait);
                }
                return null;
            },
            render: (ctx, d, i, group) => {
                if (renderMissingCanvas(ctx, col, d, width)) {
                    return null;
                }
                const toWait = [];
                let stackShift = 0;
                for (const col of cols) {
                    const cr = col.renderer;
                    if (cr.render) {
                        const shift = col.shift - stackShift;
                        ctx.translate(shift, 0);
                        const r = cr.render(ctx, d, i, group);
                        if (typeof r !== 'boolean' && r) {
                            toWait.push({ shift, r });
                        }
                        ctx.translate(-shift, 0);
                    }
                    if (stacked) {
                        stackShift += col.width * (1 - col.column.getNumber(d));
                    }
                }
                if (toWait.length === 0) {
                    return null;
                }
                return abortAbleAll(toWait.map((d) => d.r)).then((callbacks) => {
                    return (ctx) => {
                        if (typeof callbacks === 'symbol') {
                            return;
                        }
                        for (let i = 0; i < callbacks.length; ++i) {
                            const callback = callbacks[i];
                            if (typeof callback !== 'function') {
                                continue;
                            }
                            const shift = toWait[i].shift;
                            ctx.translate(shift, 0);
                            callback(ctx);
                            ctx.translate(-shift, 0);
                        }
                    };
                });
            },
        };
    }
    createGroup(col, context, imposer) {
        if (this.stacked && isNumberColumn(col)) {
            return super.createGroup(col, context, imposer);
        }
        const { cols } = createData(col, context, false, ERenderMode.GROUP, imposer);
        return {
            template: `<div class='${multiLevelGridCSSClass(context.idPrefix, col)} ${cssClass('grid-space')}'>${cols
                .map((d) => d.template)
                .join('')}</div>`,
            update: (n, group) => {
                matchColumns(n, cols, context);
                const toWait = [];
                const children = Array.from(n.children);
                cols.forEach((col, ci) => {
                    const childNode = children[ci];
                    childNode.classList.add(cssClass(this.stacked ? 'stack-sub' : 'nested-sub'), cssClass('group'));
                    childNode.dataset.group = 'g';
                    childNode.style.gridColumnStart = (ci + 1).toString();
                    const r = col.groupRenderer.update(childNode, group);
                    if (r) {
                        toWait.push(r);
                    }
                });
                if (toWait.length > 0) {
                    return abortAbleAll(toWait);
                }
                return null;
            },
        };
    }
    aggregatedIndex(rows, col) {
        console.assert(isNumberColumn(col));
        return medianIndex(rows, col);
    }
}
