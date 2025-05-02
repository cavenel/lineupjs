import { abortAbleAll } from 'lineupengine';
import { ANOTHER_ROUND } from '../internal/scheduler';
import { lazySeq, boxplotBuilder, categoricalStatsBuilder, categoricalValueCacheBuilder, dateStatsBuilder, dateValueCacheBuilder, numberStatsBuilder, dateValueCache2Value, categoricalValueCache2Value, joinIndexArrays, stringStatsBuilder, } from '../internal';
import { CategoricalColumn, Column, DateColumn, ImpositionCompositeColumn, NumberColumn, OrdinalColumn, Ranking, StringColumn, isMapAbleColumn, } from '../model';
/**
 * a render task that is already resolved
 */
var TaskNow = /** @class */ (function () {
    function TaskNow(v) {
        this.v = v;
    }
    TaskNow.prototype.then = function (onfullfilled) {
        return onfullfilled(this.v);
    };
    return TaskNow;
}());
export { TaskNow };
/**
 * factory function for
 */
export function taskNow(v) {
    return new TaskNow(v);
}
/**
 * a render task based on an abortable promise
 */
var TaskLater = /** @class */ (function () {
    function TaskLater(v) {
        this.v = v;
    }
    TaskLater.prototype.then = function (onfullfilled) {
        return this.v.then(onfullfilled);
    };
    return TaskLater;
}());
export { TaskLater };
export function taskLater(v) {
    return new TaskLater(v);
}
/**
 * similar to Promise.all
 */
export function tasksAll(tasks) {
    if (tasks.every(function (t) { return t instanceof TaskNow; })) {
        return taskNow(tasks.map(function (d) { return d.v; }));
    }
    return taskLater(abortAbleAll(tasks.map(function (d) { return d.v; })));
}
var MultiIndices = /** @class */ (function () {
    function MultiIndices(indices, maxDataIndex) {
        this.indices = indices;
        this.maxDataIndex = maxDataIndex;
        this._joined = null;
    }
    Object.defineProperty(MultiIndices.prototype, "joined", {
        get: function () {
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
        },
        enumerable: false,
        configurable: true
    });
    return MultiIndices;
}());
export { MultiIndices };
/**
 * number of data points to build per iteration / chunk
 */
