import { ABORTED } from 'lineupengine';
export { ABORTED } from 'lineupengine';
/**
 * iterator result for another round
 * @internal
 */
export var ANOTHER_ROUND = {
    value: null,
    done: false,
};
/**
 * iterator for just one entry
 * @internal
 */
export function oneShotIterator(calc) {
    return {
        next: function () { return ({ done: true, value: calc() }); },
    };
}
function thenFactory(wrappee, abort, isAborted) {
    function then(onfulfilled, onrejected) {
        var r = wrappee.then(onfulfilled, onrejected);
        return {
            then: thenFactory(r, abort, isAborted),
            abort: abort,
            isAborted: isAborted,
        };
    }
    return then;
}
/**
 * task scheduler for running tasks in idle callbacks
 * @internal
 */
var TaskScheduler = /** @class */ (function () {
    function TaskScheduler() {
        var _this = this;
        this.tasks = [];
        // idle callback id
        this.taskId = -1;
        this.runTasks = function (deadline) {
            var _loop_1 = function () {
                var task = _this.tasks.shift();
                var r = task.it.next();
                // call next till done or ran out of time
                while (!r.done && (deadline.didTimeout || deadline.timeRemaining() > 0)) {
                    r = task.it.next();
                }
                if (r.done) {
                    // resolve async
                    requestAnimationFrame(function () { return task.resolve(r.value); });
                }
                else {
                    // reschedule again
                    _this.tasks.unshift(task);
                }
            };
            // while more tasks and not timed out
            while (_this.tasks.length > 0 && (deadline.didTimeout || deadline.timeRemaining() > 0)) {
                _loop_1();
            }
            _this.taskId = -1;
            _this.reSchedule();
        };
    }
    TaskScheduler.prototype.reSchedule = function () {
        if (this.tasks.length === 0 || this.taskId > -1) {
            return;
        }
        var ww = self;
        if (ww.requestIdleCallback) {
            this.taskId = ww.requestIdleCallback(this.runTasks);
        }
        else {
            this.taskId = setTimeout(this.runTasks, 1);
        }
    };
    /**
     * pushes a task with multi hops using an iterator
     * @param id task id
     * @param it iterator to execute
     */
    TaskScheduler.prototype.pushMulti = function (id, it, abortAble) {
        var _this = this;
        if (abortAble === void 0) { abortAble = true; }
        // abort task with the same id
        var abort = function () {
            var index = _this.tasks.findIndex(function (d) { return d.id === id; });
            if (index < 0) {
                return; // too late or none
            }
            var task = _this.tasks[index];
            _this.tasks.splice(index, 1);
            task.isAborted = true;
            task.resolve(ABORTED);
        };
        {
            // abort existing
            var index = this.tasks.findIndex(function (d) { return d.id === id; });
            if (index >= 0) {
                var task_1 = this.tasks[index];
                task_1.abort();
            }
        }
        var resolve;
        var p = new Promise(function (r) {
            // called during constructor
            resolve = r;
        });
        var task = {
            id: id,
            it: it,
            result: p,
            abort: abort,
            isAborted: false,
            resolve: resolve,
        };
        var isAborted = function () { return task.isAborted; };
        this.tasks.push(task);
        this.reSchedule();
        var abortOrDummy = abortAble ? abort : function () { return undefined; };
        var isAbortedOrDummy = abortAble ? isAborted : function () { return false; };
        return {
            then: thenFactory(p, abortOrDummy, isAbortedOrDummy),
            abort: abortOrDummy,
            isAborted: isAbortedOrDummy,
        };
    };
    /**
     * pushes a simple task
     * @param id task id
     * @param calc task function
     */
    TaskScheduler.prototype.push = function (id, calc) {
        return this.pushMulti(id, oneShotIterator(calc));
    };
    /**
     * abort a task with the given id
     * @param id task id
     */
    TaskScheduler.prototype.abort = function (id) {
        var index = this.tasks.findIndex(function (d) { return d.id === id; });
        if (index < 0) {
            return false; // too late or none
        }
        var task = this.tasks[index];
        task.abort();
        return true;
    };
    TaskScheduler.prototype.abortAll = function (filter) {
        var abort = this.tasks.filter(filter);
        if (abort.length === 0) {
            return;
        }
        this.tasks = this.tasks.filter(function (d) { return !filter(d); });
        for (var _i = 0, abort_1 = abort; _i < abort_1.length; _i++) {
            var task = abort_1[_i];
            task.resolve(ABORTED);
            task.abort();
        }
    };
    TaskScheduler.prototype.clear = function () {
        if (this.taskId === -1) {
            return;
        }
        var ww = self;
        if (ww.requestIdleCallback && ww.clearIdleCallback) {
            ww.clearIdleCallback(this.taskId);
        }
        else {
            clearTimeout(this.taskId);
        }
        this.taskId = -1;
        this.tasks.splice(0, this.tasks.length).forEach(function (d) {
            d.resolve(ABORTED);
            d.abort();
        });
    };
    return TaskScheduler;
}());
export default TaskScheduler;
//# sourceMappingURL=scheduler.js.map