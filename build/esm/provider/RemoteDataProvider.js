import Column, { Ranking, defaultGroup, } from '../model';
import ACommonDataProvider from './ACommonDataProvider';
import { DirectRenderTasks } from './DirectRenderTasks';
function createIndex2Pos(order) {
    const index2pos = [];
    for (let i = 0; i < order.length; ++i) {
        index2pos[order[i]] = i + 1;
    }
    return index2pos;
}
/**
 * a remote implementation of the data provider
 */
export default class RemoteDataProvider extends ACommonDataProvider {
    constructor(server, columns = [], options = {}) {
        super(columns, options);
        this.server = server;
        this.ooptions = {
            maxCacheSize: 1000,
        };
        this.cache = new Map();
        Object.assign(this.ooptions, options);
    }
    getTotalNumberOfRows() {
        // TODO not correct
        return this.cache.size;
    }
    getTaskExecutor() {
        // FIXME
        return new DirectRenderTasks();
    }
    sort(ranking) {
        //use the server side to sort
        return this.server
            .sort(ranking)
            .then((order) => ({ groups: [Object.assign({ order }, defaultGroup)], index2pos: createIndex2Pos(order) }));
    }
    loadFromServer(indices) {
        return this.server.view(indices).then((view) => {
            //enhance with the data index
            return view.map((v, i) => {
                const dataIndex = indices[i];
                return { v, dataIndex };
            });
        });
    }
    view(indices) {
        if (indices.length === 0) {
            return Promise.resolve([]);
        }
        const base = this.fetch([indices])[0];
        return Promise.all(base).then((rows) => rows.map((d) => d.v));
    }
    computeMissing(orders) {
        const union = new Set();
        const unionAdd = union.add.bind(union);
        orders.forEach((order) => order.forEach(unionAdd));
        // removed cached
        this.cache.forEach((_v, k) => union.delete(k));
        if (this.cache.size + union.size > this.ooptions.maxCacheSize) {
            // clean up cache
        }
        // const maxLength = Math.max(...orders.map((o) => o.length));
        return Array.from(union);
    }
    loadInCache(missing) {
        if (missing.length === 0) {
            return;
        }
        // load data and map to rows;
        const v = this.loadFromServer(missing);
        missing.forEach((_m, i) => {
            const dataIndex = missing[i];
            this.cache.set(dataIndex, v.then((loaded) => ({ v: loaded[i], i: dataIndex })));
        });
    }
    fetch(orders) {
        const toLoad = this.computeMissing(orders);
        this.loadInCache(toLoad);
        return orders.map((order) => order.map((i) => this.cache.get(i)));
    }
    getRow(index) {
        if (this.cache.has(index)) {
            return this.cache.get(index);
        }
        this.loadInCache([index]);
        return this.cache.get(index);
    }
    mappingSample(col) {
        return this.server.mappingSample(col.desc.column);
    }
    searchAndJump(search, col, first) {
        this.server.search(search, col.desc.column).then((indices) => {
            if (indices.length > 0 && first) {
                this.jumpToNearest(indices.slice(0, 1));
            }
            else {
                this.jumpToNearest(indices);
            }
        });
    }
}
