// function workerMain(self: IPoorManWorkerScope) {
//   self.addEventListener('message', (evt) => {
//     self.postMessage(`Worker: ${evt.data} - Polo`);
//   });
// }
/**
 * @internal
 */
export function toFunctionBody(f) {
    const source = f.toString();
    return source.slice(source.indexOf('{') + 1, source.lastIndexOf('}'));
}
/**
 * create a blob out of the given function or string
 * @internal
 */
export function createWorkerCodeBlob(fs) {
    const sources = fs.map((d) => d.toString()).join('\n\n');
    const blob = new Blob([sources], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
}
const MIN_WORKER_THREADS = 1;
const MAX_WORKER_THREADS = Math.max(navigator.hardwareConcurrency - 1, 1); // keep one for the ui
const THREAD_CLEANUP_TIME = 10000; // 10s
/**
 * task scheduler based on web worker
 * @internal
 */
export class WorkerTaskScheduler {
    constructor(blob) {
        this.blob = blob;
        this.workers = [];
        this.cleanUpWorkerTimer = -1;
        /**
         * worker task id
         */
        this.workerTaskCounter = 0;
        this.cleanUpWorker = () => {
            // delete workers when they are not needed anymore and empty
            while (this.workers.length > MIN_WORKER_THREADS) {
                const toFree = this.workers.findIndex((d) => d.tasks.size === 0);
                if (toFree < 0) {
                    break;
                }
                const w = this.workers.splice(toFree, 1)[0];
                w.worker.terminate();
            }
            // maybe reschedule
            this.finishedTask();
        };
        for (let i = 0; i < MIN_WORKER_THREADS; ++i) {
            const w = new Worker(blob);
            this.workers.push({ worker: w, tasks: new Set(), refs: new Set(), index: i });
        }
    }
    terminate() {
        this.workers.splice(0, this.workers.length).forEach((w) => w.worker.terminate());
    }
    checkOutWorker() {
        if (this.cleanUpWorkerTimer >= 0) {
            clearTimeout(this.cleanUpWorkerTimer);
            this.cleanUpWorkerTimer = -1;
        }
        const emptyWorker = this.workers.find((d) => d.tasks.size === 0);
        if (emptyWorker) {
            return emptyWorker;
        }
        if (this.workers.length >= MAX_WORKER_THREADS) {
            // find the one with the fewest tasks
            return this.workers.reduce((a, b) => (a == null || a.tasks.size > b.tasks.size ? b : a), null);
        }
        // create new one
        const r = {
            worker: new Worker(this.blob),
            tasks: new Set(),
            refs: new Set(),
            index: this.workers.length,
        };
        this.workers.push(r);
        return r;
    }
    finishedTask() {
        if (this.cleanUpWorkerTimer === -1 && this.workers.length > MIN_WORKER_THREADS) {
            this.cleanUpWorkerTimer = setTimeout(this.cleanUpWorker, THREAD_CLEANUP_TIME);
        }
    }
    pushStats(type, args, refData, data, refIndices, indices) {
        return new Promise((resolve) => {
            const uid = this.workerTaskCounter++;
            const { worker, tasks, refs } = this.checkOutWorker();
            const receiver = (msg) => {
                const r = msg.data;
                if (r.uid !== uid || r.type !== type) {
                    return;
                }
                // console.log('worker', index, uid, 'finish', r);
                worker.removeEventListener('message', receiver);
                tasks.delete(uid);
                this.finishedTask();
                resolve(r.stats);
            };
            worker.addEventListener('message', receiver);
            tasks.add(uid);
            const msg = Object.assign({
                type,
                uid,
                refData,
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
    }
    push(type, args, transferAbles, toResult) {
        return new Promise((resolve) => {
            const uid = this.workerTaskCounter++;
            const { worker, tasks } = this.checkOutWorker();
            const receiver = (msg) => {
                const r = msg.data;
                if (r.uid !== uid || r.type !== type) {
                    return;
                }
                // console.log('worker', index, uid, 'finish', r);
                worker.removeEventListener('message', receiver);
                tasks.delete(uid);
                this.finishedTask();
                resolve(toResult ? toResult(r) : r);
            };
            worker.addEventListener('message', receiver);
            tasks.add(uid);
            const msg = Object.assign({
                type,
                uid,
            }, args);
            // console.log('worker', index, uid, msg);
            worker.postMessage(msg, transferAbles);
        });
    }
    setRef(ref, data) {
        for (const w of this.workers) {
            w.refs.add(ref);
        }
        this.broadCast('setRef', {
            ref,
            data,
        });
    }
    deleteRef(ref, startsWith = false) {
        const uid = this.workerTaskCounter++;
        const msg = {
            type: 'deleteRef',
            uid,
            ref,
            startsWith,
        };
        for (const w of this.workers) {
            // console.log(w.index, 'delete ref', ref, startsWith);
            w.worker.postMessage(msg);
            if (!startsWith) {
                w.refs.delete(ref);
                continue;
            }
            for (const r of Array.from(w.refs)) {
                if (r.startsWith(ref)) {
                    w.refs.delete(r);
                }
            }
        }
    }
    deleteRefs() {
        const uid = this.workerTaskCounter++;
        const msg = {
            type: 'deleteRef',
            uid,
            ref: '',
            startsWith: true,
        };
        for (const w of this.workers) {
            // console.log(w.index, 'delete refs');
            w.worker.postMessage(msg);
            w.refs.clear();
        }
    }
    broadCast(type, args) {
        const uid = this.workerTaskCounter++;
        // don't store in tasks queue since there is no response
        const msg = Object.assign({
            type,
            uid,
        }, args);
        // console.log('broadcast', msg);
        for (const w of this.workers) {
            w.worker.postMessage(msg);
        }
    }
}
