import { abortAbleAll } from 'lineupengine';
import { ANOTHER_ROUND } from '../internal/scheduler';
import { lazySeq, boxplotBuilder, categoricalStatsBuilder, categoricalValueCacheBuilder, dateStatsBuilder, dateValueCacheBuilder, numberStatsBuilder, dateValueCache2Value, categoricalValueCache2Value, joinIndexArrays, stringStatsBuilder, } from '../internal';
import { CategoricalColumn, Column, DateColumn, ImpositionCompositeColumn, NumberColumn, OrdinalColumn, Ranking, StringColumn, isMapAbleColumn, } from '../model';
/**
 * a render task that is already resolved
 */
export class TaskNow {
    constructor(v) {
        this.v = v;
    }
    then(onfullfilled) {
        return onfullfilled(this.v);
    }
}
/**
 * factory function for
 */
export function taskNow(v) {
    return new TaskNow(v);
}
/**
 * a render task based on an abortable promise
 */
export class TaskLater {
    constructor(v) {
        this.v = v;
    }
    then(onfullfilled) {
        return this.v.then(onfullfilled);
    }
}
export function taskLater(v) {
    return new TaskLater(v);
}
/**
 * similar to Promise.all
 */
export function tasksAll(tasks) {
    if (tasks.every((t) => t instanceof TaskNow)) {
        return taskNow(tasks.map((d) => d.v));
    }
    return taskLater(abortAbleAll(tasks.map((d) => d.v)));
}
export class MultiIndices {
    constructor(indices, maxDataIndex) {
        this.indices = indices;
        this.maxDataIndex = maxDataIndex;
        this._joined = null;
    }
    get joined() {
        if (this.indices.length === 1) {
            return this.indices[0];
        }
        if (this.indices.length === 0) {
            return new Uint8Array(0);
        }
        if (this._joined) {
            return this._joined;
        }
        return (this._joined = joinIndexArrays(this.indices, this.maxDataIndex));
    }
}
/**
 * number of data points to build per iteration / chunk
 */
