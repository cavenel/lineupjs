var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import Column, { Ranking, defaultGroup, } from '../model';
import ACommonDataProvider from './ACommonDataProvider';
import { DirectRenderTasks } from './DirectRenderTasks';
function createIndex2Pos(order) {
    var index2pos = [];
    for (var i = 0; i < order.length; ++i) {
        index2pos[order[i]] = i + 1;
    }
    return index2pos;
}
/**
 * a remote implementation of the data provider
 */
var RemoteDataProvider = /** @class */ (function (_super) {
    __extends(RemoteDataProvider, _super);
    function RemoteDataProvider(server, columns, options) {
        if (columns === void 0) { columns = []; }
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, columns, options) || this;
        _this.server = server;
        _this.ooptions = {
            maxCacheSize: 1000,
        };
        _this.cache = new Map();
        Object.assign(_this.ooptions, options);
        return _this;
    }
    RemoteDataProvider.prototype.getTotalNumberOfRows = function () {
        // TODO not correct
        return this.cache.size;
    };
    RemoteDataProvider.prototype.getTaskExecutor = function () {
        // FIXME
        return new DirectRenderTasks();
    };
    RemoteDataProvider.prototype.sort = function (ranking) {
        //use the server side to sort
        return this.server
            .sort(ranking)
            .then(function (order) { return ({ groups: [Object.assign({ order: order }, defaultGroup)], index2pos: createIndex2Pos(order) }); });
    };
    RemoteDataProvider.prototype.loadFromServer = function (indices) {
        return this.server.view(indices).then(function (view) {
            //enhance with the data index
            return view.map(function (v, i) {
                var dataIndex = indices[i];
                return { v: v, dataIndex: dataIndex };
            });
        });
    };
    RemoteDataProvider.prototype.view = function (indices) {
        if (indices.length === 0) {
            return Promise.resolve([]);
        }
        var base = this.fetch([indices])[0];
        return Promise.all(base).then(function (rows) { return rows.map(function (d) { return d.v; }); });
    };
    RemoteDataProvider.prototype.computeMissing = function (orders) {
        var union = new Set();
        var unionAdd = union.add.bind(union);
        orders.forEach(function (order) { return order.forEach(unionAdd); });
        // removed cached
        this.cache.forEach(function (_v, k) { return union.delete(k); });
        if (this.cache.size + union.size > this.ooptions.maxCacheSize) {
            // clean up cache
        }
        // const maxLength = Math.max(...orders.map((o) => o.length));
        return Array.from(union);
    };
    RemoteDataProvider.prototype.loadInCache = function (missing) {
        var _this = this;
        if (missing.length === 0) {
            return;
        }
        // load data and map to rows;
        var v = this.loadFromServer(missing);
        missing.forEach(function (_m, i) {
            var dataIndex = missing[i];
            _this.cache.set(dataIndex, v.then(function (loaded) { return ({ v: loaded[i], i: dataIndex }); }));
        });
    };
    RemoteDataProvider.prototype.fetch = function (orders) {
        var _this = this;
        var toLoad = this.computeMissing(orders);
        this.loadInCache(toLoad);
        return orders.map(function (order) { return order.map(function (i) { return _this.cache.get(i); }); });
    };
    RemoteDataProvider.prototype.getRow = function (index) {
        if (this.cache.has(index)) {
            return this.cache.get(index);
        }
        this.loadInCache([index]);
        return this.cache.get(index);
    };
    RemoteDataProvider.prototype.mappingSample = function (col) {
        return this.server.mappingSample(col.desc.column);
    };
    RemoteDataProvider.prototype.searchAndJump = function (search, col, first) {
        var _this = this;
        this.server.search(search, col.desc.column).then(function (indices) {
            if (indices.length > 0 && first) {
                _this.jumpToNearest(indices.slice(0, 1));
            }
            else {
                _this.jumpToNearest(indices);
            }
        });
    };
    return RemoteDataProvider;
}(ACommonDataProvider));
export default RemoteDataProvider;
//# sourceMappingURL=RemoteDataProvider.js.map