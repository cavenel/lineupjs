import { ARenderTasks, taskNow } from './tasks';
import { toIndexArray, sortComplex, getNumberOfBins, } from '../internal';
/**
 * @internal
 */
export function sortDirect(indices, maxDataIndex, lookups) {
    const order = toIndexArray(indices, maxDataIndex);
    if (lookups) {
        sortComplex(order, lookups.sortOrders);
    }
    return order;
}
/**
 * @internal
 */
export class DirectRenderTasks extends ARenderTasks {
    constructor() {
        super(...arguments);
        this.cache = new Map();
    }
    setData(data) {
        this.data = data;
        this.cache.clear();
        this.valueCacheData.clear();
    }
    dirtyColumn(col, type) {
        super.dirtyColumn(col, type);
        if (type === 'group') {
            return; // not cached
        }
        this.cache.delete(`${col.id}:summary`);
        this.cache.delete(`${col.id}:summary:raw`);
        this.cache.delete(`${col.id}:summary:b`);
        this.cache.delete(`${col.id}:summary:braw`);
        if (type === 'summary') {
            return;
        }
        this.cache.delete(`${col.id}:data`);
        this.cache.delete(`${col.id}:data:raw`);
        this.cache.delete(`${col.id}:data:b`);
        this.cache.delete(`${col.id}:data:braw`);
    }
    dirtyRanking(ranking, type) {
        for (const col of ranking.flatColumns) {
            this.dirtyColumn(col, type);
        }
    }
    preCompute() {
        // dummy
    }
    preComputeData() {
        // dummy
    }
    preComputeCol() {
        // dummy
    }
    copyData2Summary() {
        // dummy
    }
    copyCache(col, from) {
        const fromPrefix = `${from.id}:`;
        for (const key of Array.from(this.cache.keys()).sort()) {
            if (!key.startsWith(fromPrefix)) {
                continue;
            }
            const cacheKey = `${col.id}:${key.slice(fromPrefix.length)}`;
            this.cache.set(cacheKey, this.cache.get(key));
        }
    }
    sort(_ranking, _group, indices, _singleCall, maxDataIndex, lookups) {
        return Promise.resolve(sortDirect(indices, maxDataIndex, lookups));
    }
    groupCompare(ranking, group, rows) {
        const rg = ranking.getGroupSortCriteria();
        if (rg.length === 0) {
            return taskNow([group.name.toLowerCase()]);
        }
        const o = this.byOrder(rows);
        const vs = [];
        for (const s of rg) {
            const r = s.col.toCompareGroupValue(o, group);
            if (Array.isArray(r)) {
                vs.push(...r);
            }
            else {
                vs.push(r);
            }
        }
        vs.push(group.name.toLowerCase());
        return taskNow(vs);
    }
    groupRows(_col, group, _key, compute) {
        return taskNow(compute(this.byOrder(group.order)));
    }
    groupExampleRows(_col, group, _key, compute) {
        return taskNow(compute(this.byOrder(group.order.slice(0, 5))));
    }
    groupBoxPlotStats(col, group, raw) {
        const { summary, data } = this.summaryBoxPlotStatsD(col, raw);
        return taskNow({
            group: this.boxplotBuilder(group.order, col, raw).next(Number.POSITIVE_INFINITY).value,
            summary,
            data,
        });
    }
    groupNumberStats(col, group, raw) {
        const { summary, data } = this.summaryNumberStatsD(col, raw);
        return taskNow({
            group: this.statsBuilder(group.order, col, summary.hist.length, raw).next(Number.POSITIVE_INFINITY).value,
            summary,
            data,
        });
    }
    groupCategoricalStats(col, group) {
        const { summary, data } = this.summaryCategoricalStatsD(col);
        return taskNow({
            group: this.categoricalStatsBuilder(group.order, col).next(Number.POSITIVE_INFINITY).value,
            summary,
            data,
        });
    }
    groupDateStats(col, group) {
        const { summary, data } = this.summaryDateStatsD(col);
        return taskNow({
            group: this.dateStatsBuilder(group.order, col, summary).next(Number.POSITIVE_INFINITY).value,
            summary,
            data,
        });
    }
    groupStringStats(col, group) {
        const { summary, data } = this.summaryStringStatsD(col);
        return taskNow({
            group: this.stringStatsBuilder(group.order, col, summary.topN.map((d) => d.value)).next(Number.POSITIVE_INFINITY).value,
            summary,
            data,
        });
    }
    summaryBoxPlotStats(col, raw) {
        return taskNow(this.summaryBoxPlotStatsD(col, raw));
    }
    summaryNumberStats(col, raw) {
        return taskNow(this.summaryNumberStatsD(col, raw));
    }
    summaryCategoricalStats(col) {
        return taskNow(this.summaryCategoricalStatsD(col));
    }
    summaryDateStats(col) {
        return taskNow(this.summaryDateStatsD(col));
    }
    summaryStringStats(col) {
        return taskNow(this.summaryStringStatsD(col));
    }
    summaryNumberStatsD(col, raw) {
        const ranking = col.findMyRanker();
        return this.cached('summary', col, () => {
            const order = ranking ? ranking.getOrder() : [];
            const data = this.dataNumberStats(col, raw);
            return {
                summary: this.statsBuilder(order, col, data.hist.length, raw).next(Number.POSITIVE_INFINITY).value,
                data,
            };
        }, raw ? ':raw' : '', ranking && ranking.getOrderLength() === 0);
    }
    summaryBoxPlotStatsD(col, raw) {
        const ranking = col.findMyRanker();
        return this.cached('summary', col, () => {
            const order = ranking ? ranking.getOrder() : [];
            const data = this.dataBoxPlotStats(col, raw);
            return { summary: this.boxplotBuilder(order, col, raw).next(Number.POSITIVE_INFINITY).value, data };
        }, raw ? ':braw' : ':b', ranking && ranking.getOrderLength() === 0);
    }
    summaryCategoricalStatsD(col) {
        const ranking = col.findMyRanker();
        return this.cached('summary', col, () => {
            const order = ranking ? ranking.getOrder() : [];
            const data = this.dataCategoricalStats(col);
            return {
                summary: this.categoricalStatsBuilder(order, col).next(Number.POSITIVE_INFINITY).value,
                data,
            };
        }, '', ranking && ranking.getOrderLength() === 0);
    }
    summaryDateStatsD(col) {
        const ranking = col.findMyRanker();
        return this.cached('summary', col, () => {
            const order = ranking ? ranking.getOrder() : [];
            const data = this.dataDateStats(col);
            return {
                summary: this.dateStatsBuilder(order, col, data).next(Number.POSITIVE_INFINITY).value,
                data,
            };
        }, '', ranking && ranking.getOrderLength() === 0);
    }
    summaryStringStatsD(col) {
        return this.cached('summary', col, () => {
            const ranking = col.findMyRanker().getOrder();
            const data = this.dataStringStats(col);
            return {
                summary: this.stringStatsBuilder(ranking, col, undefined).next(Number.POSITIVE_INFINITY).value,
                data,
            };
        }, '', col.findMyRanker().getOrderLength() === 0);
    }
    cached(prefix, col, creator, suffix = '', dontCache = false) {
        const key = `${col.id}:${prefix}${suffix}`;
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        const s = creator();
        if (!dontCache) {
            this.cache.set(key, s);
        }
        return s;
    }
    dataBoxPlotStats(col, raw) {
        return this.cached('data', col, () => this.boxplotBuilder(null, col, raw).next(Number.POSITIVE_INFINITY).value, raw ? ':braw' : ':b');
    }
    dataNumberStats(col, raw) {
        return this.cached('data', col, () => this.statsBuilder(null, col, getNumberOfBins(this.data.length), raw).next(Number.POSITIVE_INFINITY)
            .value, raw ? ':raw' : '');
    }
    dataCategoricalStats(col) {
        return this.cached('data', col, () => this.categoricalStatsBuilder(null, col).next(Number.POSITIVE_INFINITY).value);
    }
    dataDateStats(col) {
        return this.cached('data', col, () => this.dateStatsBuilder(null, col).next(Number.POSITIVE_INFINITY).value);
    }
    dataStringStats(col) {
        return this.cached('data', col, () => this.stringStatsBuilder(null, col).next(Number.POSITIVE_INFINITY).value);
    }
    terminate() {
        this.cache.clear();
    }
}