const CHUNK_SIZE = 100;
export class ARenderTasks {
    constructor(options = {}) {
        this.valueCacheData = new Map();
        this.byIndex = (i) => this.data[i];
        this.data = [];
        this.options = Object.assign({
            stringTopNCount: 10,
        }, options);
    }
    byOrder(indices) {
        return lazySeq(indices).map(this.byIndex);
    }
    byOrderAcc(indices, acc) {
        return lazySeq(indices).map((i) => acc(this.data[i]));
    }
    /**
     * builder factory to create an iterator that can be used to schedule
     * @param builder the builder to use
     * @param order the order to iterate over
     * @param acc the accessor to get the value out of the data
     * @param build optional build mapper
     */
    builder(builder, order, acc, build) {
        let i = 0;
        // no indices given over the whole data
        const nextData = (currentChunkSize = CHUNK_SIZE) => {
            let chunkCounter = currentChunkSize;
            const data = this.data;
            for (; i < data.length && chunkCounter > 0; ++i, --chunkCounter) {
                builder.push(acc(i));
            }
            if (i < data.length) {
                // need another round
                return ANOTHER_ROUND;
            }
            // done
            return {
                done: true,
                value: build ? build(builder.build()) : builder.build(),
            };
        };
        let o = 0;
        const orders = order instanceof MultiIndices ? order.indices : [order];
        const nextOrder = (currentChunkSize = CHUNK_SIZE) => {
            let chunkCounter = currentChunkSize;
            while (o < orders.length) {
                const actOrder = orders[o];
                for (; i < actOrder.length && chunkCounter > 0; ++i, --chunkCounter) {
                    builder.push(acc(actOrder[i]));
                }
                if (i < actOrder.length) {
                    // need another round
                    return ANOTHER_ROUND;
                }
                // done with this order
                o++;
                i = 0;
            }
            return {
                done: true,
                value: build ? build(builder.build()) : builder.build(),
            };
        };
        return { next: order == null ? nextData : nextOrder };
    }
    builderForEach(builder, order, acc, build) {
        return this.builder({
            push: builder.pushAll,
            build: builder.build,
        }, order, acc, build);
    }
    boxplotBuilder(order, col, raw, build) {
        const b = boxplotBuilder();
        return this.numberStatsBuilder(b, order, col, raw, build);
    }
    resolveDomain(col, raw) {
        const domain = raw && isMapAbleColumn(col) ? col.getMapping().domain : [0, 1];
        return [domain[0], domain[domain.length - 1]];
    }
    statsBuilder(order, col, numberOfBins, raw, build) {
        const b = numberStatsBuilder(this.resolveDomain(col, raw !== null && raw !== void 0 ? raw : false), numberOfBins);
        return this.numberStatsBuilder(b, order, col, raw, build);
    }
    numberStatsBuilder(b, order, col, raw, build) {
        if (col instanceof NumberColumn || col instanceof OrdinalColumn || col instanceof ImpositionCompositeColumn) {
            const key = raw ? `${col.id}:r` : col.id;
            const dacc = raw
                ? (i) => col.getRawNumber(this.data[i])
                : (i) => col.getNumber(this.data[i]);
            if (order == null && !this.valueCacheData.has(key)) {
                // build and valueCache
                const vs = new Float64Array(this.data.length);
                let i = 0;
                return this.builder({
                    push: (v) => {
                        b.push(v);
                        vs[i++] = v;
                    },
                    build: () => {
                        this.setValueCacheData(key, vs);
                        return b.build();
                    },
                }, null, dacc, build);
            }
            const cache = this.valueCacheData.get(key);
            const acc = cache ? (i) => cache[i] : dacc;
            return this.builder(b, order, acc, build);
        }
        const acc = raw
            ? (i) => col.iterRawNumber(this.data[i])
            : (i) => col.iterNumber(this.data[i]);
        return this.builderForEach(b, order, acc, build);
    }
    dateStatsBuilder(order, col, template, build) {
        const b = dateStatsBuilder(template);
        if (col instanceof DateColumn) {
            if (order == null) {
                // build and valueCache
                const vs = dateValueCacheBuilder(this.data.length);
                return this.builder({
                    push: (v) => {
                        b.push(v);
                        vs.push(v);
                    },
                    build: () => {
                        this.setValueCacheData(col.id, vs.cache);
                        return b.build();
                    },
                }, null, (i) => col.getDate(this.data[i]), build);
            }
            const cache = this.valueCacheData.get(col.id);
            const acc = cache
                ? (i) => dateValueCache2Value(cache[i])
                : (i) => col.getDate(this.data[i]);
            return this.builder(b, order, acc, build);
        }
        return this.builderForEach(b, order, (i) => col.iterDate(this.data[i]), build);
    }
    categoricalStatsBuilder(order, col, build) {
        const b = categoricalStatsBuilder(col.categories);
        if (col instanceof CategoricalColumn || col instanceof OrdinalColumn) {
            if (order == null) {
                // build and valueCache
                const vs = categoricalValueCacheBuilder(this.data.length, col.categories);
                return this.builder({
                    push: (v) => {
                        b.push(v);
                        vs.push(v);
                    },
                    build: () => {
                        this.setValueCacheData(col.id, vs.cache);
                        return b.build();
                    },
                }, null, (i) => col.getCategory(this.data[i]), build);
            }
            const cache = this.valueCacheData.get(col.id);
            const acc = cache
                ? (i) => categoricalValueCache2Value(cache[i], col.categories)
                : (i) => col.getCategory(this.data[i]);
            return this.builder(b, order, acc, build);
        }
        return this.builderForEach(b, order, (i) => col.iterCategory(this.data[i]), build);
    }
    stringStatsBuilder(order, col, topN, build) {
        const b = stringStatsBuilder(topN !== null && topN !== void 0 ? topN : this.options.stringTopNCount);
        if (order == null) {
            // build and valueCache
            let i = 0;
            const vs = Array(this.data.length).fill(null);
            return this.builder({
                push: (v) => {
                    b.push(v);
                    vs[i++] = v;
                },
                build: () => {
                    this.setValueCacheData(col.id, vs);
                    return b.build();
                },
            }, null, (i) => col.getValue(this.data[i]), build);
        }
        return this.builder(b, order, (i) => col.getValue(this.data[i]), build);
    }
    dirtyColumn(col, type) {
        if (type !== 'data') {
            return;
        }
        this.valueCacheData.delete(col.id);
        this.valueCacheData.delete(`${col.id}:r`);
    }
    setValueCacheData(key, value) {
        if (value == null) {
            this.valueCacheData.delete(key);
        }
        else {
            this.valueCacheData.set(key, value);
        }
    }
    valueCache(col) {
        const v = this.valueCacheData.get(col.id);
        if (!v) {
            return undefined;
        }
        if (col instanceof DateColumn) {
            return (dataIndex) => dateValueCache2Value(v[dataIndex]);
        }
        if (col instanceof CategoricalColumn || col instanceof OrdinalColumn) {
            return (dataIndex) => categoricalValueCache2Value(v[dataIndex], col.categories);
        }
        return (dataIndex) => v[dataIndex];
    }
}
