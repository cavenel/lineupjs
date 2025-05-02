import { Column, NumbersColumn, isNumbersColumn } from '../model';
import { CANVAS_HEIGHT, cssClass } from '../styles';
import { ANumbersCellRenderer } from './ANumbersCellRenderer';
import { toHeatMapColor } from './BrightnessCellRenderer';
import { ERenderMode, } from './interfaces';
import { forEachChild, noRenderer } from './utils';
export default class VerticalBarCellRenderer extends ANumbersCellRenderer {
    constructor() {
        super(...arguments);
        this.title = 'Bar Chart';
    }
    canRender(col, mode) {
        return isNumbersColumn(col) && Boolean(col.dataLength) && mode === ERenderMode.CELL;
    }
    static compute(v, threshold, domain) {
        if (v < threshold) {
            //threshold to down
            return { height: threshold - v, bottom: v - domain[0] };
        }
        //from top to down
        return { height: v - threshold, bottom: threshold - domain[0] };
    }
    createContext(col, context, imposer) {
        const cellDimension = context.colWidth(col) / col.dataLength;
        const threshold = col.getMapping().apply(NumbersColumn.CENTER);
        const range = 1;
        let templateRows = '';
        for (let i = 0; i < col.dataLength; ++i) {
            templateRows += `<div class="${cssClass('heatmap-cell')}" style="background-color: white" title=""></div>`;
        }
        const formatter = col.getNumberFormat();
        return {
            clazz: cssClass('heatmap'),
            templateRow: templateRows,
            update: (row, data, raw, item, tooltipPrefix) => {
                const zero = toHeatMapColor(0, item, col, imposer);
                const one = toHeatMapColor(1, item, col, imposer);
                forEachChild(row, (d, i) => {
                    const v = data[i];
                    const { bottom, height } = VerticalBarCellRenderer.compute(v, threshold, [0, 1]);
                    d.title = `${tooltipPrefix || ''}${formatter(raw[i])}`;
                    d.style.backgroundColor = v < threshold ? zero : one;
                    d.style.bottom = `${Math.round((100 * bottom) / range)}%`;
                    d.style.height = `${Math.round((100 * height) / range)}%`;
                });
            },
            render: (ctx, data, item) => {
                const zero = toHeatMapColor(0, item, col, imposer);
                const one = toHeatMapColor(1, item, col, imposer);
                const scale = CANVAS_HEIGHT / range;
                data.forEach((v, j) => {
                    ctx.fillStyle = v < threshold ? zero : one;
                    const xpos = j * cellDimension;
                    const { bottom, height } = VerticalBarCellRenderer.compute(v, threshold, [0, 1]);
                    ctx.fillRect(xpos, (range - height - bottom) * scale, cellDimension, height * scale);
                });
            },
        };
    }
    createSummary() {
        return noRenderer;
    }
}