var CHUNK_SIZE = 100;
var ARenderTasks = /** @class */ (function () {
    function ARenderTasks(options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.valueCacheData = new Map();
        this.byIndex = function (i) { return _this.data[i]; };
        this.data = [];
        this.options = Object.assign({
            stringTopNCount: 10,
        }, options);
    }
    ARenderTasks.prototype.byOrder = function (indices) {
        return lazySeq(indices).map(this.byIndex);
    };
    ARenderTasks.prototype.byOrderAcc = function (indices, acc) {
        var _this = this;
        return lazySeq(indices).map(function (i) { return acc(_this.data[i]); });
    };
    /**
     * builder factory to create an iterator that can be used to schedule
     * @param builder the builder to use
     * @param order the order to iterate over
     * @param acc the accessor to get the value out of the data
     * @param build optional build mapper
     */
    ARenderTasks.prototype.builder = function (builder, order, acc, build) {
        var _this = this;
        var i = 0;
        // no indices given over the whole data
        var nextData = function (currentChunkSize) {
            if (currentChunkSize === void 0) { currentChunkSize = CHUNK_SIZE; }
            var chunkCounter = currentChunkSize;
            var data = _this.data;
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
        var o = 0;
        var orders = order instanceof MultiIndices ? order.indices : [order];
        var nextOrder = function (currentChunkSize) {
            if (currentChunkSize === void 0) { currentChunkSize = CHUNK_SIZE; }
            var chunkCounter = currentChunkSize;
            while (o < orders.length) {
                var actOrder = orders[o];
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
    };
    ARenderTasks.prototype.builderForEach = function (builder, order, acc, build) {
        return this.builder({
            push: builder.pushAll,
            build: builder.build,
        }, order, acc, build);
    };
    ARenderTasks.prototype.boxplotBuilder = function (order, col, raw, build) {
        var b = boxplotBuilder();
        return this.numberStatsBuilder(b, order, col, raw, build);
    };
    ARenderTasks.prototype.resolveDomain = function (col, raw) {
        var domain = raw && isMapAbleColumn(col) ? col.getMapping().domain : [0, 1];
        return [domain[0], domain[domain.length - 1]];
    };
    ARenderTasks.prototype.statsBuilder = function (order, col, numberOfBins, raw, build) {
        var b = numberStatsBuilder(this.resolveDomain(col, raw !== null && raw !== void 0 ? raw : false), numberOfBins);
        return this.numberStatsBuilder(b, order, col, raw, build);
    };
    ARenderTasks.prototype.numberStatsBuilder = function (b, order, col, raw, build) {
        var _this = this;
        if (col instanceof NumberColumn || col instanceof OrdinalColumn || col instanceof ImpositionCompositeColumn) {
            var key_1 = raw ? "".concat(col.id, ":r") : col.id;
            var dacc = raw
                ? function (i) { return col.getRawNumber(_this.data[i]); }
                : function (i) { return col.getNumber(_this.data[i]); };
            if (order == null && !this.valueCacheData.has(key_1)) {
                // build and valueCache
                var vs_1 = new Float64Array(this.data.length);
                var i_1 = 0;
                return this.builder({
                    push: function (v) {
                        b.push(v);
                        vs_1[i_1++] = v;
                    },
                    build: function () {
                        _this.setValueCacheData(key_1, vs_1);
                        return b.build();
                    },
                }, null, dacc, build);
            }
            var cache_1 = this.valueCacheData.get(key_1);
            var acc_1 = cache_1 ? function (i) { return cache_1[i]; } : dacc;
            return this.builder(b, order, acc_1, build);
        }
        var acc = raw
            ? function (i) { return col.iterRawNumber(_this.data[i]); }
            : function (i) { return col.iterNumber(_this.data[i]); };
        return this.builderForEach(b, order, acc, build);
    };
    ARenderTasks.prototype.dateStatsBuilder = function (order, col, template, build) {
        var _this = this;
        var b = dateStatsBuilder(template);
        if (col instanceof DateColumn) {
            if (order == null) {
                // build and valueCache
                var vs_2 = dateValueCacheBuilder(this.data.length);
                return this.builder({
                    push: function (v) {
                        b.push(v);
                        vs_2.push(v);
                    },
                    build: function () {
                        _this.setValueCacheData(col.id, vs_2.cache);
                        return b.build();
                    },
                }, null, function (i) { return col.getDate(_this.data[i]); }, build);
            }
            var cache_2 = this.valueCacheData.get(col.id);
            var acc = cache_2
                ? function (i) { return dateValueCache2Value(cache_2[i]); }
                : function (i) { return col.getDate(_this.data[i]); };
            return this.builder(b, order, acc, build);
        }
        return this.builderForEach(b, order, function (i) { return col.iterDate(_this.data[i]); }, build);
    };
    ARenderTasks.prototype.categoricalStatsBuilder = function (order, col, build) {
        var _this = this;
        var b = categoricalStatsBuilder(col.categories);
        if (col instanceof CategoricalColumn || col instanceof OrdinalColumn) {
            if (order == null) {
                // build and valueCache
                var vs_3 = categoricalValueCacheBuilder(this.data.length, col.categories);
                return this.builder({
                    push: function (v) {
                        b.push(v);
                        vs_3.push(v);
                    },
                    build: function () {
                        _this.setValueCacheData(col.id, vs_3.cache);
                        return b.build();
                    },
                }, null, function (i) { return col.getCategory(_this.data[i]); }, build);
            }
            var cache_3 = this.valueCacheData.get(col.id);
            var acc = cache_3
                ? function (i) { return categoricalValueCache2Value(cache_3[i], col.categories); }
                : function (i) { return col.getCategory(_this.data[i]); };
            return this.builder(b, order, acc, build);
        }
        return this.builderForEach(b, order, function (i) { return col.iterCategory(_this.data[i]); }, build);
    };
    ARenderTasks.prototype.stringStatsBuilder = function (order, col, topN, build) {
        var _this = this;
        var b = stringStatsBuilder(topN !== null && topN !== void 0 ? topN : this.options.stringTopNCount);
        if (order == null) {
            // build and valueCache
            var i_2 = 0;
            var vs_4 = Array(this.data.length).fill(null);
            return this.builder({
                push: function (v) {
                    b.push(v);
                    vs_4[i_2++] = v;
                },
                build: function () {
                    _this.setValueCacheData(col.id, vs_4);
                    return b.build();
                },
            }, null, function (i) { return col.getValue(_this.data[i]); }, build);
        }
        return this.builder(b, order, function (i) { return col.getValue(_this.data[i]); }, build);
    };
    ARenderTasks.prototype.dirtyColumn = function (col, type) {
        if (type !== 'data') {
            return;
        }
        this.valueCacheData.delete(col.id);
        this.valueCacheData.delete("".concat(col.id, ":r"));
    };
    ARenderTasks.prototype.setValueCacheData = function (key, value) {
        if (value == null) {
            this.valueCacheData.delete(key);
        }
        else {
            this.valueCacheData.set(key, value);
        }
    };
    ARenderTasks.prototype.valueCache = function (col) {
        var v = this.valueCacheData.get(col.id);
        if (!v) {
            return undefined;
        }
        if (col instanceof DateColumn) {
            return function (dataIndex) { return dateValueCache2Value(v[dataIndex]); };
        }
        if (col instanceof CategoricalColumn || col instanceof OrdinalColumn) {
            return function (dataIndex) { return categoricalValueCache2Value(v[dataIndex], col.categories); };
        }
        return function (dataIndex) { return v[dataIndex]; };
    };
    return ARenderTasks;
}());
export { ARenderTasks };
//# sourceMappingURL=tasks.js.map