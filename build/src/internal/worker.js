// function workerMain(self: IPoorManWorkerScope) {
//   self.addEventListener('message', (evt) => {
//     self.postMessage(`Worker: ${evt.data} - Polo`);
//   });
// }
/**
 * @internal
 */
export function toFunctionBody(f) {
    var source = f.toString();
    return source.slice(source.indexOf('{') + 1, source.lastIndexOf('}'));
}
/**
 * create a blob out of the given function or string
 * @internal
 */
export function createWorkerCodeBlob(fs) {
    var sources = fs.map(function (d) { return d.toString(); }).join('\n\n');
    var blob = new Blob([sources], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
}
var MIN_WORKER_THREADS = 1;
var MAX_WORKER_THREADS = Math.max(navigator.hardwareConcurrency - 1, 1); // keep one for the ui
var THREAD_CLEANUP_TIME = 10000; // 10s
/**
 * task scheduler based on web worker
 * @internal
 */
var WorkerTaskScheduler = /** @class */ (function () {
    function WorkerTaskScheduler(blob) {
        var _this = this;
        this.blob = blob;
        this.workers = [];
        this.cleanUpWorkerTimer = -1;
        /**
         * worker task id
         */
        this.workerTaskCounter = 0;
        this.cleanUpWorker = function () {
            // delete workers when they are not needed anymore and empty
            while (_this.workers.length > MIN_WORKER_THREADS) {
                var toFree = _this.workers.findIndex(function (d) { return d.tasks.size === 0; });
                if (toFree < 0) {
                    break;
                }
                var w = _this.workers.splice(toFree, 1)[0];
                w.worker.terminate();
            }
            // maybe reschedule
            _this.finishedTask();
        };
        for (var i = 0; i < MIN_WORKER_THREADS; ++i) {
            var w = new Worker(blob);
            this.workers.push({ worker: w, tasks: new Set(), refs: new Set(), index: i });
        }
    }
    WorkerTaskScheduler.prototype.terminate = function () {
        this.workers.splice(0, this.workers.length).forEach(function (w) { return w.worker.terminate(); });
    };
    WorkerTaskScheduler.prototype.checkOutWorker = function () {
        if (this.cleanUpWorkerTimer >= 0) {
            clearTimeout(this.cleanUpWorkerTimer);
            this.cleanUpWorkerTimer = -1;
        }
        var emptyWorker = this.workers.find(function (d) { return d.tasks.size === 0; });
        if (emptyWorker) {
            return emptyWorker;
        }
        if (this.workers.length >= MAX_WORKER_THREADS) {
            // find the one with the fewest tasks
            return this.workers.reduce(function (a, b) { return (a == null || a.tasks.size > b.tasks.size ? b : a); }, null);
        }
        // create new one
        var r = {
            worker: new Worker(this.blob),
            tasks: new Set(),
            refs: new Set(),
            index: this.workers.length,
        };
        this.workers.push(r);
        return r;
    };
    WorkerTaskScheduler.prototype.finishedTask = function () {
        if (this.cleanUpWorkerTimer === -1 && this.workers.length > MIN_WORKER_THREADS) {
            this.cleanUpWorkerTimer = setTimeout(this.cleanUpWorker, THREAD_CLEANUP_TIME);
        }
    };
    WorkerTaskScheduler.prototype.pushStats = function (type, args, refData, data, refIndices, indices) {
        var _this = this;
        return new Promise(function (resolve) {
            var uid = _this.workerTaskCounter++;
            var _a = _this.checkOutWorker(), worker = _a.worker, tasks = _a.tasks, refs = _a.refs;
            var receiver = function (msg) {
                var r = msg.data;
                if (r.uid !== uid || r.type !== type) {
                    return;
                }
                // console.log('worker', index, uid, 'finish', r);
                worker.removeEventListener('message', receiver);
                tasks.delete(uid);
                _this.finishedTask();
                resolve(r.stats);
            };
            worker.addEventListener('message', receiver);
            tasks.add(uid);
            var msg = Object.assign({
                type: type,
                uid: uid,
                refData: refData,
                refIndices: refIndices || null,
            }, args);
            if (!refData || !refs.has(refData)) {
                // need to transfer to worker
                msg.data = data;
                if (refData) {
                    // save that this worker has this ref
                    refs.add(refData);
                }
                // console.log(index, 'set ref (i)', refData);
            }
            if (indices && (!refIndices || !refs.has(refIndices))) {
                // need to transfer
                msg.indices = indices;
                if (refIndices) {
                    refs.add(refIndices);
                }
                // console.log(index, 'set ref (i)', refIndices);
            }
            // console.log('worker', index, uid, msg);
            worker.postMessage(msg);
        });
    };
    WorkerTaskScheduler.prototype.push = function (type, args, transferAbles, toResult) {
        var _this = this;
        return new Promise(function (resolve) {
            var uid = _this.workerTaskCounter++;
            var _a = _this.checkOutWorker(), worker = _a.worker, tasks = _a.tasks;
            var receiver = function (msg) {
                var r = msg.data;
                if (r.uid !== uid || r.type !== type) {
                    return;
                }
                // console.log('worker', index, uid, 'finish', r);
                worker.removeEventListener('message', receiver);
                tasks.delete(uid);
                _this.finishedTask();
                resolve(toResult ? toResult(r) : r);
            };
            worker.addEventListener('message', receiver);
            tasks.add(uid);
            var msg = Object.assign({
                type: type,
                uid: uid,
            }, args);
            // console.log('worker', index, uid, msg);
            worker.postMessage(msg, transferAbles);
        });
    };
    WorkerTaskScheduler.prototype.setRef = function (ref, data) {
        for (var _i = 0, _a = this.workers; _i < _a.length; _i++) {
            var w = _a[_i];
            w.refs.add(ref);
        }
        this.broadCast('setRef', {
            ref: ref,
            data: data,
        });
    };
    WorkerTaskScheduler.prototype.deleteRef = function (ref, startsWith) {
        if (startsWith === void 0) { startsWith = false; }
        var uid = this.workerTaskCounter++;
        var msg = {
            type: 'deleteRef',
            uid: uid,
            ref: ref,
            startsWith: startsWith,
        };
        for (var _i = 0, _a = this.workers; _i < _a.length; _i++) {
            var w = _a[_i];
            // console.log(w.index, 'delete ref', ref, startsWith);
            w.worker.postMessage(msg);
            if (!startsWith) {
                w.refs.delete(ref);
                continue;
            }
            for (var _b = 0, _c = Array.from(w.refs); _b < _c.length; _b++) {
                var r = _c[_b];
                if (r.startsWith(ref)) {
                    w.refs.delete(r);
                }
            }
        }
    };
    WorkerTaskScheduler.prototype.deleteRefs = function () {
        var uid = this.workerTaskCounter++;
        var msg = {
            type: 'deleteRef',
            uid: uid,
            ref: '',
            startsWith: true,
        };
        for (var _i = 0, _a = this.workers; _i < _a.length; _i++) {
            var w = _a[_i];
            // console.log(w.index, 'delete refs');
            w.worker.postMessage(msg);
            w.refs.clear();
        }
    };
    WorkerTaskScheduler.prototype.broadCast = function (type, args) {
        var uid = this.workerTaskCounter++;
        // don't store in tasks queue since there is no response
        var msg = Object.assign({
            type: type,
            uid: uid,
        }, args);
        // console.log('broadcast', msg);
        for (var _i = 0, _a = this.workers; _i < _a.length; _i++) {
            var w = _a[_i];
            w.worker.postMessage(msg);
        }
    };
    return WorkerTaskScheduler;
}());
export { WorkerTaskScheduler };
//# sourceMappingURL=worker.js.map