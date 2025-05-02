import { color } from 'd3-color';
import { round } from '../internal';
import { DEFAULT_COLOR, StringColumn } from '../model';
import { cssClass, FILTERED_OPACITY } from '../styles';
import StringCellRenderer from './StringCellRenderer';
const DEFAULT_FILTERED_COLOR = (() => {
    const c = color(DEFAULT_COLOR);
    c.opacity = FILTERED_OPACITY;
    return c.toString();
})();
/**
 * renders a string with additional alignment behavior
 * one instance factory shared among strings
 */
export default class StringHistogramCellRenderer extends StringCellRenderer {
    constructor() {
        super(...arguments);
        this.title = 'TopN Histogram';
    }
    createGroup(col, context) {
        const { template, update } = hist(false);
        return {
            template,
            update: (node, group) => {
                return context.tasks.groupStringStats(col, group).then((r) => {
                    if (typeof r === 'symbol' || !r) {
                        return;
                    }
                    update(node, r.group, r.summary);
                });
            },
        };
    }
    createSummary(col, context, interactive) {
        if (interactive) {
            return super.createSummary(col, context, interactive);
        }
        const { template, update } = hist(interactive);
        return {
            template,
            update: (node) => {
                return context.tasks.summaryStringStats(col).then((r) => {
                    if (typeof r === 'symbol' || !r) {
                        return;
                    }
                    update(node, r.summary);
                });
            },
        };
    }
}
function hist(showLabels) {
    const bins = Array(5)
        .fill(0)
        .map(() => `<div class="${cssClass('histogram-bin')}" title=": 0" data-cat="" ${showLabels ? `data-title=""` : ''}><div style="height: 0; background: ${DEFAULT_COLOR}"></div></div>`)
        .join('');
    const template = `<div class="${cssClass('histogram')}">${bins}</div>`;
    return {
        template,
        update: (n, hist, gHist) => {
            const maxBin = (gHist !== null && gHist !== void 0 ? gHist : hist).topN.reduce((acc, v) => Math.max(acc, v.count), 0);
            const updateBin = (d, i) => {
                var _a;
                const bin = hist.topN[i];
                const inner = d.firstElementChild;
                d.dataset.cat = bin.value;
                if (showLabels) {
                    d.dataset.title = bin.value;
                }
                if (gHist) {
                    const { count: gCount } = (_a = gHist.topN[i]) !== null && _a !== void 0 ? _a : { count: 0 };
                    d.title = `${bin.value}: ${bin.count} of ${gCount}`;
                    inner.style.height = `${round((gCount * 100) / maxBin, 2)}%`;
                    const relY = 100 - round((bin.count * 100) / gCount, 2);
                    inner.style.background =
                        relY === 0
                            ? DEFAULT_COLOR
                            : relY === 100
                                ? DEFAULT_FILTERED_COLOR
                                : `linear-gradient(${DEFAULT_FILTERED_COLOR} ${relY}%, ${DEFAULT_COLOR} ${relY}%, ${DEFAULT_COLOR} 100%)`;
                }
                else {
                    d.title = `${bin.value}: ${bin.count}`;
                    const inner = d.firstElementChild;
                    inner.style.height = `${Math.round((bin.count * 100) / maxBin)}%`;
                }
            };
            const dataBins = hist.topN.length;
            const bins = Array.from(n.querySelectorAll(`.${cssClass('histogram-bin')}`));
            for (let i = 0; i < Math.min(bins.length, dataBins); i++) {
                updateBin(bins[i], i);
            }
            for (let i = bins.length; i < dataBins; i++) {
                const d = n.ownerDocument.createElement('div');
                d.classList.add(cssClass('histogram-bin'));
                n.appendChild(d);
                const dd = n.ownerDocument.createElement('div');
                dd.style.height = '0';
                dd.style.background = DEFAULT_COLOR;
                d.appendChild(dd);
                updateBin(d, i);
            }
            for (let i = dataBins; i < bins.length; i++) {
                bins[i].remove();
            }
        },
    };
}
